# EAD Enterprise Suite — n8n connector

> MCP server for EAD Enterprise Suite - signatures, evidence, notifications, dossiers via AI agents.

Install this connector and use EAD Enterprise Suite operations as steps inside any n8n workflow. Each operation maps to one capability of the underlying EAD Enterprise Suite platform.

## Install (self-hosted n8n)

```bash
npm install @g-digital/n8n-nodes-ead-enterprise-suite
```

Then restart n8n. The node will appear in the Nodes panel under "EAD Enterprise Suite".

## Using with n8n AI Agent

For AI-driven automation, configure an **n8n AI Agent node** with the following system prompt. It covers all lifecycle workflows: evidence creation, certified notifications, signature processes, dossier certification.

**→ Full system prompt and workflow guide:** [`@g-digital/n8n-agent-system-prompt`](https://www.npmjs.com/package/@g-digital/mcp-gocertius) — see the `docs/n8n-agent-workflows/gocertius-ead-system-prompt.md` in [MCP_Market_Distribution](https://github.com/g-digital-by-Garrigues/MCP_Market_Distribution/blob/main/docs/n8n-agent-workflows/gocertius-ead-system-prompt.md).

### Quick system prompt snippet

Paste this into your AI Agent node's **System Message**:

```
You are a Digital Trust assistant using the EAD Enterprise Suite n8n connector.
UUID generation: generate UUID v4 for all `id` fields you must supply.
IDs from responses: never invent path parameters — always use values returned by previous tool calls.
Async operations: after evidence_seal, dossier_certify, signature activation — poll the corresponding list/status tool until the terminal state is reached before proceeding.
File uploads: when a tool returns uploadFileUrl or url, PUT the file bytes there with a separate HTTP Request node before calling the next step.
See the full lifecycle guide at: https://github.com/g-digital-by-Garrigues/MCP_Market_Distribution/blob/main/docs/n8n-agent-workflows/gocertius-ead-system-prompt.md
```

## Operations

| Operation | Description |
|---|---|
| `evidence_create` | Registers a NEW evidence record inside an evidence group. Requires: evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Generate a UUID v4 for `ID`. Compute the SHA-256 hex hash of the file BEFORE calling. Normal INTERNAL flow: call evidence_create with custodyType INTERNAL and NO fileUrl; the API returns uploadFileUrl, a presigned S3 URL. You MUST PUT the exact file bytes to uploadFileUrl, then verify with evidence_get/evidence_list, and ONLY THEN call evidence_seal. Do not seal an evidence group until every INTERNAL evidence file has been uploaded. Convenience flow: if you pass `fileUrl` (public HTTPS, no redirects, under 1 GiB), this tool downloads that URL and PUTs the bytes to uploadFileUrl for you. EXTERNAL flow: use custodyType EXTERNAL only when you intentionally register hash-only evidence; still generate a fresh UUID for each evidence. If an INTERNAL evidence creation/upload failed and you want to retry as EXTERNAL, create a NEW evidence ID; do not reuse an ID whose outcome is unknown. WARNING: the API sometimes returns {code:'EvidenceCreateError'} even when the evidence was successfully persisted — always verify with evidence_list before retrying. |
| `evidence_list` | Lists all evidence records in a specific evidence group. Requires: caseFileId and evidenceGroupId. Returns paginated list with IDs, titles, status, and timestamps. |
| `evidence_seal` | Seal and certify an evidence group. Closes the group to new additions and triggers async timestamping. Returns immediately — the group transitions OPEN → CLOSING → CLOSED. Poll evidence_group_list until status is CLOSED before linking to a dossier. |
| `evidence_get` | Retrieves a specific evidence record. Requires: evidence_create → evidenceId, evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Returns status (COMPLETED|IN_PROCESS|ERROR), hash, and tspTimestamp when certified. |
| `evidence_group_create` | Creates an evidence group inside a case file. Requires: case_file_create → caseFileId. Generate a UUID v4 for `ID`. Set evidenceType to FILE, PHOTO, VIDEO, or WEB_PLUGIN. Returns evidenceGroupId. One group can contain multiple evidence records. |
| `evidence_group_list` | Lists all evidence groups in a case file with their current status (OPEN, CLOSING, CLOSED). Use to find an existing group or check which groups are ready for sealing. Requires: caseFileId. |
| `dossier_create` | Creates a dossier to aggregate certified evidence groups into a single tamper-evident PDF. Requires: case_file_create → caseFileId. Evidence groups must be in CLOSED status before linking. Generate a UUID v4 string for `ID`. Returns dossierId. After creation, link evidence with dossier_evidence_link, then certify with dossier_certify. |
| `dossier_update` | Updates the metadata of an existing dossier. Requires: dossier_create → dossierId, caseFileId. Only available while dossier is in DRAFT status. |
| `dossier_certify` | Certifies a dossier, generating a tamper-evident PDF and locking all linked evidence. Requires: dossier_create → dossierId, dossier_evidence_link (evidence linked), case_file_create → caseFileId. ASYNC: transitions DRAFT → CERTIFYING → CERTIFIED. Poll dossier_list until dossierId status === CERTIFIED. |
| `dossier_list` | Lists all dossiers in a case file. Requires: caseFileId. Returns paginated list with IDs, names, status, and creation dates. Use to monitor certification progress — poll until status: CERTIFIED. |
| `dossier_get` | Retrieves full details of a specific dossier including status, linked evidence, and download URLs. Requires: caseFileId and dossierId. |
| `dossier_template_list` | Lists available dossier templates. No prerequisites. Returns template IDs and their translations per language. Use the returned ID as dossierTemplateId in dossier_create. |
| `dossier_preview` | Returns an HTML preview URL of a dossier before certification. Requires: caseFileId and dossierId. |
| `dossier_document_url` | Returns the download URL for the certified dossier PDF. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_package_url` | Returns the download URL for the full dossier package (PDF + evidence files). Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_visibility` | Updates the visibility (public/private) of a certified dossier. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_delete` | Deletes a dossier. Available in DRAFT status (to discard before certification) or in CERTIFIED status (to permanently remove the certified dossier). Irreversible. Requires: caseFileId and dossierId. |
| `dossier_group_certify` | Creates AND certifies a dossier from a single sealed evidence group in one call (express path). Requires: evidence_seal (CLOSED), case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Generate a UUID v4 string for `ID`. Returns dossierId with CERTIFYING status → poll until CERTIFIED. |
| `dossier_evidence_link` | Links evidence items from a sealed group to a dossier. Requires: dossier_create → dossierId, evidence_seal (CLOSED), case_file_create → caseFileId. Pass the ids array of evidence UUIDs. Can be called multiple times for evidence from different case files. |
| `dossier_evidence_list_to_link` | Lists evidence items available to be linked to a dossier (CLOSED groups not yet linked). Requires: caseFileId and dossierId. |
| `dossier_evidence_list` | Lists all evidence items linked to a dossier. Requires: caseFileId and dossierId. |
| `dossier_evidence_get` | Retrieves details of a specific evidence item linked to a dossier. Requires: caseFileId, dossierId, evidenceId. |
| `dossier_evidence_delete` | Removes an evidence item from a dossier. Only available while dossier is in DRAFT status. Requires: caseFileId, dossierId, evidenceId. |
| `notification_document_add` | Performs the notification_document_add operation. Review the API documentation for full field details. |
| `notification_request_create` | Creates a certified notification request. Requires: case_file_create → caseFileId. Generate a UUID v4 for `ID`. Set language to en_GB or es_ES. Returns notificationRequestId. Add at least one receiver with notification_receiver_add before sending. IMPORTANT: The `content` field must be valid HTML — plain text without HTML tags will not render on the recipient landing page. Only the following HTML formats are supported: paragraphs (<p>), bold (<strong>), italic (<em>), unordered lists (<ul><li>), ordered lists (<ol><li>). Do not use other HTML tags or CSS. Avoid special typographic characters (em dashes, smart quotes) in `subject`; use standard ASCII equivalents (hyphen, straight quotes) instead. |
| `notification_request_send` | Trigger delivery of a certified notification to all added recipients. Returns immediately — delivery is async. Poll notification_request_status until status is DELIVERED before retrieving certificates. |
| `notification_request_status` | Checks the delivery status of a certified notification. Requires: notificationRequestId, caseFileId. Returns status (CREATING|DRAFT|IN_PROCESS|SENT|PARTIALLY_READ|FULLY_READ|PARTIALLY_ANSWERED|FULLY_ANSWERED). Poll until status is SENT or beyond. Do not call notification_certificate_get while status is CREATING, DRAFT, or IN_PROCESS. |
| `notification_receiver_add` | Adds a recipient to a notification request. Requires: notification_request_create → notificationRequestId, case_file_create → caseFileId. The `ID` can be a UUID v4 or custom string. Returns receiverId — save it for notification_certificate_get. |
| `notification_certificate_get` | Creates or retrieves a PDF certificate for a specific notification receiver. Requires notification_request_send and notification_receiver_add. Generate a UUID v4 for `ID` the first time and reuse that ID when polling. This tool is idempotent: it first lists existing certificates for the receiver and, if `ID` already exists, returns it instead of creating it again. If the certificate status is CERTIFIED, the response includes documentUrl when available. If it is CERTIFYING, poll this same tool with the same ID. |
| `case_file_create` | Creates a new case file — the top-level container for all related operations (evidence, notifications, signatures, dossiers). Call this first before any other operation. Generate a UUID v4 for `ID`. Returns caseFileId needed for all subsequent calls. |
| `case_file_list` | Lists all case files in your EAD Enterprise Suite account. Pass userId (from session_login or session_info) to scope results to your account. Returns paginated list with IDs, names, and status. |
| `case_file_get` | Retrieves details of a specific case file. Requires: caseFileId. Use to verify a case file exists before creating evidence groups, dossiers, or signature requests. |
| `session_login` | Authenticate with EAD Enterprise Suite. Credentials are read from the server environment: if MCP_AUTH_USER_KEY is set it is exchanged for a session token; otherwise MCP_AUTH_EMAIL + MCP_AUTH_PASSWORD are used. The server manages authentication automatically — call this only to force a re-login or after a 401. |
| `profile_get` | Returns the authenticated user's own profile. Works on EVERY auth flow (user key or email/password) because it identifies the caller from the session token alone — no email needed. Its `ID` field IS your userId (UUID): the value required by case_file_list and every /users/{userId}/... operation. Prefer this over session_info when you need the userId, and it is the ONLY way to obtain it on a user-key deployment (MCP_AUTH_USER_KEY), where no email is configured. Also returns companyId (needed to subscribe to the notifications SSE stream) and defaultCaseFileId. No parameters. |
| `use_case_list` | Lists available use cases for the account. Use cases define the allowed signature workflows and document types. Returns useCaseId values needed for signature_request_create. |
| `signature_group_create` | Creates a signing order group for a CONFIGURABLE signature request. Types: 'Document' (groups documents into signing rounds — use its ID as groupId in signature_request_add_document), 'Signatory' (groups signatories into signing rounds — use its ID as groupId in signature_participant_create), 'DocumentSignatory' (links a specific document to a signing round, requires documentId). IMPORTANT — avoid empty groups: when a CONFIGURABLE request is created, the API automatically pre-creates one Document group and one Signatory group both at index:1. Always use these pre-existing index:1 groups for your first document and first signatory (retrieve their IDs with signature_group_list immediately after creating the request). Only call signature_group_create for the ADDITIONAL groups (index:2, 3…). Add participants with linkToAllDocuments:true so DocumentSignatory groups are auto-generated at the correct index. Adding participants without linkToAllDocuments leaves them unlinked to documents and signature_coordinate_set will fail with 'Signatory not found'. |
| `signature_group_list` | Lists all signing order groups of a CONFIGURABLE signature request. Returns ID, type (Document/Signatory/DocumentSignatory), index, and documentId for each group. Call immediately after signature_request_create to retrieve the pre-created index:1 group IDs before adding documents or participants. |
| `signature_request_create` | Creates a new signature request in DRAFT status. Requires: case_file_create → caseFileId. Generate a UUID v4 for `ID`. Set deadline as ISO 8601 datetime (max ~30 days ahead). Returns requestId. Add documents with signature_request_add_document and participants with signature_participant_create before activating. |
| `signature_request_get` | Retrieves full details of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns status, documents, participants, deadline, and history. Use to check overall process state. |
| `signature_request_cancel` | Cancels an active signature request. Requires: activate_signature_request (ACTIVE status), requestId, caseFileId. Transitions to CANCELLED. Cannot be undone. |
| `signature_request_add_document` | Adds a document to a DRAFT signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Provide a string `ID` for the document. Compute SHA-256 hex hash of the PDF before calling. Optional: pass `fileUrl` (a publicly accessible URL) to have the tool download and upload the file to S3 automatically — no separate PUT needed. If fileUrl is omitted, returns url (presigned S3 upload URL) for manual PUT. Cannot add documents after activate_signature_request is called. For CONFIGURABLE sequence: `groupId` must reference a Document type group (not Signatory or DocumentSignatory) — passing a wrong group type returns 'Signature group not found'. |
| `signature_document_list` | Lists documents in a signature request with their signing status per document. Requires: signature_request_create → requestId, case_file_create → caseFileId. IMPORTANT: when called with documentId it returns participant signing status (PENDING = not yet signed), NOT document processing status. To check if documents reached READY_TO_SIGN (required before activate_signature_request), use signature_request_get instead. Post-activation: poll until document status === SIGNED before calling signature_certificate_get. |
| `signature_participant_create` | Adds a participant (signatory, observer, or validator) to a DRAFT signature request. Requires: signature_request_add_document → documentId + file uploaded to S3, signature_request_create → requestId, case_file_create → caseFileId. Use role SIGNATORY for required signers, OBSERVER for read-only, VALIDATOR for approvers. For ADVANCED signatures, phonePrefix and phoneNumber are mandatory because the signer receives the OTP there; WhatsApp delivery is NOT currently supported for ADVANCED. For INTERPOSITION signatures, phone is optional, and WhatsApp sending is currently available only for this simple/interposition flow when the platform is configured to send a WhatsApp signing link. Returns signatoryId. Add at least one SIGNATORY before activating. For VALIDATOR role: do NOT include groupId or linkToAllDocuments — use assign_validator_to_signatory to link the validator to a specific signatory after creation. |
| `signature_participant_list` | Lists all participants of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns roles, contact details, and signing status. |
| `assign_validator_to_signatory` | Assigns one or more validators to a specific signatory in a signature request. The validator must approve before the signatory can sign. Requires: signature_participant_create (validator) → validatorId in validatorIds array, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. |
| `activate_signature_request` | Activates a signature request, transitioning from DRAFT to ACTIVE and sending signing invitations to all signatories. Do NOT call this immediately after uploading files. Activation preconditions: request is DRAFT; at least one SIGNATORY exists; every document has been uploaded to its presigned URL; backend processing has had time to complete for every uploaded document (use processed/READY_TO_SIGN from signature_request_get when exposed; otherwise wait after the successful PUT); and PDF documents have signature coordinates set for every required signatory. INTERPOSITION may send a simple signing link, including WhatsApp when available/configured; ADVANCED uses phonePrefix/phoneNumber for OTP and currently does not support WhatsApp delivery. IRREVERSIBLE: cannot add documents or participants after activation. ASYNC: after activation, poll signature_request_get until status is ACTIVE, then use signature_document_list with documentId to monitor signing; call signature_certificate_get only after the document is SIGNED. |
| `signature_coordinate_set` | Sets the visual position of the signature field on a PDF document page. Required for PDF documents before activation, for both INTERPOSITION and ADVANCED signatures. Requires: signature_participant_create → signatoryId, signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Provide coordinates as array of {page (1-based), x (points from left), y (points from bottom)}. Set coordinates after the document has been uploaded and before activate_signature_request. |
| `signature_certificate_get` | Retrieves the signed document certificate PDF. Requires: activate_signature_request (document fully SIGNED), signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Returns documentUrl (signed PDF certificate). ASYNC: poll until documentUrl is available. |
| `large_evidence_upload_initiate` | Performs the large_evidence_upload_initiate operation against the GoCertius API. Review the API documentation for full field details. |
| `large_evidence_upload_complete` | Finalize a multipart evidence upload and register the evidence in the group. Returns immediately — the evidence transitions asynchronously to COMPLETED. Poll evidence_list until status is COMPLETED before sealing the group. |

## Credentials

This node requires a "EAD Enterprise Suite API" credential with the following fields:

| Field | Description | Secret? |
|---|---|---|
| `API Base URL` | Base URL of the EAD Enterprise Suite REST API. Production default: `https://api-eadcustody.eadtrust.gocertius.io` Leave blank only if you know your environment uses a different endpoint. | no |
| `MCP_AUTH_EMAIL` | Your EAD Enterprise Suite account email. Configure exactly one flow; do not combine it with the others. | no |
| `MCP_AUTH_PASSWORD` | Your EAD Enterprise Suite account password. (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) | yes |
| `MCP_AUTH_USER_KEY` | Long-lived EAD Enterprise Suite user key, exchanged automatically for a short-lived session token. Use it for headless or automated access instead of an account password. Configure exactly one flow; do not combine it with the others. (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) | yes |
> **Need credentials?** Sign up or log in at [https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/](https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/).

## Use as an AI Agent tool

This node is flagged `usableAsTool: true`, so any n8n AI Agent (n8n ≥ 1.79.0) can consume it dynamically: drag it into the workflow and wire its main output to an AI Agent's "Tool" input.

For best results pair with an AI Agent node running **V2** — V3 has a known empty-tool-response bug in some recent n8n versions (see [n8n issue #26202](https://github.com/n8n-io/n8n/issues/26202)).

## License

MIT. See [LICENSE](./LICENSE).
