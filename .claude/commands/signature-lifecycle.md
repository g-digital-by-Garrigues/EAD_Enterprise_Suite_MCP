# Signature Lifecycle (EAD Enterprise Suite)

Manage the full digital signature workflow: create a signature request, upload documents to S3, add participants, wait for processing, set signature coordinates, activate, and retrieve the legal certificate.

## Key Concepts

- **Signature types**: `INTERPOSITION` (basic) or `ADVANCED` (qualified). Advanced requires a real digital certificate from the signer.
- **Close condition**: `ALL_REQUIRED` (everyone must sign) or `PARTIAL_ALLOWED` (first signer closes it).
- **Sequence**: `PARALLEL` (all sign simultaneously) or `CONFIGURABLE` (ordered signing).
- **WhatsApp notifications** (`sendWaUrl: true`): Only supported for `INTERPOSITION` type. Has no effect on `ADVANCED` signatures.
- **Document states**: DRAFT → processing → `READY_TO_SIGN`. Must be `READY_TO_SIGN` before activation.
- **Coordinates required**: Signature placement coordinates must be set on each signatory's document before the request can be activated.

## IDs you need before starting

- `caseFileId` — obtain via `case_file_list` (look at the `id` field, NOT the code like GN652)
- `userId` — returned by `session_login` in the `userId` field (decoded from JWT; use `sub` claim)

## Flow

### 1. Create the signature request

```
signature_request_create(
  caseFileId: "<uuid>",
  id: "<new-uuid>",          # generate a random UUID
  name: "My Signature Request",
  language: "es_ES",
  deadline: "2026-05-30T23:59:59.000Z",   # must be within ~10 days
  signatureType: "INTERPOSITION",          # or "ADVANCED"
  closeCondition: "ALL_REQUIRED",          # or "PARTIAL_ALLOWED"
  sequence: "PARALLEL",
  dashboardUrl: "ANONYMIZED"
)
```

Returns a signature request object with `id` and `status: DRAFT`.

### 2. Register document

```
signature_request_add_document(
  caseFileId: "<uuid>",
  requestId: "<sig-request-uuid>",
  id: "<new-uuid>",           # generate a random UUID
  title: "Document Title",
  fileName: "document.pdf",
  fileSize: <bytes>,
  hash: "<sha256-hex>",       # SHA-256 hex digest of the file
)
```

Returns `{ url: "<presigned-s3-url>", ... }`. The URL is for upload only.

### 3. Upload document to S3

Upload the raw file bytes to the presigned URL using HTTP PUT:
```
PUT <presigned-url>
Content-Type: application/pdf
x-amz-checksum-sha256: <base64-encoded SHA-256>  # Base64 of the same hash
```

### 4. Add participants (signatories)

```
signature_participant_create(
  caseFileId: "<uuid>",
  requestId: "<sig-request-uuid>",
  id: "<new-uuid>",
  role: "SIGNATORY",
  email: "signer@example.com",
  firstName: "First",
  lastName: "Last",
  phonePrefix: "+34",          # must include the + sign
  phoneNumber: "600000000",
  sendWaUrl: true              # WhatsApp link — ONLY works for INTERPOSITION type
)
```

### 5. Poll until documents are READY_TO_SIGN

Call `signature_document_list(caseFileId, requestId)` and wait until each document's `status` is `READY_TO_SIGN`. Typically takes ~30 seconds for files under 4 MB. Poll every 5–10 seconds.

Do NOT activate before this step — the API will reject the request.

### 6. Set signature coordinates per signatory

Each signatory needs a signature position on each document. Use the HTTP API directly (no MCP tool for this):
```
PUT /case-files/{caseFileId}/signature-requests/{requestId}/documents/{documentId}/signatories/{signatoryId}/coordinates
Body: { "coordinates": [{ "page": 1, "x": 30, "y": 230 }] }
```

The `signatoryId` is found in the `signature_document_list` response under each document's `signatories` array. Coordinates are in PDF points from the bottom-left corner.

### 7. Activate

Call `activate_signature_request(caseFileId, requestId)`. This transitions the request to `ACTIVE` and sends signing invitations to all participants.

### 8. Monitor and retrieve certificate

- `signature_request_get(caseFileId, requestId)` — check overall status
- `signature_document_list(caseFileId, requestId)` — check per-document signing progress
- `signature_certificate_get(caseFileId, requestId)` — retrieve the final legal certificate (only once status is CLOSED/SIGNED)

## Status transitions

```
DRAFT → (activate) → ACTIVE → PARTIALLY_SIGNED → SIGNED → CLOSED
                            ↘ (cancel) → CANCELLED
```

## Example

"Have hugo.alonso@garrigues.com sign the collaboration agreement PDF."

```
1. session_login()                          → userId
2. case_file_list(userId)                  → pick caseFileId
3. signature_request_create(...)           → requestId
4. signature_request_add_document(...)     → { url, documentId }
5. PUT <url> with PDF bytes + checksum
6. signature_participant_create(...)       → participantId
7. [poll] signature_document_list(...)     → wait for READY_TO_SIGN
8. [curl] PUT .../signatories/{id}/coordinates
9. activate_signature_request(caseFileId, requestId)
10. [later] signature_certificate_get(...)
```
