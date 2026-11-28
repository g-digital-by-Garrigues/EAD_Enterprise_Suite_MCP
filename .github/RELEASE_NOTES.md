# EAD Enterprise Suite MCP v2.1.0

Large evidence uploads, and the rest of the evidence and signature lifecycle. 97 tools,
up from 86. Nothing that works in 2.0.0 stops working: the four tools retired below have
been refused by the platform to every credential this server accepts since 2.0.0.

## New: large evidence uploads

`large_evidence_upload` uploads one file as one evidence, up to the deployment's
`maxLargeEvidenceSizeMB` (125000 MB on EAD Enterprise Suite), in chunks, and resumes an
interrupted upload. **Local path only:** the server streams the file from its own disk,
so it works with a local MCP over stdio (or Smithery), **not** in the Docker image or
any HTTP-hosted deployment, which refuse file paths. `large_evidence_upload_cancel`
discards an upload that has not finished.

## Also new

- **Evidence:** get an evidence group; update and delete evidences and evidence groups;
  a download URL for an evidence.
- **Case files:** `case_file_update`.
- **Signatures:** the signed-document URL, the certificate package URL, list requests,
  resend the invitations, close a request.
- **New optional inputs:** `sendWaUrl` / `sendSmsUrl` on `signature_participant_create`,
  `WITH_CERTIFICATE` in `signature_request_create.signatureType`, and
  `embeddedEvidences` on `dossier_create` / `dossier_update`.
- **Annotations:** `signature_request_cancel` is now marked destructive;
  `activate_signature_request` is marked as reaching the outside world (it sends
  invitations).

## Retired

| Tool | Why |
|---|---|
| `case_file_delete` | The platform refuses it to user-key sessions, and a user key is the only credential this server can be configured with. It could not succeed on 2.0.0 either. |
| `id_verification_contract_url`, `id_verification_list`, `id_verification_video_create` | Same refusal, same reason. |

No tool that stays lost an input field or gained a required one.

## Fixes you will notice

- **Idempotency:** two calls that differed only in a nested field — a
  `notification_send` to a different recipient within 24 h, page 2 of a list — were
  answered from the first call's cache. They no longer are.
- **Polling sees changes:** read-only tools no longer answer from a 60-second cache.
- **Readable errors:** the field issues of a 400/422 reach the agent instead of
  `[object Object]` or a bare "HTTP 422", including inside the one-call tools. A login
  refused because the account must accept new legal texts now says that only a person
  can do it, in the web app.
- **`notification_certificate_get`** now sends `embeddedDocuments` (it was silently
  dropped) and refuses an id reused with different options.
- **`signature_request_add_document` with `fileUrl`** downloads through the guarded
  resolver (HTTPS only, no private networks, size cap) and refuses a hash mismatch
  before registering the document.
- **Descriptions:** every tool's description in the README and in the stores is now
  exactly what the server serves.

## Configuration

Nothing to change. The credential is the same as in 2.0.0 (`MCP_AUTH_USER_KEY` and
`MCP_API_BASE_URL`, both required). `.env.example` now also documents six optional
variables the server already read: `MCP_TRANSPORT`, `MCP_BRIDGE_STATE_FILE`,
`MCP_FILE_MAX_BYTES`, `MCP_FILE_ALLOWED_ROOTS`, `MCP_FILE_URL_ALLOWED_HOSTS` and
`MCP_OTEL_ENABLED`. The Docker image sets `MCP_TRANSPORT` itself — keep it out of any
env file you pass to the container.

## Upgrading the n8n connector

<!-- N8N_UPGRADE -->
### From 2.0.x

**Nothing to do for your credential.**

**90 operations, up from 82.** New: get an evidence group; update and delete evidences
and evidence groups; an evidence download URL; update a case file; and, for signatures,
the signed-document URL, the certificate package URL, list requests, resend the
invitations and close a request.

**Five operations are gone.** EAD Enterprise Suite refuses the first four to User Key
credentials, which is the only kind this connector has used since 2.0.0, so they could
not succeed. The fifth could start an upload that nothing in n8n can finish.

| Operation | Instead |
|---|---|
| **Case File → Delete Case File** | Delete the case file in the EAD Enterprise Suite web app. |
| The whole **Identity Verification** resource (its three operations) | The EAD Enterprise Suite web app. |
| **Evidence → Initiate Large Evidence Upload** | Large evidence uploads are not available in n8n: use the EAD Enterprise Suite MCP server locally, or the web app. |

If a saved workflow still contains one of them, that node no longer has a valid
operation: remove it.

**Not in the connector, by design:** the large-file upload and the one-call signature
helper (both take a file, which this connector does not handle) and the two one-call
notification helpers. For signatures and notifications, chain the individual steps
instead — every one of them is present.

### From 1.x

Everything below changed in 2.0.0. Read it as well if you are upgrading from 1.x.

**If you already sign in with a User Key, there is nothing to do for your credential.**
The credential type has not changed — it keeps its name, and the **API Base URL** and
**User Key** fields keep theirs along with the values you already stored.

**If you sign in with an e-mail and password, that pair is gone.** Password sign-in now
requires 2FA / biometric verification, which cannot complete in an unattended workflow,
so no version of this connector can keep it working. Open the **EAD Enterprise Suite
API** credential, fill in **User Key**, and save. Editing the credential in place is
enough: you do not need to delete it, and you do not need to touch the nodes that use
it. Both fields are required:

| Field | Value |
|---|---|
| **API Base URL** (`MCP_API_BASE_URL`) | The EAD Enterprise Suite API root you connect to. |
| **User Key** (`MCP_AUTH_USER_KEY`) | Your long-lived user key. Replaces the e-mail/password pair. |

**Two operations changed target, and both lost their Document Id input.** This one is
not fixed by updating the credential — any saved workflow using either operation has
to be re-pointed by hand:

| Operation | Now lists | Use instead, for the old behaviour |
|---|---|---|
| **Signature Document List** | the documents of a signature request | **Signature Document Signatory List** |
| **Signature Participant List** | the participants of a signature request | **Signature Document Observer List** |

The **Document Id** field is gone from both. The two replacements still take it.

**Signature Participant Create hands back a different field.** The call answers 201 with
no body, so the connector injects the id you supplied into the output item. It used to
inject it as `signatoryId` whatever Role you had selected — which was only ever true for
a signatory. It now injects `participantId` for every role, and adds the role-specific
name on top:

| Role you select | Fields on the output item |
|---|---|
| **Signatory** | `participantId` and `signatoryId` |
| **Validator** | `participantId` and `validatorId` |
| **Observer** | `participantId` |

A saved workflow that reads `$json.signatoryId` after creating a **Signatory** is
unaffected. One that reads it after creating a **Validator** or an **Observer** now
reads nothing: re-point it at `$json.participantId`, or at `$json.validatorId` for a
validator.
<!-- /N8N_UPGRADE -->
