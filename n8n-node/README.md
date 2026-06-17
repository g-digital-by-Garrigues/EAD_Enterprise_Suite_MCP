# Ead Enterprise Suite — n8n connector

> MCP server for EAD Enterprise Suite, EAD Trust's advanced Digital Trust platform. Full signature workflows, certified evidence, notifications, dossiers, and large-file uploads for enterprise legal processes.

Install this connector and use Ead Enterprise Suite operations as steps inside any n8n workflow. Each operation maps to one capability of the underlying Ead Enterprise Suite platform.

## Install (self-hosted n8n)

```bash
npm install @g-digital/n8n-nodes-ead-enterprise-suite
```

Then restart n8n. The node will appear in the Nodes panel under "Ead Enterprise Suite".

## Using with n8n AI Agent

For AI-driven automation, configure an **n8n AI Agent node** with the following system prompt. It covers all lifecycle workflows: evidence creation, certified notifications, signature processes, dossier certification, and certified chats.

**→ Full system prompt and workflow guide:** [`@g-digital/n8n-agent-system-prompt`](https://www.npmjs.com/package/@g-digital/mcp-gocertius) — see the `docs/n8n-agent-workflows/gocertius-ead-system-prompt.md` in [MCP_Market_Distribution](https://github.com/g-digital-by-Garrigues/MCP_Market_Distribution/blob/main/docs/n8n-agent-workflows/gocertius-ead-system-prompt.md).

### Quick system prompt snippet

Paste this into your AI Agent node's **System Message**:

```
You are a Digital Trust assistant using the Ead Enterprise Suite n8n connector.
UUID generation: generate UUID v4 for all `id` fields you must supply.
IDs from responses: never invent path parameters — always use values returned by previous tool calls.
Async operations: after evidence_seal, dossier_certify, signature activation, and chat certification — poll the corresponding list/status tool until the terminal state is reached before proceeding.
File uploads: when a tool returns uploadFileUrl or url, PUT the file bytes there with a separate HTTP Request node before calling the next step.
See the full lifecycle guide at: https://github.com/g-digital-by-Garrigues/MCP_Market_Distribution/blob/main/docs/n8n-agent-workflows/gocertius-ead-system-prompt.md
```

## Operations

| Operation | Description |
|---|---|
| `evidence_create` | Registers a new evidence record inside an evidence group. Requires: evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Generate a UUID v4 for `id`. Compute the SHA-256 hex hash of the file BEFORE calling. custodyType INTERNAL = EAD stores the file; EXTERNAL = only hash is registered. Optional: pass `fileUrl` (a publicly accessible URL) to have the tool download and upload the file to S3 automatically — no separate PUT needed. If fileUrl is omitted, the response includes uploadFileUrl for manual upload. WARNING: the API sometimes returns {code:'EvidenceCreateError'} even when the evidence was successfully persisted — always verify with evidence_list before retrying. |
| `evidence_list` | Lists all evidence records in a specific evidence group. Requires: caseFileId and evidenceGroupId. Returns paginated list with IDs, titles, status, and timestamps. |
| `evidence_seal` | Seal and certify an evidence group. Closes the group to new additions and triggers async timestamping. Returns immediately — the group transitions OPEN → CLOSING → CLOSED. Poll evidence_group_list until status is CLOSED before linking to a dossier. |
| `evidence_get` | Retrieves a specific evidence record. Requires: evidence_create → evidenceId, evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Returns status (COMPLETED|IN_PROCESS|ERROR), hash, and tspTimestamp when certified. |
| `evidence_group_create` | Creates an evidence group inside a case file. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set evidenceType to FILE, PHOTO, VIDEO, or WEB_PLUGIN. Returns evidenceGroupId. One group can contain multiple evidence records. |
| `evidence_group_list` | Lists all evidence groups in a case file with their current status (OPEN, CLOSING, CLOSED). Use to find an existing group or check which groups are ready for sealing. Requires: caseFileId. |
| `dossier_create` | Creates a dossier to aggregate certified evidence groups into a single tamper-evident PDF. Requires: case_file_create → caseFileId. Evidence groups must be in CLOSED status before linking. Generate a UUID v4 string for `id`. Returns dossierId. After creation, link evidence with dossier_evidence_link, then certify with dossier_certify. |
| `dossier_update` | Updates the metadata of an existing dossier. Requires: dossier_create → dossierId, caseFileId. Only available while dossier is in DRAFT status. |
| `dossier_certify` | Certifies a dossier, generating a tamper-evident PDF and locking all linked evidence. Requires: dossier_create → dossierId, dossier_evidence_link (evidence linked), case_file_create → caseFileId. ASYNC: transitions DRAFT → CERTIFYING → CERTIFIED. Poll dossier_list until dossierId status === CERTIFIED. |
| `dossier_list` | Lists all dossiers in a case file. Requires: caseFileId. Returns paginated list with IDs, names, status, and creation dates. Use to monitor certification progress — poll until status: CERTIFIED. |
| `dossier_get` | Retrieves full details of a specific dossier including status, linked evidence, and download URLs. Requires: caseFileId and dossierId. |
| `dossier_template_list` | Lists available dossier templates. No prerequisites. Returns template IDs and their translations per language. Use the returned id as dossierTemplateId in dossier_create. |
| `dossier_preview` | Returns an HTML preview URL of a dossier before certification. Requires: caseFileId and dossierId. |
| `dossier_document_url` | Returns the download URL for the certified dossier PDF. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_package_url` | Returns the download URL for the full dossier package (PDF + evidence files). Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_visibility` | Updates the visibility (public/private) of a certified dossier. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_delete` | Deletes a dossier. Available in DRAFT status (to discard before certification) or in CERTIFIED status (to permanently remove the certified dossier). Irreversible. Requires: caseFileId and dossierId. |
| `dossier_group_certify` | Creates AND certifies a dossier from a single sealed evidence group in one call (express path). Requires: evidence_seal (CLOSED), case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Generate a UUID v4 string for `id`. Returns dossierId with CERTIFYING status → poll until CERTIFIED. |
| `dossier_evidence_link` | Links evidence items from a sealed group to a dossier. Requires: dossier_create → dossierId, evidence_seal (CLOSED), case_file_create → caseFileId. Pass the ids array of evidence UUIDs. Can be called multiple times for evidence from different case files. |
| `dossier_evidence_list_to_link` | Lists evidence items available to be linked to a dossier (CLOSED groups not yet linked). Requires: caseFileId and dossierId. |
| `dossier_evidence_list` | Lists all evidence items linked to a dossier. Requires: caseFileId and dossierId. |
| `dossier_evidence_get` | Retrieves details of a specific evidence item linked to a dossier. Requires: caseFileId, dossierId, evidenceId. |
| `dossier_evidence_delete` | Removes an evidence item from a dossier. Only available while dossier is in DRAFT status. Requires: caseFileId, dossierId, evidenceId. |
| `notification_document_add` | Performs the notification_document_add operation. Review the API documentation for full field details. |
| `notification_request_create` | Creates a certified notification request. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set language to en_GB or es_ES. Returns notificationRequestId. Add at least one receiver with notification_receiver_add before sending. IMPORTANT: The `content` field must be valid HTML — plain text without HTML tags will not render on the recipient landing page. Only the following HTML formats are supported: paragraphs (<p>), bold (<strong>), italic (<em>), unordered lists (<ul><li>), ordered lists (<ol><li>). Do not use other HTML tags or CSS. Avoid special typographic characters (em dashes, smart quotes) in `subject`; use standard ASCII equivalents (hyphen, straight quotes) instead. |
| `notification_request_send` | Trigger delivery of a certified notification to all added recipients. Returns immediately — delivery is async. Poll notification_request_status until status is DELIVERED before retrieving certificates. |
| `notification_request_status` | Checks the delivery status of a certified notification. Requires: notificationRequestId, caseFileId. Returns status (CREATING|DRAFT|IN_PROCESS|SENT|PARTIALLY_READ|FULLY_READ|PARTIALLY_ANSWERED|FULLY_ANSWERED). Poll until status is SENT or beyond. Do not call notification_certificate_get while status is CREATING, DRAFT, or IN_PROCESS. |
| `notification_receiver_add` | Adds a recipient to a notification request. Requires: notification_request_create → notificationRequestId, case_file_create → caseFileId. The `id` can be a UUID v4 or custom string. Returns receiverId — save it for notification_certificate_get. |
| `notification_certificate_get` | Generates a PDF certificate for a specific receiver proving delivery of the notification. Requires: notification_request_send (delivered), notification_receiver_add → receiverId, notificationRequestId, caseFileId. Generate a UUID v4 for `id`. Returns pdfUrl when status reaches CERTIFIED. |
| `case_file_create` | Creates a new case file — the top-level container for all related operations (evidence, notifications, signatures, dossiers). Call this first before any other operation. Generate a UUID v4 for `id`. Returns caseFileId needed for all subsequent calls. |
| `case_file_list` | Lists all case files in your EAD Enterprise Suite account. Pass userId (from session_login or session_info) to scope results to your account. Returns paginated list with IDs, names, and status. |
| `case_file_get` | Retrieves details of a specific case file. Requires: caseFileId. Use to verify a case file exists before creating evidence groups, dossiers, or signature requests. |
| `session_login` | Authenticate with EAD Enterprise Suite. Reads MCP_AUTH_EMAIL to discover the auth type (Password or OpenId) for that account. For Password accounts: uses MCP_AUTH_PASSWORD to obtain a session JWT. For OpenId accounts: starts an Azure AD device flow — on the FIRST call returns a browser link and code for the user to approve with Microsoft Authenticator; call session_login AGAIN after approving to complete authentication. |
| `session_info` | Returns the authenticated user's session info including userId, session type (Password or OpenId), and for OpenId sessions: issuer, clientId, and scopes. Use this to retrieve the userId (UUID) required by case_file_list and other user-scoped operations. Prerequisites: a valid session (call session_login first if needed). Example: session_info() → { userId: '...uuid...', type: 'Password' } |
| `use_case_list` | Lists available use cases for the account. Use cases define the allowed signature workflows and document types. Returns useCaseId values needed for signature_request_create. |
| `signature_group_create` | Creates a signing order group for a CONFIGURABLE signature request. Types: 'Document' (groups documents into signing rounds — use its id as groupId in signature_request_add_document), 'Signatory' (groups signatories into signing rounds — use its id as groupId in signature_participant_create), 'DocumentSignatory' (links a specific document to a signing round, requires documentId). IMPORTANT — avoid empty groups: when a CONFIGURABLE request is created, the API automatically pre-creates one Document group and one Signatory group both at index:1. Always use these pre-existing index:1 groups for your first document and first signatory (retrieve their IDs with signature_group_list immediately after creating the request). Only call signature_group_create for the ADDITIONAL groups (index:2, 3…). Add participants with linkToAllDocuments:true so DocumentSignatory groups are auto-generated at the correct index. Adding participants without linkToAllDocuments leaves them unlinked to documents and signature_coordinate_set will fail with 'Signatory not found'. |
| `signature_group_list` | Lists all signing order groups of a CONFIGURABLE signature request. Returns id, type (Document/Signatory/DocumentSignatory), index, and documentId for each group. Call immediately after signature_request_create to retrieve the pre-created index:1 group IDs before adding documents or participants. |
| `signature_request_create` | Creates a new signature request in DRAFT status. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set deadline as ISO 8601 datetime (max ~30 days ahead). Returns requestId. Add documents with signature_request_add_document and participants with signature_participant_create before activating. |
| `signature_request_get` | Retrieves full details of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns status, documents, participants, deadline, and history. Use to check overall process state. |
| `signature_request_cancel` | Cancels an active signature request. Requires: activate_signature_request (ACTIVE status), requestId, caseFileId. Transitions to CANCELLED. Cannot be undone. |
| `signature_request_add_document` | Adds a document to a DRAFT signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Provide a string `id` for the document. Compute SHA-256 hex hash of the PDF before calling. Optional: pass `fileUrl` (a publicly accessible URL) to have the tool download and upload the file to S3 automatically — no separate PUT needed. If fileUrl is omitted, returns url (presigned S3 upload URL) for manual PUT. Cannot add documents after activate_signature_request is called. For CONFIGURABLE sequence: `groupId` must reference a Document type group (not Signatory or DocumentSignatory) — passing a wrong group type returns 'Signature group not found'. |
| `signature_document_list` | Lists documents in a signature request with their signing status per document. Requires: signature_request_create → requestId, case_file_create → caseFileId. IMPORTANT: when called with documentId it returns participant signing status (PENDING = not yet signed), NOT document processing status. To check if documents reached READY_TO_SIGN (required before activate_signature_request), use signature_request_get instead. Post-activation: poll until document status === SIGNED before calling signature_certificate_get. |
| `signature_participant_create` | Adds a participant (signatory, observer, or validator) to a document in a DRAFT signature request. Requires: signature_request_add_document → documentId + file uploaded to S3, signature_request_create → requestId, case_file_create → caseFileId. Use role SIGNATORY for required signers, OBSERVER for read-only, VALIDATOR for approvers. For ADVANCED type: phonePrefix and phoneNumber are required. For INTERPOSITION type: phone is optional. Returns signatoryId. Add at least one SIGNATORY before activating. For VALIDATOR role: do NOT include groupId or linkToAllDocuments — use assign_validator_to_signatory to link the validator to a specific signatory after creation. |
| `signature_participant_list` | Lists all participants of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns roles, contact details, and signing status. |
| `assign_validator_to_signatory` | Assigns one or more validators to a specific signatory in a signature request. The validator must approve before the signatory can sign. Requires: signature_participant_create (validator) → validatorId in validatorIds array, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. |
| `activate_signature_request` | Activates a signature request, transitioning from DRAFT to ACTIVE and sending notifications to all signatories. Requires: signature_request_create → requestId (DRAFT), at least one SIGNATORY added, all documents uploaded and coordinates set, case_file_create → caseFileId. IRREVERSIBLE: cannot add documents or participants after activation. ASYNC: poll signature_document_list until document status === SIGNED. |
| `signature_coordinate_set` | Sets the visual position of the signature field on a document page. Requires: signature_participant_create → signatoryId, signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Provide coordinates as array of {page (1-based), x (points from left), y (points from bottom)}. Required for all signature types (INTERPOSITION and ADVANCED) before activation. |
| `signature_certificate_get` | Retrieves the signed document certificate PDF. Requires: activate_signature_request (document fully SIGNED), signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Returns documentUrl (signed PDF certificate). ASYNC: poll until documentUrl is available. |
| `large_evidence_upload_initiate` | Performs the large_evidence_upload_initiate operation against the GoCertius API. Review the API documentation for full field details. |
| `large_evidence_upload_complete` | Finalize a multipart evidence upload and register the evidence in the group. Returns immediately — the evidence transitions asynchronously to COMPLETED. Poll evidence_list until status is COMPLETED before sealing the group. |

## Credentials

This node requires a "Ead Enterprise Suite API" credential with the following fields:

| Field | Description | Secret? |
|---|---|---|
| `API Base URL` | Base URL of the Ead Enterprise Suite REST API. Production default: `https://api-eadcustody.eadtrust.gocertius.io` Leave blank only if you know your environment uses a different endpoint. | no |
| `MCP_ALLOW_INSECURE_FILE_URL` | Set to "true" to allow plain http:// fileUrl downloads in evidence_create (default https-only). Private/internal addresses are always rejected regardless. | no |
| `MCP_ALLOWED_HOSTS` | Comma-separated allowed Host headers. Empty = Host validation disabled (default). When set, requests with a Host outside the list are rejected. | no |
| `MCP_ALLOWED_ORIGINS` | Comma-separated allowed browser Origins (DNS-rebinding defense). Empty = reject any request carrying an Origin header; non-browser clients (CLI/SDK) send no Origin and are always allowed. Use '*' to allow all. | no |
| `MCP_AUTH_EMAIL` | Your EAD Enterprise Suite account email (Flow 1). Configure one of Flow 1 or Flow 2. | no |
| `MCP_AUTH_PASSWORD` | Your EAD Enterprise Suite account password (Flow 1, email/password accounts) (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) | yes |
| `MCP_HTTP_HOST` | Interface the HTTP transport binds to. Default 127.0.0.1 (localhost only). Set 0.0.0.0 to expose on all interfaces (containers do this automatically). | no |
| `MCP_HTTP_PUBLIC` | Set to "true" for public/multi-tenant deployments. Activates Host validation and refuses to start unless MCP_ALLOWED_ORIGINS or MCP_ALLOWED_HOSTS is set (fail-closed). | no |
> **Need credentials?** Sign up or log in at [https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/](https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/).

## Use as an AI Agent tool

This node is flagged `usableAsTool: true`, so any n8n AI Agent (n8n ≥ 1.79.0) can consume it dynamically: drag it into the workflow and wire its main output to an AI Agent's "Tool" input.

For best results pair with an AI Agent node running **V2** — V3 has a known empty-tool-response bug in some recent n8n versions (see [n8n issue #26202](https://github.com/n8n-io/n8n/issues/26202)).

## License

MIT. See [LICENSE](./LICENSE).
