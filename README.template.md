# EAD Enterprise Suite MCP Server

[![npm version](https://img.shields.io/npm/v/@g-digital/mcp-ead-enterprise-suite)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![npm downloads](https://img.shields.io/npm/dm/@g-digital/mcp-ead-enterprise-suite)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![provenance](https://img.shields.io/badge/npm-provenance-green)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![smithery badge](https://smithery.ai/badge/g-digital/ead-enterprise-suite)](https://smithery.ai/servers/g-digital/ead-enterprise-suite)

MCP server for EAD Enterprise Suite - signatures, evidence, notifications, dossiers via AI agents.

## Quick start

```bash
npx -y @g-digital/mcp-ead-enterprise-suite
```

Or see [ONBOARDING.md](ONBOARDING.md) for a step-by-step setup guide (≤ 5 minutes).

## Where to install

This MCP is published to every major MCP distribution channel by the [g-digital MCP distribution pipeline](https://github.com/g-digital-by-Garrigues/MCP_Market_Distribution). Pick whichever fits your stack:

| Channel | Install command / URL |
|---|---|
| **npm** | `npx -y @g-digital/mcp-ead-enterprise-suite` — [npmjs.com/package/@g-digital/mcp-ead-enterprise-suite](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite) |
| **Docker Hub** | `docker pull gdigital/ead-enterprise-suite:latest` — [hub.docker.com/r/gdigital/ead-enterprise-suite](https://hub.docker.com/r/gdigital/ead-enterprise-suite) |
| **MCP Official Registry** | Auto-discovered as `io.github.g-digital-by-Garrigues/ead-enterprise-suite` — [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/v0/servers/io.github.g-digital-by-Garrigues/ead-enterprise-suite) |
| **n8n community node** | Install `@g-digital/n8n-nodes-ead-enterprise-suite` in n8n Settings → Community Nodes — [npmjs.com/package/@g-digital/n8n-nodes-ead-enterprise-suite](https://www.npmjs.com/package/@g-digital/n8n-nodes-ead-enterprise-suite) |
| **Smithery** | `smithery mcp install g-digital/ead-enterprise-suite` — [smithery.ai/servers/g-digital/ead-enterprise-suite](https://smithery.ai/servers/g-digital/ead-enterprise-suite) |

Every channel ships the same MCP server contract; the tools and environment configuration below apply regardless of which install path you choose.

> Need credentials? Visit: [https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/](https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/)

## Installation

<!-- INSTALL_BLOCKS -->

### Claude Desktop / Claude Code

Add to your `~/.claude.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "command": "npx",
      "args": ["-y", "@g-digital/mcp-ead-enterprise-suite"],
      "env": {
        "MCP_AUTH_EMAIL": "your-email@example.com",
        "MCP_AUTH_PASSWORD": "your-password"
      }
    }
  }
}
```

### Docker

```bash
docker run --rm -i \
  -e MCP_AUTH_EMAIL=your-email@example.com \
  -e MCP_AUTH_PASSWORD=your-password \
  gdigital/ead-enterprise-suite:latest
```

## Environment Variables

<!-- ENV_VARS -->

| Variable | Required | Description |
|---|---|---|
| `MCP_AUTH_EMAIL` | One of the two flows | Your account email |
| `MCP_AUTH_PASSWORD` | One of the two flows | Your account password |
| `MCP_AUTH_USER_KEY` | One of the two flows | Long-lived user key (exchanged for a session token) |
| `MCP_AUTH_JWT` | Optional | Pre-seeded JWT (skips interactive login) |
| `MCP_OTEL_ENABLED` | Optional | Set to `true` to enable OpenTelemetry tracing |
| `MCP_API_BASE_URL` | Optional | Override upstream API base URL |

## Bundled Skills

This package ships Claude Code slash-commands under `.claude/commands/`. After install, invoke them from Claude Code:

- `/getting-started` — step-by-step workflow guide
- `/signature-lifecycle` — step-by-step workflow guide
- `/notification-lifecycle` — step-by-step workflow guide
- `/evidence-lifecycle` — step-by-step workflow guide
- `/dossier-lifecycle` — step-by-step workflow guide

See [docs/agent-prompts.md](docs/agent-prompts.md) for end-to-end prompt examples and the tool sequences they trigger.

## Prefer to code against the REST API directly?

You don't have to go through this MCP server. This repo also ships a **Claude Code skill** — a standalone integration guide (authentication, call ordering, options, enums, gotchas) for programming directly against the REST API:

- **Skill:** [`.claude/skills/gocertius-suite-api/SKILL.md`](.claude/skills/gocertius-suite-api/SKILL.md) — open this repo in Claude Code and it is available directly.
- **As a reference:** [docs/api-integration-skill.md](docs/api-integration-skill.md).

It is independent of the MCP tools and the n8n node — pick whichever entry point fits your integration.

## Available Tools

This server exposes **52 tools**:

| Tool | Description |
|------|-------------|
| `evidence_create` | Registers a NEW evidence record inside an evidence group. Requires: evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Generate a UUID v4 for `id` and compute the SHA-256 hex hash BEFORE calling. INTERNAL flow: call with custodyType INTERNAL; the response returns uploadFileUrl (presigned S3 URL). PUT the exact file bytes to uploadFileUrl, then verify with evidence_get/evidence_list, and ONLY THEN call evidence_seal. Do not seal while any INTERNAL evidence file is not uploaded. EXTERNAL flow: use custodyType EXTERNAL only for intentional hash-only evidence; each evidence still needs a fresh UUID. If a previous evidence create/upload failed and outcome is unknown, verify with evidence_list before retrying and do not reuse the same id unless you confirmed it was not persisted. WARNING: the API sometimes returns {code:'EvidenceCreateError'} even when the evidence was successfully persisted. |
| `evidence_list` | Lists all evidence records in a specific evidence group. Requires: caseFileId and evidenceGroupId. Returns paginated list with IDs, titles, status, and timestamps. |
| `evidence_seal` | Seals an evidence group and triggers qualified TSP timestamping. Requires: all INTERNAL evidence records in the group have already been uploaded to their uploadFileUrl and verified with evidence_get/evidence_list. Requires case_file_create → caseFileId and evidence_group_create → evidenceGroupId. Set evidencesCount to the number of evidences in the group. ASYNC: after calling, poll evidence_group_list until the group status changes to CLOSED before linking to a dossier or generating certificates. |
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
| `notification_request_send` | Sends the certified notification to all added receivers. Requires: notification_request_create → notificationRequestId, notification_receiver_add (at least one receiver), case_file_create → caseFileId. ASYNC: triggers delivery. Poll notification_request_status until status is SENT or beyond (PARTIALLY_READ, FULLY_READ) before generating certificates. |
| `notification_request_status` | Checks the delivery status of a certified notification. Requires: notificationRequestId, caseFileId. Returns status (CREATING|DRAFT|IN_PROCESS|SENT|PARTIALLY_READ|FULLY_READ|PARTIALLY_ANSWERED|FULLY_ANSWERED). Poll until status is SENT or beyond. Do not call notification_certificate_get while status is CREATING, DRAFT, or IN_PROCESS. |
| `notification_receiver_add` | Adds a recipient to a notification request. Requires: notification_request_create → notificationRequestId, case_file_create → caseFileId. The `id` can be a UUID v4 or custom string. Returns receiverId — save it for notification_certificate_get. |
| `notification_certificate_get` | Generates or retrieves a PDF certificate for a specific receiver proving delivery and/or reading/answer of the notification. Requires: notification_request_send, notification_receiver_add → receiverId, notificationRequestId, caseFileId. Generate a UUID v4 for `id` the first time you request a certificate for that receiver and reuse that same id when polling. Call only after notification_request_status is SENT or beyond, and prefer READ/ANSWERED states when the notification type expects recipient action. The first call may return {} while the certificate is being generated; poll/re-call notification_certificate_get until the response includes a pdfUrl/documentUrl or a CERTIFIED/final status. If the backend returns Forbidden/Unexpected, stop polling the certificate endpoint and poll notification_request_status instead; retry with the same certificate id only after the notification reaches a more complete state or the UI shows evidence available. For ACCEPTED_OR_NOT notifications, call after a certifiable delivery/read state for an intermediate certificate and again after PARTIALLY_ANSWERED/FULLY_ANSWERED for the final answer certificate. |
| `case_file_create` | Creates a new case file — the top-level container for all related operations (evidence, notifications, signatures, dossiers). Call this first before any other operation. Generate a UUID v4 for `id`. Returns caseFileId needed for all subsequent calls. |
| `case_file_list` | Lists all case files in your EAD Enterprise Suite account. Pass userId (from session_login or session_info) to scope results to your account. Returns paginated list with IDs, names, and status. |
| `case_file_get` | Retrieves details of a specific case file. Requires: caseFileId. Use to verify a case file exists before creating evidence groups, dossiers, or signature requests. |
| `session_login` | Authenticates with EAD Enterprise Suite to obtain a session JWT. Takes NO parameters — credentials are read from the server environment: MCP_AUTH_USER_KEY (a long-lived user key, exchanged automatically for a session token) or MCP_AUTH_EMAIL plus MCP_AUTH_PASSWORD. The MCP server manages authentication automatically; call this only if you hit 401 errors. |
| `session_info` | Retrieves information about the current authenticated session including userId, account, and token expiry. Works on both auth flows: on a user-key deployment (MCP_AUTH_USER_KEY, no email configured) it resolves identity via GET /profile; with MCP_AUTH_EMAIL it queries /session-info. If you only need the userId, prefer profile_get — it is the canonical source (`id`) and also returns companyId and defaultCaseFileId. No required parameters. |
| `profile_get` | Returns the authenticated user's own profile. Works on EVERY auth flow (user key or email/password) because it identifies the caller from the session token alone — no email needed. Its `id` field IS your userId (UUID): the value required by case_file_list and every /users/{userId}/... operation. Prefer this over session_info when you need the userId, and it is the ONLY way to obtain it on a user-key deployment (MCP_AUTH_USER_KEY), where no email is configured. Also returns companyId (needed to subscribe to the notifications SSE stream) and defaultCaseFileId. No parameters. |
| `use_case_list` | Lists available use cases for the account. Use cases define the allowed signature workflows and document types. Returns useCaseId values needed for signature_request_create. |
| `signature_group_create` | Creates a signing order group for a CONFIGURABLE signature request. Types: 'Document' (groups documents into signing rounds — use its id as groupId in signature_request_add_document), 'Signatory' (groups signatories into signing rounds — use its id as groupId in signature_participant_create), 'DocumentSignatory' (links a specific document to a signing round, requires documentId). IMPORTANT — avoid empty groups: when a CONFIGURABLE request is created, the API automatically pre-creates one Document group and one Signatory group both at index:1. Always use these pre-existing index:1 groups for your first document and first signatory (retrieve their IDs with signature_group_list immediately after creating the request). Only call signature_group_create for the ADDITIONAL groups (index:2, 3…). Add participants with linkToAllDocuments:true so DocumentSignatory groups are auto-generated at the correct index. Adding participants without linkToAllDocuments leaves them unlinked to documents and signature_coordinate_set will fail with 'Signatory not found'. |
| `signature_group_list` | Lists all signing order groups of a CONFIGURABLE signature request. Returns id, type (Document/Signatory/DocumentSignatory), index, and documentId for each group. Call immediately after signature_request_create to retrieve the pre-created index:1 group IDs before adding documents or participants. |
| `signature_request_create` | Creates a new signature request in DRAFT status. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set deadline as ISO 8601 datetime (max ~30 days ahead). Returns requestId. Add documents with signature_request_add_document and participants with signature_participant_create before activating. |
| `signature_request_get` | Retrieves full details of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns status, documents, participants, deadline, and history. Use to check overall process state. |
| `signature_request_cancel` | Cancels an active signature request. Requires: activate_signature_request (ACTIVE status), requestId, caseFileId. Transitions to CANCELLED. Cannot be undone. |
| `signature_request_add_document` | Adds a document to a DRAFT signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Provide a string `id` for the document; that same id is the documentId for coordinates and certificates. Compute SHA-256 hex hash of the PDF before calling. Returns url (presigned S3 upload URL). You MUST PUT the exact PDF bytes to url, then allow backend processing before activation: poll signature_request_get for processed/READY_TO_SIGN if the API exposes it; if the response does not include document processing fields, wait a short processing window after the successful PUT, set PDF coordinates, then activate and confirm status ACTIVE with signature_request_get. Do not rely on signature_document_list for processing status. Cannot add documents after activate_signature_request is called. For CONFIGURABLE sequence: `groupId` must reference a Document type group (not Signatory or DocumentSignatory) — passing a wrong group type returns 'Signature group not found'. |
| `signature_document_list` | Lists documents in a signature request with their signing status per document. Requires: signature_request_create → requestId, case_file_create → caseFileId. IMPORTANT: when called with documentId it returns participant signing status (PENDING = not yet signed), NOT document processing status. To check if documents reached READY_TO_SIGN (required before activate_signature_request), use signature_request_get instead. Post-activation: poll until document status === SIGNED before calling signature_certificate_get. |
| `signature_participant_create` | Adds a participant (signatory, observer, or validator) to a DRAFT signature request. Requires: signature_request_add_document → documentId + file uploaded to S3, signature_request_create → requestId, case_file_create → caseFileId. Use role SIGNATORY for required signers, OBSERVER for read-only, VALIDATOR for approvers. For ADVANCED signatures, phonePrefix and phoneNumber are mandatory because the signer receives the OTP there; WhatsApp delivery is NOT currently supported for ADVANCED. For INTERPOSITION signatures, phone is optional, and WhatsApp sending is currently available only for this simple/interposition flow when the platform is configured to send a WhatsApp signing link. Returns signatoryId. Add at least one SIGNATORY before activating. For VALIDATOR role: do NOT include groupId or linkToAllDocuments — use assign_validator_to_signatory to link the validator to a specific signatory after creation. |
| `signature_participant_list` | Lists all participants of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns roles, contact details, and signing status. |
| `assign_validator_to_signatory` | Assigns one or more validators to a specific signatory in a signature request. The validator must approve before the signatory can sign. Requires: signature_participant_create (validator) → validatorId in validatorIds array, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. |
| `activate_signature_request` | Activates a signature request, transitioning from DRAFT to ACTIVE and sending signing invitations to all signatories. Do NOT call this immediately after uploading files. Activation preconditions: request is DRAFT; at least one SIGNATORY exists; every document has been uploaded to its presigned URL; backend processing has had time to complete for every uploaded document (use processed/READY_TO_SIGN from signature_request_get when exposed; otherwise wait after the successful PUT); and PDF documents have signature coordinates set for every required signatory. INTERPOSITION may send a simple signing link, including WhatsApp when available/configured; ADVANCED uses phonePrefix/phoneNumber for OTP and currently does not support WhatsApp delivery. IRREVERSIBLE: cannot add documents or participants after activation. ASYNC: after activation, poll signature_request_get until status is ACTIVE, then use signature_document_list with documentId to monitor signing; call signature_certificate_get only after the document is SIGNED. |
| `signature_coordinate_set` | Sets the visual position of the signature field on a PDF document page. Required for PDF documents before activation, for both INTERPOSITION and ADVANCED signatures. Requires: signature_participant_create → signatoryId, signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Provide coordinates as array of {page (1-based), x (points from left), y (points from bottom)}. Set coordinates after the document has been uploaded and before activate_signature_request. |
| `signature_certificate_get` | Retrieves the signed document certificate PDF. Requires: activate_signature_request (document fully SIGNED), signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Returns documentUrl (signed PDF certificate). ASYNC: poll until documentUrl is available. |
| `large_evidence_upload_initiate` | Initiates a large file upload for an evidence group against the EAD Enterprise Suite API. Required: id, caseFileId, evidenceGroupId, title, fileName, hash (SHA-256 hex), fileSize (bytes), custodyType. Returns a multipart upload ID and presigned URLs for each part. Use for files over 5 MB. Follow with large_evidence_upload_complete once all parts are uploaded. |
| `large_evidence_upload_complete` | Completes a large file upload and seals the evidence group. Requires: large_evidence_upload_initiate → upload parts completed, case_file_create → caseFileId, evidence_group_create → evidenceGroupId. ASYNC: triggers TSP timestamping. Poll evidence_group_list until status === CLOSED. |
| `evidence_upload` | Uploads a local file as evidence in one step: computes its SHA-256, registers the evidence record (custodyType INTERNAL = EAD stores the file), and uploads the bytes to S3 — no manual hashing or PUT needed. Internally this follows the required EAD sequence: create INTERNAL evidence → receive uploadFileUrl (presigned S3 URL) → PUT file bytes → return uploaded:true. Requires: case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Provide EXACTLY ONE of `filePath` (absolute local path, stdio/local mode only) or `contentBase64` (base64-encoded file content, ~10 MB max). Use evidence_upload when the file is on the local machine; use evidence_create when you already have the SHA-256 hash, need to inspect/use uploadFileUrl manually, or have a public fileUrl. After this tool succeeds, verify with evidence_get/evidence_list and only then call evidence_seal. If this tool fails before returning an evidence id, check evidence_list before retrying; if retrying manually, use evidence_create with a fresh UUID. Local files must be under 1 GiB. |

## Coexistence

This MCP server is the **current, actively maintained** interface for the EAD Enterprise Suite API.

If you previously used an earlier MCP server for EAD Enterprise Suite (prior to v1.0), note that this server supersedes it. Both servers can run side-by-side during a migration window — they connect to the same upstream API and share no local state. To avoid duplicate tool names in multi-server MCP setups, run only one at a time once migration is complete.

## License

MIT — see [LICENSE](LICENSE).
