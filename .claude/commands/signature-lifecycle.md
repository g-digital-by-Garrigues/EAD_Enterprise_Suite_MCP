# Signature Lifecycle (EAD Enterprise Suite)

Manage the full digital signature workflow via EAD Enterprise Suite.

## Quick path (recommended)

Use `signature_request_full_create` to handle the **entire flow in a single call** — it downloads the document, computes the SHA-256, uploads to S3, adds participants, sets coordinates, and activates. The task stays open until all signatories sign or reject.

```
signature_request_full_create(
  caseFileId: "<uuid>",           # from case_file_list
  name: "My Signature Request",
  language: "es_ES",
  signatureType: "INTERPOSITION", # or "ADVANCED"
  deadline: "2026-06-30T23:59:59.000Z",
  documentUrl: "https://example.com/contract.pdf",
  documentTitle: "Collaboration Agreement",
  signatories: [
    {
      firstName: "Ana",
      lastName: "García",
      email: "ana@empresa.com",
      phonePrefix: "+34",         # must include the + sign
      phoneNumber: "600000000",
      signaturePage: 1,
      signatureX: 30,
      signatureY: 230
    }
  ]
)
```

Returns when all participants have signed or when one rejects.

---

## Step-by-step path (advanced / fine-grained control)

Use the individual tools when you need custom control over each step.

### Key concepts

- **Signature types**: `INTERPOSITION` (electronic, placement box) or `ADVANCED` (qualified, requires a digital certificate from the signer).
- **Close condition**: `ALL_REQUIRED` (everyone must sign) or `PARTIAL_ALLOWED` (first signer closes it).
- **Sequence**: `PARALLEL` (all sign simultaneously) or `CONFIGURABLE` (ordered signing).
- **WhatsApp** (`sendWaUrl: true`): Only supported for `INTERPOSITION` type.
- **Document states**: DRAFT → processing → `READY_TO_SIGN`. Must be `READY_TO_SIGN` before activation.
- **Coordinates**: Required for **all** signature types (both `INTERPOSITION` and `ADVANCED`). Set before activation via `signature_coordinate_set`. Use `signature_request_full_create` to skip manual coordinate setup.

### IDs you need before starting

- `caseFileId` — from `case_file_list` (use the `id` UUID, not the code like PR82)
- `userId` — returned by `session_login` in the `userId` field

### Step 1 — Create the signature request

```
signature_request_create(
  caseFileId: "<uuid>",
  id: "<new-uuid>",
  name: "My Signature Request",
  language: "es_ES",
  deadline: "2026-06-30T23:59:59.000Z",
  signatureType: "INTERPOSITION",
  closeCondition: "ALL_REQUIRED",
  sequence: "PARALLEL"
)
```

Returns `{ id, status: "DRAFT" }`.

### Step 2 — Register document

```
signature_request_add_document(
  caseFileId: "<uuid>",
  requestId: "<sig-request-uuid>",
  id: "<new-uuid>",
  title: "Document Title",
  fileName: "document.pdf",
  fileSize: <bytes>,
  hash: "<sha256-hex>"       # SHA-256 hex digest of the file
)
```

Returns `{ url: "<presigned-s3-url>", id: "<documentId>" }`.

### Step 3 — Upload document to S3

```
PUT <presigned-url>
Content-Type: application/octet-stream
x-amz-checksum-sha256: <base64-encoded SHA-256>   # base64 of the same hash
Body: <raw file bytes>
```

### Step 4 — Add participants

```
signature_participant_create(
  caseFileId: "<uuid>",
  requestId: "<sig-request-uuid>",
  id: "<new-uuid>",
  role: "SIGNATORY",
  firstName: "Ana",
  lastName: "García",
  email: "ana@empresa.com",
  phonePrefix: "+34",         # must include the + sign
  phoneNumber: "600000000",
  linkToAllDocuments: true
)
```

### Step 5 — Poll until READY_TO_SIGN

Call `signature_document_list(caseFileId, requestId)` every 5–10 seconds until all documents show `status: "READY_TO_SIGN"`. Typically 15–60 seconds for files under 4 MB.

**Do not activate before this step — the API will reject it.**

### Step 6 — Set signature coordinates (all types)

```
signature_coordinate_set(
  caseFileId: "<uuid>",
  requestId: "<sig-request-uuid>",
  documentId: "<doc-uuid>",        # the id you passed to signature_request_add_document
  signatoryId: "<participant-uuid>",
  coordinates: [{ page: 1, x: 30, y: 230 }]
)
```

Coordinates are PDF points from the bottom-left corner. Required for **both** `INTERPOSITION` and `ADVANCED` types. Call once per signatory per document. `signature_request_full_create` handles this automatically.

### Step 7 — Activate

```
activate_signature_request(caseFileId, requestId)
```

Transitions to `ACTIVE` and sends signing invitations to all participants.

### Step 8 — Monitor and retrieve certificate

- `signature_request_get(caseFileId, requestId)` — overall status
- `signature_document_list(caseFileId, requestId)` — per-document signing progress
- `signature_certificate_get(caseFileId, requestId)` — final legal certificate (only once `SIGNED` or `CLOSED`)

---

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Skip `signature_coordinate_set` for `ADVANCED` type | `activate_signature_request` fails — coordinates required for all types | Always call `signature_coordinate_set` before activating, regardless of type |
| Use the S3 resource UUID as `documentId` | Tool call fails (wrong ID) | Use the `id` you passed to `signature_request_add_document`, not the UUID in the S3 URL |
| Add participant with `ADVANCED` type but no phone | API rejects with `isDefined` on `phoneNumber`/`phonePrefix` | Always supply `phoneNumber` + `phonePrefix` for ADVANCED signatories |
| `activate_signature_request` before documents reach `READY_TO_SIGN` | API error | Poll `signature_document_list` until status is `READY_TO_SIGN` |

## Cancel a request

Active requests can be cancelled before all signatories have signed:

```
signature_request_cancel(caseFileId, requestId)
```

## Status transitions

```
DRAFT → (activate) → ACTIVE → PARTIALLY_SIGNED → SIGNED → CLOSED
                            ↘ (cancel) → CANCELLED
                            ↘ (all reject) → REJECTED
```

## Example — full step-by-step sequence

```
1. session_login()                                    → userId
2. case_file_list(userId)                             → caseFileId
3. signature_request_create(...)                      → requestId
4. signature_request_add_document(...)                → { url, documentId }
5. PUT <url> with PDF bytes + checksum header
6. signature_participant_create(...)                  → participantId
7. [poll] signature_document_list(...)                → wait for READY_TO_SIGN
8. signature_coordinate_set(..., documentId, participantId)  ← all types
9. activate_signature_request(caseFileId, requestId)
10. [later] signature_certificate_get(...)            → legal certificate
```
