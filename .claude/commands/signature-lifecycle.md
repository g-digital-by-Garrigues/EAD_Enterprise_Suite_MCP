# Signature Lifecycle (EAD Enterprise Suite)

Manage the full digital signature workflow via EAD Enterprise Suite.

## Step-by-step path

Use the individual tools when you need custom control over each step.

### Key concepts

- **Signature types**: `INTERPOSITION` (electronic, placement box) or `ADVANCED` (qualified, requires a digital certificate from the signer).
- **Close condition**: `ALL_REQUIRED` (everyone must sign) or `PARTIAL_ALLOWED` (first signer closes it).
- **Sequence**: `PARALLEL` (all sign simultaneously) or `CONFIGURABLE` (ordered signing).
- **WhatsApp/simple signing link**: currently only supported for `INTERPOSITION`
  (simple signature). `ADVANCED` does not currently support WhatsApp delivery.
- **Advanced OTP**: `ADVANCED` signatures require `phonePrefix` and
  `phoneNumber`; the signer receives the OTP through that phone channel.
- **Document states**: DRAFT → processing → `READY_TO_SIGN`. Must be `READY_TO_SIGN` before activation.
- **Coordinates**: Required for **all** signature types (both `INTERPOSITION` and `ADVANCED`). Set before activation via `signature_coordinate_set`.

### IDs you need before starting

- `caseFileId` — from `case_file_list` (use the `id` UUID, not the code like PR82)
- `userId` — returned by `session_info` (no parameters needed)

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

Returns `{}` on success (the `id` you provided becomes the requestId).

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

Returns `{ url: "<presigned-s3-url>" }`. The documentId is the `id` you passed in this call.

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

#### The three roles, and the one id space

`role` is the only thing that distinguishes the three kinds of participant, and there is **one
create call** for all of them:

| `role` | What they do | Extra steps |
|---|---|---|
| `SIGNATORY` | must sign the document | needs coordinates on every PDF; `phonePrefix`+`phoneNumber` are mandatory for `ADVANCED` |
| `OBSERVER` | receives a read-only copy, never signs | none |
| `VALIDATOR` | must approve before *its* signatory can sign | do **not** pass `groupId` or `linkToAllDocuments`; link it afterwards with `assign_validator_to_signatory` |

**`participantId`, `signatoryId` and `validatorId` are the same id** — the UUID *you* generate and
pass as `id`. The create call returns **HTTP 201 with no body**, so nothing is handed back: keep the
id you minted. Which name it goes by depends only on the role you created it with.

There is one id space, but the **role-scoped endpoints only accept ids of the matching role**.
Passing a `VALIDATOR`'s id where a `signatoryId` is expected returns `404 "Signatory not found"`
(live-tested on INT, 2026-09-07). If you have lost track of who is who, call
`signature_participant_list(caseFileId, requestId)` — it returns every participant with its `role`,
contact details, and `valid`/`validationError`.

```
signature_participant_list(caseFileId, requestId)
#  → [{ id, role: "SIGNATORY" | "OBSERVER" | "VALIDATOR", firstName, lastName, email, valid, ... }]
```

Reading them back, by scope:

| I want... | Tool |
|---|---|
| every participant of the request, with roles | `signature_participant_list` |
| the signers of one document, with per-document status | `signature_document_signatory_list` |
| the observers of one document | `signature_document_observer_list` |
| the documents one signatory still has to sign | `signature_signatory_progress_list` |
| the validators linked to one signatory | `signature_validator_list` |

Fixing mistakes before activation: `signature_participant_update` (contact details — the role is
**not** updatable), `signature_participant_delete` (drop one person, and the way to change a role),
`signature_participant_invalid_purge` (drop everyone the platform marked `valid: false`),
`signature_validator_unassign` (remove a validator link without removing the person).

### Step 5 — Poll until READY_TO_SIGN

Call `signature_request_get(caseFileId, requestId)` and inspect the document statuses. Alternatively verify with the API directly. Typically 15–60 seconds for files under 4 MB.

**Do not activate before documents are processed — the API will return an error.**
Activation requires all of these to be true:

- at least one `SIGNATORY` exists,
- all documents have been uploaded to their presigned URLs,
- every uploaded document has finished backend processing and is `READY_TO_SIGN`,
- every PDF has signature coordinates for the required signatories.

> Note: neither participant list reports **document processing** status. Use
> `signature_request_get` to check whether documents reached `READY_TO_SIGN`.
> `signature_document_list(caseFileId, requestId)` lists the request's documents,
> and `signature_document_signatory_list(..., documentId)` reports each signatory's progress on one
> of them — that is per-*person* status, not per-*document* processing.

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

Coordinates are PDF points from the bottom-left corner. Required for **both** `INTERPOSITION` and `ADVANCED` types. Call once per signatory per document.

### Step 7 — Activate

```
activate_signature_request(caseFileId, requestId)
```

Transitions to `ACTIVE` and sends signing invitations to all participants.

### Step 8 — Monitor and retrieve certificate

- `signature_request_get(caseFileId, requestId)` — overall status
- `signature_document_list(caseFileId, requestId)` — the request's documents and their statuses
- `signature_document_signatory_list(caseFileId, requestId, documentId)` — each signatory's signing progress on one document
- `signature_certificate_get(caseFileId, requestId, documentId)` — final legal certificate for a specific document (only once `SIGNED`)

---

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Skip `signature_coordinate_set` for `ADVANCED` type | `activate_signature_request` fails — coordinates required for all types | Always call `signature_coordinate_set` before activating, regardless of type |
| Use the S3 resource UUID as `documentId` | Tool call fails (wrong ID) | Use the `id` you passed to `signature_request_add_document`, not the UUID in the S3 URL |
| Add participant with `ADVANCED` type but no phone | API rejects with `isDefined` on `phoneNumber`/`phonePrefix` | Always supply `phoneNumber` + `phonePrefix` for ADVANCED signatories |
| `activate_signature_request` before documents reach `READY_TO_SIGN` | API error | Poll `signature_request_get` until uploaded documents are processed/READY_TO_SIGN |

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
1. session_info()                                     → userId
2. case_file_list(userId)                             → caseFileId
3. signature_request_create(...)                      → requestId (= id you provided)
4. signature_request_add_document(...)                → { url }  (documentId = id you provided)
5. PUT <url> with PDF bytes + checksum header
6. signature_participant_create(...)                  → participantId (= id you provided)
7. [poll] signature_request_get(...)                  → wait until document status READY_TO_SIGN
8. signature_coordinate_set(..., documentId, participantId)  ← all types
9. activate_signature_request(caseFileId, requestId)
10. [later] signature_certificate_get(caseFileId, requestId, documentId)  → legal certificate
```
