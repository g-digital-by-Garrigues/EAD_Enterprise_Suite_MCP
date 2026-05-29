# EAD Enterprise Suite MCP Server

[![npm version](https://img.shields.io/npm/v/@g-digital/mcp-ead-enterprise-suite)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![npm downloads](https://img.shields.io/npm/dm/@g-digital/mcp-ead-enterprise-suite)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![provenance](https://img.shields.io/badge/npm-provenance-green)](https://www.npmjs.com/package/@g-digital/mcp-ead-enterprise-suite)
[![smithery badge](https://smithery.ai/badge/g-digital/ead-enterprise-suite)](https://smithery.ai/servers/g-digital/ead-enterprise-suite)

MCP server for EAD Enterprise Suite, EAD Trust's advanced Digital Trust platform. Full signature workflows, certified evidence, notifications, dossiers, and large-file uploads for enterprise legal processes.

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
| `MCP_AUTH_EMAIL` | One of flow 1 or 2 | Your account email |
| `MCP_AUTH_PASSWORD` | One of flow 1 or 2 | Your account password |
| `MCP_OPENID_ISSUER` | One of flow 1 or 2 | OpenID Connect issuer URL |
| `MCP_OPENID_CLIENT_ID` | One of flow 1 or 2 | OpenID Connect client ID |
| `MCP_OPENID_REFRESH_TOKEN` | One of flow 1 or 2 | OpenID Connect refresh token |
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

## Available Tools

This server exposes **50 tools**:

| Tool | Description |
|------|-------------|
| `evidence_create` | Registers a new evidence record inside an evidence group. Requires: evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Generate a UUID v4 for &#x60;id&#x60;. Compute the SHA-256 hex hash of the file BEFORE calling. Returns uploadFileUrl (presigned S3 URL) — PUT the file bytes to that URL before calling evidence_seal. custodyType INTERNAL &#x3D; EAD stores the file; EXTERNAL &#x3D; only hash is registered. |
| `evidence_list` | Lists all evidence records in a specific evidence group. Requires: caseFileId and evidenceGroupId. Returns paginated list with IDs, titles, status, and timestamps. |
| `evidence_seal` | Seals an evidence group and triggers qualified TSP timestamping. Requires: evidence_create records uploaded to S3, case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Set evidencesCount to the number of evidences in the group. ASYNC: poll evidence_group_list until the group status changes to CLOSED before linking to a dossier. |
| `evidence_get` | Retrieves a specific evidence record. Requires: evidence_create → evidenceId, evidence_group_create → evidenceGroupId, case_file_create → caseFileId. Returns status (COMPLETED|IN_PROCESS|ERROR), hash, and tspTimestamp when certified. |
| `evidence_group_create` | Creates an evidence group inside a case file. Requires: case_file_create → caseFileId. Generate a UUID v4 for &#x60;id&#x60;. Set evidenceType to FILE, PHOTO, VIDEO, or WEB_PLUGIN. Returns evidenceGroupId. One group can contain multiple evidence records. |
| `evidence_group_list` | Lists all evidence groups in a case file with their current status (OPEN, CLOSING, CLOSED). Use to find an existing group or check which groups are ready for sealing. Requires: caseFileId. |
| `dossier_create` | Creates a dossier to aggregate certified evidence groups into a single tamper-evident PDF. Requires: case_file_create → caseFileId. Evidence groups must be in CLOSED status before linking. Generate a UUID v4 string for &#x60;id&#x60;. Returns dossierId. After creation, link evidence with dossier_evidence_link, then certify with dossier_certify. |
| `dossier_update` | Updates the metadata of an existing dossier. Requires: dossier_create → dossierId, caseFileId. Only available while dossier is in DRAFT status. |
| `dossier_certify` | Certifies a dossier, generating a tamper-evident PDF and locking all linked evidence. Requires: dossier_create → dossierId, dossier_evidence_link (evidence linked), case_file_create → caseFileId. ASYNC: transitions DRAFT → CERTIFYING → CERTIFIED. Poll dossier_list until dossierId status &#x3D;&#x3D;&#x3D; CERTIFIED. |
| `dossier_list` | Lists all dossiers in a case file. Requires: caseFileId. Returns paginated list with IDs, names, status, and creation dates. Use to monitor certification progress — poll until status: CERTIFIED. |
| `dossier_get` | Retrieves full details of a specific dossier including status, linked evidence, and download URLs. Requires: caseFileId and dossierId. |
| `dossier_template_list` | Lists available dossier templates. No prerequisites. Returns template IDs and their translations per language. Use the returned id as dossierTemplateId in dossier_create. |
| `dossier_preview` | Returns an HTML preview URL of a dossier before certification. Requires: caseFileId and dossierId. |
| `dossier_document_url` | Returns the download URL for the certified dossier PDF. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_package_url` | Returns the download URL for the full dossier package (PDF + evidence files). Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_visibility` | Updates the visibility (public/private) of a certified dossier. Requires: dossier_certify (CERTIFIED status), caseFileId, dossierId. |
| `dossier_delete` | Deletes a dossier. Available in DRAFT status (to discard before certification) or in CERTIFIED status (to permanently remove the certified dossier). Irreversible. Requires: caseFileId and dossierId. |
| `dossier_group_certify` | Creates AND certifies a dossier from a single sealed evidence group in one call (express path). Requires: evidence_seal (CLOSED), case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Generate a UUID v4 string for &#x60;id&#x60;. Returns dossierId with CERTIFYING status → poll until CERTIFIED. |
| `dossier_evidence_link` | Links evidence items from a sealed group to a dossier. Requires: dossier_create → dossierId, evidence_seal (CLOSED), case_file_create → caseFileId. Pass the ids array of evidence UUIDs. Can be called multiple times for evidence from different case files. |
| `dossier_evidence_list_to_link` | Lists evidence items available to be linked to a dossier (CLOSED groups not yet linked). Requires: caseFileId and dossierId. |
| `dossier_evidence_list` | Lists all evidence items linked to a dossier. Requires: caseFileId and dossierId. |
| `dossier_evidence_get` | Retrieves details of a specific evidence item linked to a dossier. Requires: caseFileId, dossierId, evidenceId. |
| `dossier_evidence_delete` | Removes an evidence item from a dossier. Only available while dossier is in DRAFT status. Requires: caseFileId, dossierId, evidenceId. |
| `notification_document_add` | Performs the notification_document_add operation against the EAD Enterprise Suite API. |
| `notification_request_create` | Creates a certified notification request. Requires: case_file_create → caseFileId. Generate a UUID v4 for &#x60;id&#x60;. Set language to en_GB or es_ES. Returns notificationRequestId. Add at least one receiver with notification_receiver_add before sending. IMPORTANT: The &#x60;content&#x60; field must be valid HTML — plain text without HTML tags will not render on the recipient landing page. Only the following HTML formats are supported: paragraphs (&lt;p&gt;), bold (&lt;strong&gt;), italic (&lt;em&gt;), unordered lists (&lt;ul&gt;&lt;li&gt;), ordered lists (&lt;ol&gt;&lt;li&gt;). Do not use other HTML tags or CSS. Avoid special typographic characters (em dashes, smart quotes) in &#x60;subject&#x60;; use standard ASCII equivalents (hyphen, straight quotes) instead. |
| `notification_request_send` | Sends the certified notification to all added receivers. Requires: notification_request_create → notificationRequestId, notification_receiver_add (at least one receiver), case_file_create → caseFileId. ASYNC: triggers delivery. Poll notification_request_status until status is SENT or beyond (PARTIALLY_READ, FULLY_READ) before generating certificates. |
| `notification_request_status` | Checks the delivery status of a certified notification. Requires: notificationRequestId, caseFileId. Returns status (CREATING|DRAFT|IN_PROCESS|SENT|PARTIALLY_READ|FULLY_READ|PARTIALLY_ANSWERED|FULLY_ANSWERED). Poll until status is SENT or beyond. Do not call notification_certificate_get while status is CREATING, DRAFT, or IN_PROCESS. |
| `notification_receiver_add` | Adds a recipient to a notification request. Requires: notification_request_create → notificationRequestId, case_file_create → caseFileId. The &#x60;id&#x60; can be a UUID v4 or custom string. Returns receiverId — save it for notification_certificate_get. |
| `notification_certificate_get` | Generates a PDF certificate for a specific receiver proving delivery of the notification. Requires: notification_request_send (delivered), notification_receiver_add → receiverId, notificationRequestId, caseFileId. Generate a UUID v4 for &#x60;id&#x60;. Returns pdfUrl when status reaches CERTIFIED. |
| `case_file_create` | Creates a new case file — the top-level container for all related operations (evidence, notifications, signatures, dossiers). Call this first before any other operation. Generate a UUID v4 for &#x60;id&#x60;. Returns caseFileId needed for all subsequent calls. |
| `case_file_list` | Lists all case files in your EAD Enterprise Suite account. Pass userId (from session_login or session_info) to scope results to your account. Returns paginated list with IDs, names, and status. |
| `case_file_get` | Retrieves details of a specific case file. Requires: caseFileId. Use to verify a case file exists before creating evidence groups, dossiers, or signature requests. |
| `session_login` | Authenticates with EAD Enterprise Suite using email and password (or Azure AD device flow) to obtain a session JWT. Call only if you encounter 401 errors. The MCP server manages authentication automatically. |
| `session_info` | Retrieves information about the current authenticated session including userId, account, and token expiry. No required parameters. |
| `use_case_list` | Lists available use cases for the account. Use cases define the allowed signature workflows and document types. Returns useCaseId values needed for signature_request_create. |
| `signature_group_create` | Creates a signing order group for a CONFIGURABLE signature request. Types: &#x27;Document&#x27; (groups documents into signing rounds — use its id as groupId in signature_request_add_document), &#x27;Signatory&#x27; (groups signatories into signing rounds — use its id as groupId in signature_participant_create), &#x27;DocumentSignatory&#x27; (links a specific document to a signing round, requires documentId). IMPORTANT — avoid empty groups: when a CONFIGURABLE request is created, the API automatically pre-creates one Document group and one Signatory group both at index:1. Always use these pre-existing index:1 groups for your first document and first signatory (retrieve their IDs with signature_group_list immediately after creating the request). Only call signature_group_create for the ADDITIONAL groups (index:2, 3…). Add participants with linkToAllDocuments:true so DocumentSignatory groups are auto-generated at the correct index. Adding participants without linkToAllDocuments leaves them unlinked to documents and signature_coordinate_set will fail with &#x27;Signatory not found&#x27;. |
| `signature_group_list` | Lists all signing order groups of a CONFIGURABLE signature request. Returns id, type (Document/Signatory/DocumentSignatory), index, and documentId for each group. Call immediately after signature_request_create to retrieve the pre-created index:1 group IDs before adding documents or participants. |
| `signature_request_create` | Creates a new signature request in DRAFT status. Requires: case_file_create → caseFileId. Generate a UUID v4 for &#x60;id&#x60;. Set deadline as ISO 8601 datetime (max ~30 days ahead). Returns requestId. Add documents with signature_request_add_document and participants with signature_participant_create before activating. |
| `signature_request_get` | Retrieves full details of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns status, documents, participants, deadline, and history. Use to check overall process state. |
| `signature_request_cancel` | Cancels an active signature request. Requires: activate_signature_request (ACTIVE status), requestId, caseFileId. Transitions to CANCELLED. Cannot be undone. |
| `signature_request_add_document` | Adds a document to a DRAFT signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Provide a string &#x60;id&#x60; for the document. Compute SHA-256 hex hash of the PDF before calling. Returns documentId and url (presigned S3 upload URL) — PUT the PDF bytes to url before adding participants. Cannot add documents after activate_signature_request is called. For CONFIGURABLE sequence: &#x60;groupId&#x60; must reference a Document type group (not Signatory or DocumentSignatory) — passing a wrong group type returns &#x27;Signature group not found&#x27;. |
| `signature_document_list` | Lists documents in a signature request with their signing status per document. Requires: signature_request_create → requestId, case_file_create → caseFileId. IMPORTANT: when called with documentId it returns participant signing status (PENDING &#x3D; not yet signed), NOT document processing status. To check if documents reached READY_TO_SIGN (required before activate_signature_request), use signature_request_get instead. Post-activation: poll until document status &#x3D;&#x3D;&#x3D; SIGNED before calling signature_certificate_get. |
| `signature_participant_create` | Adds a participant (signatory, observer, or validator) to a document in a DRAFT signature request. Requires: signature_request_add_document → documentId + file uploaded to S3, signature_request_create → requestId, case_file_create → caseFileId. Use role SIGNATORY for required signers, OBSERVER for read-only, VALIDATOR for approvers. For ADVANCED type: phonePrefix and phoneNumber are required. For INTERPOSITION type: phone is optional. Returns signatoryId. Add at least one SIGNATORY before activating. For VALIDATOR role: do NOT include groupId or linkToAllDocuments — use assign_validator_to_signatory to link the validator to a specific signatory after creation. |
| `signature_participant_list` | Lists all participants of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns roles, contact details, and signing status. |
| `assign_validator_to_signatory` | Assigns one or more validators to a specific signatory in a signature request. The validator must approve before the signatory can sign. Requires: signature_participant_create (validator) → validatorId in validatorIds array, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. |
| `activate_signature_request` | Activates a signature request, transitioning from DRAFT to ACTIVE and sending notifications to all signatories. Requires: signature_request_create → requestId (DRAFT), at least one SIGNATORY added, all documents uploaded and coordinates set, case_file_create → caseFileId. IRREVERSIBLE: cannot add documents or participants after activation. ASYNC: poll signature_document_list until document status &#x3D;&#x3D;&#x3D; SIGNED. |
| `signature_coordinate_set` | Sets the visual position of the signature field on a document page. Requires: signature_participant_create → signatoryId, signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Provide coordinates as array of {page (1-based), x (points from left), y (points from bottom)}. Required for all signature types (INTERPOSITION and ADVANCED) before activation. |
| `signature_certificate_get` | Retrieves the signed document certificate PDF. Requires: activate_signature_request (document fully SIGNED), signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Returns documentUrl (signed PDF certificate). ASYNC: poll until documentUrl is available. |
| `large_evidence_upload_initiate` | Initiates a large file upload for an evidence group against the EAD Enterprise Suite API. Required: id, caseFileId, evidenceGroupId, title, fileName, hash (SHA-256 hex), fileSize (bytes), custodyType. Returns a multipart upload ID and presigned URLs for each part. Use for files over 5 MB. Follow with large_evidence_upload_complete once all parts are uploaded. |
| `large_evidence_upload_complete` | Completes a large file upload and seals the evidence group. Requires: large_evidence_upload_initiate → upload parts completed, case_file_create → caseFileId, evidence_group_create → evidenceGroupId. ASYNC: triggers TSP timestamping. Poll evidence_group_list until status &#x3D;&#x3D;&#x3D; CLOSED. |

## Coexistence

This MCP server is the **current, actively maintained** interface for the EAD Enterprise Suite API.

If you previously used an earlier MCP server for EAD Enterprise Suite (prior to v1.0), note that this server supersedes it. Both servers can run side-by-side during a migration window — they connect to the same upstream API and share no local state. To avoid duplicate tool names in multi-server MCP setups, run only one at a time once migration is complete.

## License

MIT — see [LICENSE](LICENSE).
