# Evidence Lifecycle (EAD Enterprise Suite)

Create and manage certified evidence chains, including large file uploads.

## Key concepts

- **Evidence group**: A container that groups related evidence items. Must exist before adding evidence.
- **evidenceType**: `FILE` (documents), `PHOTO`, `VIDEO`, or `WEB_PLUGIN`.
- **custodyType**: `INTERNAL` (EAD stores the file) or `EXTERNAL` (you store the file, EAD certifies the hash).
- **Sealing**: Certifies the entire group — timestamped and legally binding. Long-running (MCP task stays open until complete).
- **Large files**: Files ≥ 10 MB require the multipart upload flow via `large_evidence_upload_initiate`.

## IDs you need before starting

- `caseFileId` — from `case_file_list`

---

## Standard flow (< 10 MB)

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

### Step 3 — Upload the file

```
PUT <uploadFileUrl>
Content-Type: application/octet-stream
Body: <raw file bytes>
```

Upload the raw file bytes to the presigned S3 URL via HTTP PUT. No auth headers needed — the URL already contains the credentials.

> Skip this step for `custodyType: "EXTERNAL"` — EAD only records the hash, you keep the file.

### Step 4 — Seal the group

```
evidence_seal(
  id: "<group-uuid>",
  caseFileId: "<uuid>",
  evidencesCount: <number-of-evidence-items>
)
```

Returns immediately — the group transitions asynchronously OPEN → CLOSING → CLOSED. Poll `evidence_group_list` until status is `CLOSED` before linking evidences to a Certificado de evidencia. `evidencesCount` must match the number of evidence items added.

### Step 5 — Read / verify

```
evidence_list(caseFileId, evidenceGroupId)              # list all items in the group
evidence_get(caseFileId, evidenceGroupId, id)           # get details of a single item (all 3 required)
evidence_group_list(caseFileId)                         # list all groups in the case file
```

---

## Large file flow (≥ 10 MB)

### Step 1 — Create evidence group (same as above)

### Step 2 — Initiate multipart upload

```
large_evidence_upload_initiate(
  id: "<new-uuid>",
  caseFileId: "<uuid>",
  evidenceGroupId: "<group-uuid>",
  title: "Large file evidence",
  fileName: "archive.zip",
  hash: "<sha256-hex>",
  fileSize: <bytes>,              # required — total file size in bytes
  custodyType: "INTERNAL"
)
```

Returns a list of presigned URLs for each chunk.

### Step 3 — Upload chunks

Upload each chunk to its corresponding presigned URL via HTTP PUT. Chunk size is specified by the API response.

### Step 4 — Complete the upload

```
large_evidence_upload_complete(
  id: "<upload-id>",
  caseFileId: "<uuid>",
  evidenceGroupId: "<group-uuid>"
)
```

### Step 5 — Seal the group (same as standard flow)

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
