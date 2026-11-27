# Evidence Lifecycle (EAD Enterprise Suite)

Create and manage certified evidence chains, including large file uploads.

## Key concepts

- **Evidence group**: A container that groups related evidence items. Must exist before adding evidence.
- **evidenceType**: `FILE` (documents), `PHOTO`, `VIDEO`, or `WEB_PLUGIN`.
- **custodyType**: `INTERNAL` (EAD stores the file) or `EXTERNAL` (you store the file, EAD certifies the hash).
- **Sealing**: Closes the group. The API does not require it before you link the group's evidences to a dossier or certify them, but it is advised; the certificate itself is a dossier (`/dossier-lifecycle`). Asynchronous: `evidence_seal` returns immediately and the group moves OPEN → CLOSING → CLOSED (Step 4).
- **Large files**: `evidence_upload` takes local files up to 1 GiB (`contentBase64` up to ~10 MB). Larger files go through `large_evidence_upload` (local path only, up to the deployment's `maxLargeEvidenceSizeMB`: 125000 MB (platform setting) on EAD Enterprise Suite).

## IDs you need before starting

- `caseFileId` — from `case_file_list`

The case file must be `OPEN`: while it is `CLOSED`, `evidence_group_create`, `evidence_create` and
`evidence_upload` are refused (409 `CaseFileStatusNotOpen`). Large evidence uploads are not checked
against it. Reopen it with `case_file_update` `status: "OPEN"` (editor role or higher; the user's
personal case file cannot be updated), then confirm with `case_file_get`.

---

## Standard flow (files up to 1 GiB)

### Step 1 — Create evidence group

```
evidence_group_create(
  id: "<new-uuid>",
  caseFileId: "<uuid>",
  evidenceType: "FILE",            # FILE | PHOTO | VIDEO | WEB_PLUGIN
  name: "Group name (max 64 chars)",
  description: "Optional description (max 160 chars)"
)
```

### Step 2 — Create evidence item

```
evidence_create(
  id: "<new-uuid>",
  caseFileId: "<uuid>",
  evidenceGroupId: "<group-uuid>",
  title: "Evidence title (max 128 chars)",
  fileName: "document.pdf",
  hash: "<sha256-hex>",           # SHA-256 hex digest of the file
  custodyType: "INTERNAL"         # INTERNAL | EXTERNAL
)
```

Returns `{ uploadFileUrl: "<presigned-s3-url>", ... }`.

> **Shortcut for local files — `evidence_upload`:** instead of hashing + `evidence_create` + manual PUT, call `evidence_upload` with the local file (`filePath` in stdio mode, or `contentBase64`) plus `caseFileId`, `evidenceGroupId`, `title`, `fileName`. It computes the SHA-256, registers the evidence, and uploads the bytes in one step. (`filePath` is rejected in HTTP mode — use `contentBase64` there.)

### Step 3 — Upload the file

```
PUT <uploadFileUrl>
Content-Type: application/octet-stream
x-amz-checksum-sha256: <base64-encoded SHA-256>   # base64 of the same hash (not hex)
Body: <raw file bytes>
```

Upload the raw file bytes to the presigned S3 URL via HTTP PUT. The `x-amz-checksum-sha256` header is required — compute it with: `openssl dgst -sha256 -binary <file> | base64`

> Skip this step for `custodyType: "EXTERNAL"` — EAD only records the hash, you keep the file.

### Step 4 — Seal the group

```
evidence_seal(
  id: "<group-uuid>",
  caseFileId: "<uuid>",
  evidencesCount: <number-of-evidence-items>
)
```

Returns immediately — the group transitions asynchronously OPEN → CLOSING → CLOSED. `evidencesCount` is the number of evidences in the group: count them with `evidence_list`, not the `evidence_create` calls (evidences may come from `evidence_upload` or large uploads, or have been deleted).

**Completion detection:** every client polls — `evidence_group_list` until `status: CLOSED`.

### Step 5 — Read / verify

```
evidence_list(caseFileId, evidenceGroupId)              # list all items in the group
evidence_get(caseFileId, evidenceGroupId, id)           # get details of a single item (all 3 required)
evidence_group_list(caseFileId)                         # list all groups in the case file
```

---

## Large file flow (over 1 GiB)

`evidence_upload` takes local files up to 1 GiB. Above that — up to the deployment's
`maxLargeEvidenceSizeMB`, 125000 MB (platform setting) on EAD Enterprise Suite — use
`large_evidence_upload`. It takes a **local path only** (stdio mode): the server streams the file from
its own disk in chunks.

**Where it works:** an MCP server running on the machine that holds the file — a local client
(Claude Desktop / Code, `npx`) or Smithery (which installs it locally). **Not** in hosted (HTTP) mode
(the server cannot see your files), **not** in the Docker image (it runs in HTTP mode, which refuses every
file path, even on a mounted volume), and **not in n8n** (the n8n node cannot upload one:
`large_evidence_upload` and `large_evidence_upload_initiate` are left out of it; `_get`, `_cancel` and
`_complete` stay, for uploads started elsewhere). In those cases, run the MCP locally for the large upload.

### Step 1 — Create the evidence group (same as above; you must be its creator)

The platform takes chunks only from the group's creator, and only into an OPEN group:
`large_evidence_upload` checks both before it creates anything.

### Step 2 — Start the upload

```
large_evidence_upload(
  caseFileId: "<uuid>",
  evidenceGroupId: "<group-uuid>",
  file: { source: "path", path: "/absolute/path/archive.zip" },
  title: "Large file evidence"      # required for a new upload
)
→ { status: "in_progress" | "complete", evidenceId, uploadId, chunksDone, chunksTotal, next }
```

The upload runs inside the MCP server, chunk by chunk (chunk size and size cap come from the
deployment's settings; a file over the cap is refused before anything is created). The call returns
within 50 s with the `evidenceId` — keep it.

### Step 3 — Follow it until complete

While `status` is `in_progress`, call `large_evidence_upload` again with the `evidenceId` and the
**same file**. The upload keeps running between calls; each call waits up to `timeBudgetSeconds`
(default 50) and reports progress. If your client times out, just call again. If the server restarts,
that call resumes from the platform's record: chunks already uploaded are never sent again. A
temporary failure is retried inside the server; a permanent one (for example, the file changed during
the upload) stops the upload and the error says what to do.

### Step 4 — Wait for the evidence

The platform finishes the evidence asynchronously after the last chunk. Wait until
`evidence_get(evidenceId)` returns it before sealing. `large_evidence_upload_get` (by `evidenceId`)
shows progress while the upload runs; it answers 404 once the platform has finished the evidence (the
upload record is removed) or after a cancellation.

### Step 5 — Close the group

- No other large upload running in the group → `evidence_seal` (same as the standard flow).
- Other large uploads still running → `large_evidence_upload_complete(id: "<new-uuid>", ...)` files a
  request; the platform closes the group when a large upload in it next ends (finishes, is cancelled,
  or has its evidence deleted), if the group holds at least one evidence.
- Do not file that request with nothing running: it stays pending and would close the group later,
  unasked. Closing is irreversible — confirm with your user first.

### Cancel an unfinished upload

```
large_evidence_upload_cancel(caseFileId, evidenceGroupId, id: "<uploadId>")   # the UPLOAD id
```

Irreversible. Refused (409) if the evidence is already linked to a dossier.

### Low-level tools

`large_evidence_upload_initiate` only registers an upload (`id`, `evidenceId`, `totalSizeMB`, `title`,
`fileName`, `capturedAt`) and returns nothing — no upload URLs. The chunk endpoints are not exposed as
tools, so it cannot upload a file by itself: use `large_evidence_upload`.
`large_evidence_upload` can continue an upload registered there only if `totalSizeMB` was computed
the way it computes it: bytes ÷ 1,048,576, rounded up to 6 decimals. Whether the platform's "MB"
means 10^6 or 2^20 bytes is not confirmed.

---

## Maintain evidences and groups

Every tool takes `caseFileId`. Group tools take the group's id as `id`; evidence tools take
`evidenceGroupId` and the evidence's id as `id`. Updates and deletes return no body — confirm with
`evidence_group_get` / `evidence_get`.

| Tool | Does | Rules |
|---|---|---|
| `evidence_group_get` | Reads one group: `status` (`OPEN`, `CLOSING`, `CLOSED`), `evidenceStats`, `createdBy` | Use it to check whether a group is sealed before linking it or deleting it, and who created it (large uploads need the creator) |
| `evidence_group_update` | Renames the group or changes its `description` | `name` is required even when unchanged |
| `evidence_group_delete` | Discards the group; its evidences go with it. **Irreversible** | Refused when the group is `CLOSING` or already discarded, `OPEN` with any `COMPLETED` evidence, or `CLOSED` with no evidence or any evidence other than capture-metadata records: in practice neither a sealed group with real evidence nor an empty sealed group can be deleted |
| `evidence_update` | Changes `title`, or sets `relevant` (below) | Both fields optional |
| `evidence_delete` | Deletes one evidence (logical delete). **Irreversible** | Allowed only when the evidence is `COMPLETED`, still waiting for its file (INTERNAL, bytes not uploaded), or a required timestamp ended in `ERROR`; refused while it is processing and when it is under, or entering, qualified archiving |
| `evidence_download_url` | Returns `downloadFileUrl`, the evidence's file | The evidence must belong to that case file |

**`relevant`.** Evidences created through the API (`evidence_create`, `evidence_upload`,
`large_evidence_upload`) start with `relevant: true`. `dossier_group_certify` called without
`evidenceIds` certifies only the group's relevant evidences — by default, all of them. To leave one out of
an express dossier, set `relevant: false` with `evidence_update` (or pass `evidenceIds`).
`dossier_evidence_list_to_link` can filter on `relevant`.

---

## Example — standard flow

"Register a signed PDF contract as certified evidence."

```
1. case_file_list(userId)                    → caseFileId
2. evidence_group_create(...)                → groupId
3. evidence_create(..., hash: sha256(file))  → { uploadFileUrl, id: evidenceId }
4. PUT <uploadFileUrl> with file bytes
5. evidence_seal(id: groupId, evidencesCount: 1)
   ← returns immediately; poll evidence_group_list for status=CLOSED
6. evidence_list(caseFileId, groupId)        → verify status: COMPLETED
```
