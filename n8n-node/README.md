# Ead Enterprise Suite — n8n connector

> Manage certified evidence, dossiers, notifications, and signature workflows via EAD Enterprise Suite.

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
| `evidence_create` | Registers a new evidence record inside an evidence group, optionally uploading the file automatically. |
| `evidence_list` | Returns all evidence records belonging to a specific evidence group. |
| `evidence_seal` | Closes an evidence group to new additions and triggers certified timestamping. |
| `evidence_get` | Retrieves a single evidence record including its certification status and timestamp. |
| `evidence_group_create` | Creates a new evidence group inside a case file to hold related evidence records. |
| `evidence_group_list` | Returns all evidence groups in a case file with their current status. |
| `dossier_create` | Creates a dossier to aggregate certified evidence groups into a tamper-evident PDF. |
| `dossier_update` | Updates the metadata of a dossier that is still in DRAFT status. |
| `dossier_certify` | Certifies a dossier, generating a tamper-evident PDF and locking all linked evidence. |
| `dossier_list` | Returns all dossiers in a case file, including their certification status. |
| `dossier_get` | Retrieves full details of a dossier including status, linked evidence, and download URLs. |
| `dossier_template_list` | Returns all available dossier templates with their IDs and language translations. |
| `dossier_preview` | Returns an HTML preview URL for a dossier before it is certified. |
| `dossier_document_url` | Returns the download URL for a certified dossier's PDF document. |
| `dossier_package_url` | Returns the download URL for the full dossier package including all evidence files. |
| `dossier_visibility` | Updates the public or private visibility setting of a certified dossier. |
| `dossier_delete` | Permanently deletes a dossier in DRAFT or CERTIFIED status; this action is irreversible. |
| `dossier_group_certify` | Creates and certifies a dossier from a single sealed evidence group in one step. |
| `dossier_evidence_link` | Links evidence items from a sealed group to an existing dossier. |
| `dossier_evidence_list_to_link` | Returns evidence items from closed groups that are available to link to a dossier. |
| `dossier_evidence_list` | Returns all evidence items currently linked to a specific dossier. |
| `dossier_evidence_get` | Retrieves details of a single evidence item linked to a dossier. |
| `dossier_evidence_delete` | Removes an evidence item from a dossier while it is still in DRAFT status. |
| `notification_document_add` | Attaches a document to an existing certified notification request. |
| `notification_request_create` | Creates a certified notification request with HTML content ready for recipient delivery. |
| `notification_request_send` | Triggers delivery of a certified notification to all added recipients. |
| `notification_request_status` | Returns the current delivery status of a certified notification request. |
| `notification_receiver_add` | Adds a recipient to a notification request before it is sent. |
| `notification_certificate_get` | Generates a certified PDF proving delivery of a notification to a specific recipient. |
| `case_file_create` | Creates a top-level case file container required before any other operation. |
| `case_file_list` | Returns all case files in your EAD Enterprise Suite account with their status. |
| `case_file_get` | Retrieves details of a specific case file by its ID. |
| `session_login` | Authenticates with EAD Enterprise Suite using password or Azure AD OpenID Connect. |
| `session_info` | Returns the authenticated user's session details including userId and authentication type. |
| `use_case_list` | Returns available use cases defining permitted signature workflows and document types. |
| `signature_group_create` | Creates an additional signing order group for a configurable signature request. |
| `signature_group_list` | Returns all signing order groups of a configurable signature request with their IDs. |
| `signature_request_create` | Creates a new signature request in DRAFT status inside a case file. |
| `signature_request_get` | Retrieves full details of a signature request including status, documents, and participants. |
| `signature_request_cancel` | Cancels an active signature request; this action cannot be undone. |
| `signature_request_add_document` | Adds a PDF document to a signature request that is still in DRAFT status. |
| `signature_document_list` | Returns documents in a signature request with their per-participant signing status. |
| `signature_participant_create` | Adds a signatory, observer, or validator to a document in a DRAFT signature request. |
| `signature_participant_list` | Returns all participants of a signature request with their roles and signing status. |
| `assign_validator_to_signatory` | Links one or more validators to a specific signatory who must approve before signing. |
| `activate_signature_request` | Activates a DRAFT signature request and sends signing notifications to all participants. |
| `signature_coordinate_set` | Sets the visual position of a signature field on a document page before activation. |
| `signature_certificate_get` | Retrieves the certified signed PDF for a fully completed signature document. |
| `large_evidence_upload_initiate` | Starts a multipart upload session for a large evidence file. |
| `large_evidence_upload_complete` | Finalizes a multipart evidence upload and registers the evidence in its group. |

## Credentials

This node requires a "Ead Enterprise Suite API" credential with the following fields:

| Field | Description | Secret? |
|---|---|---|
| `API Base URL` | Base URL of the Ead Enterprise Suite REST API. Production default: `https://api-eadcustody.eadtrust.gocertius.io` Leave blank only if you know your environment uses a different endpoint. | no |
| `MCP_AUTH_EMAIL` | The email address associated with your EAD Enterprise Suite account. | no |
| `MCP_AUTH_PASSWORD` | The password for your EAD Enterprise Suite account, obtainable at eadtrust.eu. | yes |
> **Need credentials?** Sign up or log in at [https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/](https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/).

## Use as an AI Agent tool

This node is flagged `usableAsTool: true`, so any n8n AI Agent (n8n ≥ 1.79.0) can consume it dynamically: drag it into the workflow and wire its main output to an AI Agent's "Tool" input.

For best results pair with an AI Agent node running **V2** — V3 has a known empty-tool-response bug in some recent n8n versions (see [n8n issue #26202](https://github.com/n8n-io/n8n/issues/26202)).

## License

MIT. See [LICENSE](./LICENSE).
