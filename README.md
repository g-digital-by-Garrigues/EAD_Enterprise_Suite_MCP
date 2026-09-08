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

### Claude Desktop

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Claude Code (CLI)

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Cursor

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Windsurf

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Cline

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### VS Code

```json
{
  "servers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### JetBrains

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Zed

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "@g-digital/mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io",
        "MCP_AUTH_USER_KEY": "<PASTE_MCP_AUTH_USER_KEY_HERE>"
      }
    }
  }
}
```

> Need credentials? See: https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/

### Claude Desktop / Claude Code

Add to your `~/.claude.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "command": "npx",
      "args": ["-y", "@g-digital/mcp-ead-enterprise-suite"],
      "env": {
        "MCP_AUTH_USER_KEY": "your-user-key",
        "MCP_API_BASE_URL": "https://api-eadcustody.eadtrust.gocertius.io"
      }
    }
  }
}
```

### Docker

```bash
docker run --rm -i \
  -e MCP_AUTH_USER_KEY=your-user-key \
  -e MCP_API_BASE_URL=https://api-eadcustody.eadtrust.gocertius.io \
  gdigital/ead-enterprise-suite:latest
```

## Environment Variables

| Name | Required | Secret | Description |
| --- | --- | --- | --- |
| `MCP_ALLOW_INSECURE_FILE_URL` | No | No | Set to "true" to allow plain http:// fileUrl downloads in evidence_create (default https-only). Private/internal addresses are rejected regardless (resolution-time check; see the documented DNS TOCTOU limitation in the hosted-deployment runbook). |
| `MCP_ALLOW_UNVERIFIED_BEARER` | No | No | Escape hatch for MCP_HTTP_PUBLIC=true WITHOUT inbound-token introspection: set to "true" ONLY when an upstream gateway already verifies Bearer tokens. The server logs a prominent warning and forwards tokens upstream unverified. |
| `MCP_ALLOWED_HOSTS` | No | No | Comma-separated allowed Host headers. Empty = Host validation disabled (default). When set, requests with a Host outside the list are rejected. |
| `MCP_ALLOWED_ORIGINS` | No | No | Comma-separated allowed browser Origins (DNS-rebinding defense). Empty = reject any request carrying an Origin header; non-browser clients (CLI/SDK) send no Origin and are always allowed. Use '*' to allow all. |
| `MCP_API_BASE_URL` | Yes | No | Upstream API root. Required: your user key is exchanged for a session token against this host, and the server will not start without it. |
| `MCP_AUTH_USER_KEY` | Yes | Yes | Long-lived EAD Enterprise Suite user key, exchanged automatically for a short-lived session token. Use it for headless or automated access instead of an account password. (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) |
| `MCP_HTTP_HOST` | No | No | Interface the HTTP transport binds to. Default 127.0.0.1 (localhost only). Set 0.0.0.0 to expose on all interfaces (containers do this automatically). |
| `MCP_HTTP_MAX_BODY_BYTES` | No | No | Maximum accepted POST /mcp request-body size in bytes (default 16777216 = 16 MiB — sized so base64 file uploads within the documented tool limits fit). Oversized requests get a 413 JSON-RPC error before/while reading — closes a memory-exhaustion DoS vector in public deployments. Note: base64 file sources are capped by this limit BEFORE MCP_FILE_MAX_BYTES applies. |
| `MCP_HTTP_PUBLIC` | No | No | Set to "true" for public/multi-tenant deployments. Activates Host validation and refuses to start unless (1) MCP_ALLOWED_ORIGINS or MCP_ALLOWED_HOSTS is set AND (2) inbound Bearer introspection is configured (MCP_SVC_INTROSPECT_URL + MCP_SVC_CLIENT_ID/SECRET) or MCP_ALLOW_UNVERIFIED_BEARER=true is set explicitly (fail-closed). |
| `MCP_SVC_CLIENT_ID` | No | No | Client ID this server presents to the introspection endpoint above (its resource-server credentials). Only needed alongside MCP_SVC_INTROSPECT_URL; it does not authenticate you to EAD Enterprise Suite. |
| `MCP_SVC_CLIENT_SECRET` | No | Yes | Client secret this server presents to the introspection endpoint above (its resource-server credentials). Only needed alongside MCP_SVC_INTROSPECT_URL; it does not authenticate you to EAD Enterprise Suite. (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) |
| `MCP_SVC_INTROSPECT_URL` | No | No | RFC 7662 token introspection URL for inbound Bearer verification in HTTP mode. Opt-in, and required when MCP_HTTP_PUBLIC=true. Leave empty for stdio (local) use. |
| `PORT` | No | No | HTTP port when running in hosted (HTTP) mode; ignored in stdio mode |

| Variable | Required | Description |
|---|---|---|
| `MCP_AUTH_USER_KEY` | Required | Long-lived user key (exchanged for a session token) |
| `MCP_OTEL_ENABLED` | Optional | Set to `true` to enable OpenTelemetry tracing |
| `MCP_API_BASE_URL` | Required | Upstream API root. The user-key exchange authenticates against it, so the server does not start without it |

## Bundled Skills

This package ships Claude Code slash-commands under `.claude/commands/`. After install, invoke them from Claude Code:

- `/getting-started` — step-by-step workflow guide
- `/signature-lifecycle` — step-by-step workflow guide
- `/notification-lifecycle` — step-by-step workflow guide
- `/notification-attachments` — step-by-step workflow guide
- `/evidence-lifecycle` — step-by-step workflow guide
- `/dossier-lifecycle` — step-by-step workflow guide

See [docs/agent-prompts.md](docs/agent-prompts.md) for end-to-end prompt examples and the tool sequences they trigger.

## Prefer to code against the REST API directly?

You don't have to go through this MCP server. This repo also ships a **Claude Code skill** — a standalone integration guide (authentication, call ordering, options, enums, gotchas) for programming directly against the REST API:

- **Skill:** [`.claude/skills/gocertius-suite-api/SKILL.md`](.claude/skills/gocertius-suite-api/SKILL.md) — open this repo in Claude Code and it is available directly.
- **As a reference:** [docs/api-integration-skill.md](docs/api-integration-skill.md).

It is independent of the MCP tools and the n8n node — pick whichever entry point fits your integration.

## Available Tools

This server exposes **86 tools**:

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
| `dossier_list_by_user` | Lists every dossier belonging to a user, across all of their case files. Requires: userId (from session_login or session_info). Use this when you do not know which case file a dossier is in; use dossier_list when you already have a caseFileId. Supports filter, order and page. Returns { data, meta.totalElements }. |
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
| `dossier_evidence_list` | Lists the evidence items linked to ONE evidence group of a dossier. Requires: caseFileId, dossierId AND dossierEvidenceGroupId — all three are mandatory. For every evidence item in the dossier regardless of group, use dossier_evidence_list_by_dossier instead. Supports filter, order and page. |
| `dossier_evidence_list_by_dossier` | Lists every evidence item linked to a dossier, across all of its evidence groups. Requires: caseFileId and dossierId. This is the dossier-wide view; dossier_evidence_list is the narrower per-group one and additionally needs a dossierEvidenceGroupId. Supports filter, order and page. Returns { data, meta.totalElements }. |
| `dossier_evidence_get` | Retrieves details of a specific evidence item linked to a dossier. Requires: caseFileId, dossierId, evidenceId. |
| `dossier_evidence_delete` | Removes an evidence item from a dossier. Only available while dossier is in DRAFT status. Requires: caseFileId, dossierId, evidenceId. |
| `notification_document_add` | Attaches a document to a notification. Two steps: this call registers the file and returns { url }, a presigned upload URL, and you then PUT the raw bytes to that URL with an x-amz-checksum-sha256 header. Generate a UUID v4 for `id`, and compute the file's SHA-256 hex hash BEFORE calling — it goes in `hash`. ORDER MATTERS AND GETTING IT WRONG FAILS THE SEND: add every document BEFORE adding recipients, and wait until each document reaches READY_TO_SEND (poll notification_document_list; roughly 8 seconds) before calling notification_request_send. Attaching after recipients, or sending while a document is still PENDING, returns 409/404 NOTIFICATION_NOT_FOUND. The maximum number of attachments is a per-subscription setting rather than a fixed API limit, so do not assume a number. Attachments can be bundled into the delivery certificate — see notification_certificate_package_url. |
| `notification_request_create` | Creates a certified notification request. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set language to en_GB or es_ES. Returns notificationRequestId. Add at least one receiver with notification_receiver_add before sending. IMPORTANT: The `content` field must be valid HTML — plain text without HTML tags will not render on the recipient landing page. Only the following HTML formats are supported: paragraphs (<p>), bold (<strong>), italic (<em>), unordered lists (<ul><li>), ordered lists (<ol><li>). Do not use other HTML tags or CSS. Avoid special typographic characters (em dashes, smart quotes) in `subject`; use standard ASCII equivalents (hyphen, straight quotes) instead. |
| `notification_request_send` | Sends the certified notification to all added receivers. Requires: notification_request_create → notificationRequestId, notification_receiver_add (at least one receiver), case_file_create → caseFileId. ASYNC: triggers delivery. Poll notification_request_status until status is SENT or beyond (PARTIALLY_READ, FULLY_READ) before generating certificates. |
| `notification_request_status` | Checks the delivery status of a certified notification. Requires: notificationRequestId, caseFileId. Returns status (CREATING|DRAFT|IN_PROCESS|SENT|PARTIALLY_READ|FULLY_READ|PARTIALLY_ANSWERED|FULLY_ANSWERED). Poll until status is SENT or beyond. Do not call notification_certificate_get while status is CREATING, DRAFT, or IN_PROCESS. |
| `notification_receiver_add` | Adds a recipient to a notification request. Requires: notification_request_create → notificationRequestId, case_file_create → caseFileId. The `id` can be a UUID v4 or custom string. Returns receiverId — save it for notification_certificate_get. Delivery is by email always; set sendWaUrl for a WhatsApp link, sendSmsUrl for an RCS/SMS link (the channel negotiates: RCS where the handset supports it, SMS otherwise), and otpRequired to challenge the recipient with a one-time code. Any of those three needs phonePrefix (with the +) and phoneNumber. Add all receivers before calling notification_request_send — but if the notification has attachments, add those FIRST (see notification_document_add). |
| `notification_certificate_get` | Generates or retrieves a PDF certificate for a specific receiver proving delivery and/or reading/answer of the notification. Requires: notification_request_send, notification_receiver_add → receiverId, notificationRequestId, caseFileId. Generate a UUID v4 for `id` the first time you request a certificate for that receiver and reuse that same id when polling. Call only after notification_request_status is SENT or beyond, and prefer READ/ANSWERED states when the notification type expects recipient action. The first call may return {} while the certificate is being generated; poll/re-call notification_certificate_get until the response includes a pdfUrl/documentUrl or a CERTIFIED/final status. If the backend returns Forbidden/Unexpected, stop polling the certificate endpoint and poll notification_request_status instead; retry with the same certificate id only after the notification reaches a more complete state or the UI shows evidence available. For ACCEPTED_OR_NOT notifications, call after a certifiable delivery/read state for an intermediate certificate and again after PARTIALLY_ANSWERED/FULLY_ANSWERED for the final answer certificate. |
| `notification_request_list` | Lists the certified notifications visible to a user. Requires userId (from session_login, session_info or profile_get) — this listing is user-scoped, not case-file-scoped, so it spans every case file unless you filter. Use this to recover a notificationRequestId you no longer have; it is the only way to find one. Returns per notification: id, code, subject, status, type, sentAt, receiverStats and the owning caseFile. Filter by `status` or `statuses` (CREATING, DRAFT, IN_PROCESS, SENT, PARTIALLY_READ, FULLY_READ, PARTIALLY_ANSWERED, FULLY_ANSWERED), by `caseFileIds`, by `search` over the subject, or by `receiversSearch` to find the notification sent to a given recipient. Paginated. |
| `notification_request_update` | Edits a notification that has not been sent: subject, content, type and language. Requires notificationRequestId and caseFileId. `content` must be valid HTML — plain text is accepted by the API but does NOT render on the recipient landing page. Supported tags only: <p>, <strong>, <em>, <ul><li>, <ol><li>; no other tags and no CSS. Keep `subject` to plain ASCII (no em dashes, no smart quotes), 100 characters maximum. TESTED: once the notification has been sent the API rejects this with 403 Forbidden, so editing only works before the send. To change which case file it belongs to use notification_request_case_file_move — this tool does not move it. |
| `notification_request_delete` | Deletes a notification. Requires notificationRequestId and caseFileId. There is no undo. TESTED: once the notification has been sent the API rejects this with 403 Forbidden — a sent notification is delivery evidence and cannot be removed. If you only want it filed elsewhere, use notification_request_case_file_move instead. |
| `notification_request_duplicate` | Creates a new DRAFT notification from an existing one, copying its content, its recipients and its attachments. Works whatever state the original is in, so this is how you resend to the same people or reuse a sent notification as a template. Generate a UUID v4 for `id` and supply a new `subject`; pass `caseFileId` in the body to place the copy in a different case file, or omit it to keep it alongside the original. THE COPY IS BUILT ASYNCHRONOUSLY: it starts in CREATING with zero recipients and zero documents, and fills in afterwards, so reading it immediately shows an empty notification that is not empty. Poll notification_request_status until the status is DRAFT before inspecting or sending it. Because recipients ARE copied, review them with notification_receiver_list before calling notification_request_send — otherwise you will send to the original list again. |
| `notification_request_case_file_move` | Moves a notification to a different case file. Note the two caseFileId values: the one in the path is where the notification is NOW, and the one in the body is the destination. Notifications are grouped by case file, and this is the only way to change that grouping without duplicating. |
| `notification_receiver_list` | Lists a notification's recipients with their individual delivery state. Returns per recipient: id, firstName, lastName, email, phonePrefix/phoneNumber, status (INVALID, READY_TO_SEND, SENT, READ, ANSWERED, ERROR), statusUpdatedAt, `answer` once they respond, emailBounced, and validationError (TAKEN, IS_DEFINED, IS_INVALID) for a rejected address. Worth calling before notification_request_send to see whether any address came back INVALID, and after sending to see who read or answered. Also the way to recover a receiverId for notification_certificate_get. Paginated; filterable by id. |
| `notification_receiver_update` | Corrects a recipient's details: firstName, lastName, email, phonePrefix, phoneNumber. Requires receiverId, notificationRequestId and caseFileId. Use this to fix a mistyped address rather than deleting and re-adding, which would lose the receiverId. phonePrefix must include the + (for example +34). A phone number is required if the recipient is to receive the RCS/SMS link (sendSmsUrl), the WhatsApp link (sendWaUrl), or an OTP challenge (otpRequired). |
| `notification_receiver_delete` | Removes a recipient from a notification. Requires receiverId, notificationRequestId and caseFileId. To remove every address the platform rejected in one call, use notification_receiver_invalid_purge rather than deleting them one by one. |
| `notification_receiver_add_bulk` | Adds several recipients in one call instead of one notification_receiver_add per person. Pass `receivers` as an array; each entry needs `id` (you generate it), firstName, lastName and email, and may carry phonePrefix (with the +) and phoneNumber. Note this bulk form does NOT accept the per-recipient otpRequired, sendWaUrl or sendSmsUrl flags that the single-recipient tool does — set the defaults on the request instead (otpByDefault, sendWaUrlByDefault, sendSmsUrlByDefault). The maximum number of recipients is a per-subscription setting, not a fixed API limit: it varies by tenant and platform, so do not assume a number — add them and read the error if the tenant's cap is exceeded. Add every recipient before calling notification_request_send, then check the result with notification_receiver_list, since a rejected address appears with status INVALID. |
| `notification_receiver_invalid_purge` | Removes every recipient whose status is INVALID — addresses the platform rejected as malformed or duplicated — from a notification in a single call. Requires notificationRequestId and caseFileId. Recipients in any other status are left untouched. AN INVALID RECIPIENT BLOCKS THE SEND, so run this (or fix the addresses with notification_receiver_update) before notification_request_send, or the notification will not go out. Use notification_receiver_list first to see what will go. |
| `notification_document_list` | Lists the documents attached to a notification with their processing status, and it is what you poll after notification_document_add: a newly registered document starts at PENDING and reaches READY_TO_SEND in roughly 8 seconds. Calling notification_request_send while any document is still PENDING fails with 409/404 NOTIFICATION_NOT_FOUND. Poll with a bounded retry — every few seconds, a dozen attempts at most. Requires notificationRequestId and caseFileId. Paginated. |
| `notification_document_delete` | Removes an attachment from a notification. Requires documentId (from notification_document_list), notificationRequestId and caseFileId. |
| `notification_document_download_url` | Returns { downloadUrl }, a temporary link to an attachment as it was sent. Requires documentId (from notification_document_list), notificationRequestId and caseFileId. Use it to retrieve a file you attached or to verify what a recipient received. The URL is presigned and expires — fetch it when you need it rather than storing it. |
| `notification_certificate_list` | Lists the delivery certificates already generated for one recipient, so you can reuse one instead of generating a duplicate. Requires receiverId, notificationRequestId and caseFileId. Returns per certificate: id, status (DRAFT, CERTIFYING, CERTIFIED), language, createdAt, certifiedAt, `partial` — whether it is an intermediate certificate issued before the recipient finished responding — and `embeddedDocuments`. Do not read `embeddedDocuments` as "the package contains the attachments": in a tested run it was false on a notification that had an attachment, and notification_certificate_package_url still returned a ZIP carrying that attachment. Once a certificate is CERTIFIED, download it with notification_certificate_document_url (the certificate alone) or notification_certificate_package_url (a ZIP that also carries the attachments). |
| `notification_certificate_document_url` | Returns { documentUrl } for the certificate PDF on its own, WITHOUT the attachments. Requires certificateId, receiverId, notificationRequestId and caseFileId. Wait until the certificate is CERTIFIED: generation is asynchronous and the first call can 404 or come back empty while it is still CERTIFYING, so poll a few times with a bounded retry rather than hammering it. If you want the attachments bundled in, use notification_certificate_package_url instead. |
| `notification_certificate_package_url` | Returns { packageUrl } for a ZIP containing the certificate AND the notification's attachments — the "with annexes" form. There is no separate preview flag anywhere in the API: the package carries the annexes, the document is the certificate alone. Requires certificateId, receiverId, notificationRequestId and caseFileId. Same preconditions as notification_certificate_document_url — wait for CERTIFIED, and expect the first call to fail while generation is still running. |
| `case_file_create` | Creates a new case file — the top-level container for all related operations (evidence, notifications, signatures, dossiers). Call this first before any other operation. Generate a UUID v4 for `id`. Returns caseFileId needed for all subsequent calls. |
| `case_file_list` | Lists all case files in your EAD Enterprise Suite account. Pass userId (from session_login or session_info) to scope results to your account. Returns paginated list with IDs, names, and status. |
| `case_file_get` | Retrieves details of a specific case file. Requires: caseFileId. Use to verify a case file exists before creating evidence groups, dossiers, or signature requests. |
| `case_file_delete` | Deletes a case file and everything filed inside it — evidence groups, dossiers, notifications and their certificates. Irreversible, with no confirmation step and no recycle bin. Requires: caseFileId. Returns no body (HTTP 204); confirm with case_file_list. Do not call it to 'clean up' unless the user asked for that case file to be destroyed. |
| `session_login` | Forces the MCP server to re-authenticate with EAD Enterprise Suite. Takes NO parameters and accepts no credentials — the server re-exchanges the user key it was configured with (MCP_AUTH_USER_KEY) for a fresh session token and reports the resulting userId and expiry. The MCP server manages authentication automatically; call this only if you hit 401 errors. When the server holds no credential of its own (none configured, or you supplied your own Bearer token) there is no session of ours to renew and the tool returns an error naming MCP_AUTH_USER_KEY. |
| `session_info` | Retrieves information about the current authenticated session: userId, `type` (how this MCP session authenticated — always UserKey, the server's only auth flow), `accountLoginType` (a different fact: how the EAD Enterprise Suite account itself signs in, Password or OpenId, null if the API omits it), email, companyId and defaultCaseFileId. Identity is resolved via GET /profile. If you only need the userId, prefer profile_get — it is the canonical source (`id`) and returns the rest of the profile too. No required parameters. |
| `profile_get` | Returns the authenticated user's own profile. It identifies the caller from the session token alone — no email or any other input needed — so it works on every deployment, including a per-request Bearer one. Its `id` field IS your userId (UUID): the value required by case_file_list and every /users/{userId}/... operation. Prefer this over session_info when you need the userId: it is the canonical source. Also returns companyId (needed to subscribe to the notifications SSE stream) and defaultCaseFileId. Also returns `permit`, a set of booleans — { evidences, idVerifications, notifications, chats, signatures } — that says which tool families this account may use at all: a false entry means every tool in that family returns 403 regardless of inputs, and no retry or different argument will help. Read it before calling into a family for the first time; on the integration deployment checked on 2026-09-07, permit.idVerifications was false and every identity tool returned 403 NoIdVerificationsPermit. No parameters. |
| `use_case_list` | Lists available use cases for the account. Use cases define the allowed signature workflows and document types. Returns useCaseId values needed for signature_request_create. |
| `id_verification_video_create` | Starts a REMOTE VIDEO identity verification for one person: the platform contacts them and runs the identification session. Requires: id (UUID v4 you generate), name, firstSurname, email, phonePrefix and phoneNumber. phonePrefix must include the leading + (for example '+34'). secondSurname is optional. Returns HTTP 201 with NO body, so keep the id you generated — it is the verificationId, and id_verification_list is the only way to read the outcome. PERMIT-GATED: call profile_get first and check permit.idVerifications; if it is false every call here returns 403 with code NoIdVerificationsPermit and no argument change will help, so report it rather than retrying. Presential (in-person) identity verification is deprecated upstream and deliberately not exposed. |
| `id_verification_list` | Lists the identity verifications belonging to a user, with the outcome of each. Requires: userId (from profile_get). Items are { id, email, name, firstSurname, secondSurname, status, identificationType, createdAt, createdBy, rejectedReason, rejectedContext }, so this is where you read whether a verification succeeded and, when it did not, why. Supports filter, order and page. This is the only way to observe an id_verification_video_create, which returns no body. PERMIT-GATED: returns 403 with code NoIdVerificationsPermit when profile_get reports permit.idVerifications === false. |
| `id_verification_contract_url` | Retrieves the signed identity-verification contract for one completed verification. Requires: verificationId — the id you generated for id_verification_video_create, or an id from id_verification_list. NOTE: the OpenAPI specification declares a 200 response with NO body for this operation, so the exact payload is undeclared and has not been observed against a working deployment; inspect what comes back rather than assuming a particular field. PERMIT-GATED: returns 403 with code NoIdVerificationsPermit when profile_get reports permit.idVerifications === false. Signing the contract requires two live OTPs and is deliberately not exposed as a tool. |
| `signature_group_create` | Creates a signing order group for a CONFIGURABLE signature request. Types: 'Document' (groups documents into signing rounds — use its id as groupId in signature_request_add_document), 'Signatory' (groups signatories into signing rounds — use its id as groupId in signature_participant_create), 'DocumentSignatory' (links a specific document to a signing round, requires documentId). IMPORTANT — avoid empty groups: when a CONFIGURABLE request is created, the API automatically pre-creates one Document group and one Signatory group both at index:1. Always use these pre-existing index:1 groups for your first document and first signatory (retrieve their IDs with signature_group_list immediately after creating the request). Only call signature_group_create for the ADDITIONAL groups (index:2, 3…). Add participants with linkToAllDocuments:true so DocumentSignatory groups are auto-generated at the correct index. Adding participants without linkToAllDocuments leaves them unlinked to documents and signature_coordinate_set will fail with 'Signatory not found'. |
| `signature_group_list` | Lists all signing order groups of a CONFIGURABLE signature request. Returns id, type (Document/Signatory/DocumentSignatory), index, and documentId for each group. Call immediately after signature_request_create to retrieve the pre-created index:1 group IDs before adding documents or participants. |
| `signature_request_create` | Creates a new signature request in DRAFT status. Requires: case_file_create → caseFileId. Generate a UUID v4 for `id`. Set deadline as ISO 8601 datetime (max ~30 days ahead). Returns requestId. Add documents with signature_request_add_document and participants with signature_participant_create before activating. |
| `signature_request_get` | Retrieves full details of a signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Returns status, documents, participants, deadline, and history. Use to check overall process state. |
| `signature_request_cancel` | Cancels an active signature request. Requires: activate_signature_request (ACTIVE status), requestId, caseFileId. Transitions to CANCELLED. Cannot be undone. |
| `signature_request_add_document` | Adds a document to a DRAFT signature request. Requires: signature_request_create → requestId, case_file_create → caseFileId. Provide a string `id` for the document; that same id is the documentId for coordinates and certificates. Compute SHA-256 hex hash of the PDF before calling. Returns url (presigned S3 upload URL). You MUST PUT the exact PDF bytes to url, then allow backend processing before activation: poll signature_request_get for processed/READY_TO_SIGN if the API exposes it; if the response does not include document processing fields, wait a short processing window after the successful PUT, set PDF coordinates, then activate and confirm status ACTIVE with signature_request_get. signature_document_list reports a document-level status and signatoryCoordinatesStats (useful for the coordinates precondition), but it is not verified to report upload processing for a freshly added document — use signature_request_get for that. Cannot add documents after activate_signature_request is called. For CONFIGURABLE sequence: `groupId` must reference a Document type group (not Signatory or DocumentSignatory) — passing a wrong group type returns 'Signature group not found'. |
| `signature_document_list` | Lists the documents of a signature request with a document-level status and per-document statistics. Requires: signature_request_create → requestId, case_file_create → caseFileId. Items are { id, requestId, groupId, status, title, fileName, fileSize, convertToPdf, participantStats, signatoryStatusStats, signatoryCoordinatesStats } — for example status PARTIALLY_SIGNED with signatoryStatusStats { pending: 0, readyToSign: 1, signed: 1, rejected: 0 } and signatoryCoordinatesStats { defined: 2, missing: 0 } (live-read on INT 2026-09-07). signatoryCoordinatesStats.missing === 0 is the direct check that every required signatory has coordinates before activate_signature_request. Whether this status also reports upload processing for a freshly added document is NOT verified — keep using signature_request_get for that. For the signatories of one document use signature_document_signatory_list. |
| `signature_document_signatory_list` | Lists the SIGNATORIES of one document in a signature request, with each signatory's status on that document. Requires: signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Items are { id, groupId, email, firstName, lastName, status, coordinates, uniqueValidator, phonePrefix, phoneNumber, participantStats } and status is PENDING, READY_TO_SIGN, VALIDATING, SIGNED or REJECTED. Each `id` is a signatoryId. To check whether the DOCUMENT itself reached READY_TO_SIGN before activate_signature_request, use signature_request_get; after activation poll here until every signatory is SIGNED before signature_certificate_get. |
| `signature_document_observer_list` | Lists the OBSERVERS of one document in a signature request — participants created with role OBSERVER, who receive a copy but never sign. Requires: signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Items carry only { id, email, firstName, lastName }: there is deliberately no status field, because an observer has nothing to complete. For the signers of the same document use signature_document_signatory_list. |
| `signature_signatory_progress_list` | Lists the documents assigned to ONE signatory of a signature request, with that signatory's progress on each. Requires: caseFileId, requestId and signatoryId. The signatoryId is the `id` of a participant whose role is SIGNATORY — read it from signature_participant_list or signature_document_signatory_list. Passing a participant id whose role is not SIGNATORY returns 404 'Signatory not found' — observed on INT 2026-09-07 with a VALIDATOR id; it is one id space, but the signatory-scoped endpoints accept only the ids of SIGNATORY participants. Returns { data, meta.totalElements } with items { id, fileName, fileSize, status }, where status is PENDING, READY_TO_SIGN, SIGNED or REJECTED. |
| `signature_participant_create` | Adds one participant to a DRAFT signature request. This is the ONLY participant create endpoint: `role` selects SIGNATORY (must sign), OBSERVER (receives a read-only copy) or VALIDATOR (must approve before its signatory can sign). Requires: signature_request_create → requestId, case_file_create → caseFileId, plus role, firstName, lastName and email. YOU generate `id` (UUID v4) and the call returns HTTP 201 with NO body, so nothing is handed back — the id you generated IS the participantId, and it is the signatoryId if you passed role SIGNATORY or the validatorId if you passed role VALIDATOR. Keep it. For ADVANCED signatures phonePrefix and phoneNumber are mandatory because the signer receives the OTP there, and WhatsApp delivery is NOT supported for ADVANCED; for INTERPOSITION phone is optional and WhatsApp is available when the platform is configured for it. Add at least one SIGNATORY before activating. For role VALIDATOR do NOT include groupId or linkToAllDocuments — link it afterwards with assign_validator_to_signatory. Use signature_participant_add_bulk to add many at once, and signature_participant_list to re-read what exists. |
| `signature_participant_add_bulk` | Adds many participants to a DRAFT signature request in one call instead of one signature_participant_create per person. Requires: signature_request_create → requestId, case_file_create → caseFileId, and a `participants` array whose entries take the same fields as signature_participant_create, including the `id` and `role` you generate for each. Mixed roles in one call are allowed. Returns HTTP 201 with NO body, so keep the ids you minted and re-read the result with signature_participant_list. |
| `signature_participant_list` | Lists every participant of a signature request with the role each was created under — SIGNATORY, OBSERVER or VALIDATOR — plus contact details and validity. Requires: signature_request_create → requestId, case_file_create → caseFileId. Items are { id, requestId, groupId, role, firstName, lastName, email, phonePrefix, phoneNumber, createdAt, editable, emailBounced, valid, validationError, participantStats, documentStats }. This is the tool that resolves ids: an item's `id` is the participantId, and it is also the signatoryId when role is SIGNATORY and the validatorId when role is VALIDATOR. Supports filter, order and page. |
| `signature_participant_update` | Corrects a participant's details before the signature request is activated. Requires: signature_participant_create → participantId, signature_request_create → requestId, case_file_create → caseFileId. Any of groupId, firstName, lastName, email, phonePrefix and phoneNumber may be sent. The role CANNOT be changed, so to turn a signatory into an observer, delete it and create it again. Use this to repair a bounced or mistyped email — signature_participant_list reports emailBounced and validationError. Returns no body; confirm with signature_participant_list. |
| `signature_participant_delete` | Removes one participant from a signature request. Requires: signature_participant_create → participantId, signature_request_create → requestId, case_file_create → caseFileId. Use it to drop someone added by mistake, or to change a role (delete, then create again with the new role, since role is not updatable). Returns no body; confirm with signature_participant_list. To drop every invalid participant at once use signature_participant_invalid_purge instead. |
| `signature_participant_invalid_purge` | Removes every participant of a signature request that the platform has marked invalid, in one call. Requires: signature_request_create → requestId, case_file_create → caseFileId. signature_participant_list identifies them via `valid: false` and `validationError` — typically an undeliverable email or a malformed phone number. Returns no body; confirm with signature_participant_list. Prefer signature_participant_update when the detail can be repaired rather than the person dropped. |
| `assign_validator_to_signatory` | Assigns one or more validators to a specific signatory in a signature request. The validator must approve before the signatory can sign. Requires: signature_participant_create (validator) → validatorId in validatorIds array, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. |
| `signature_validator_list` | Lists the validators currently linked to ONE signatory of a signature request. Requires: signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. Items carry { id, email, firstName, lastName }, where each `id` is a validatorId. Note the two-step model: creating a participant with role VALIDATOR does not attach it to anyone, so a validator can exist on the request and not appear here until assign_validator_to_signatory links it — an empty list means nothing is linked yet, not that no validator exists. |
| `signature_validator_unassign` | Unlinks one validator from one signatory, reversing assign_validator_to_signatory. Requires: signature_validator_list → validatorId, signature_participant_create (signatory) → signatoryId, signature_request_create → requestId, case_file_create → caseFileId. This removes the LINK only: the validator remains a participant of the request, so use signature_participant_delete to remove the person entirely. Returns no body; confirm with signature_validator_list. |
| `activate_signature_request` | Activates a signature request, transitioning from DRAFT to ACTIVE and sending signing invitations to all signatories. Do NOT call this immediately after uploading files. Activation preconditions: request is DRAFT; at least one SIGNATORY exists; every document has been uploaded to its presigned URL; backend processing has had time to complete for every uploaded document (use processed/READY_TO_SIGN from signature_request_get when exposed; otherwise wait after the successful PUT); and PDF documents have signature coordinates set for every required signatory. INTERPOSITION may send a simple signing link, including WhatsApp when available/configured; ADVANCED uses phonePrefix/phoneNumber for OTP and currently does not support WhatsApp delivery. IRREVERSIBLE: cannot add documents or participants after activation. ASYNC: after activation, poll signature_request_get until status is ACTIVE, then use signature_document_signatory_list with documentId to monitor each signatory, or signature_document_list for the request's documents and their aggregate signatoryStatusStats; call signature_certificate_get only after the document is SIGNED. |
| `signature_coordinate_set` | Sets the visual position of the signature field on a PDF document page. Required for PDF documents before activation, for both INTERPOSITION and ADVANCED signatures. Requires: signature_participant_create → signatoryId, signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Provide coordinates as array of {page (1-based), x (points from left), y (points from bottom)}. Set coordinates after the document has been uploaded and before activate_signature_request. |
| `signature_certificate_get` | Retrieves the signed document certificate PDF. Requires: activate_signature_request (document fully SIGNED), signature_request_add_document → documentId, signature_request_create → requestId, case_file_create → caseFileId. Returns documentUrl (signed PDF certificate). ASYNC: poll until documentUrl is available. |
| `large_evidence_upload_initiate` | Initiates a large file upload for an evidence group against the EAD Enterprise Suite API. Required: id, caseFileId, evidenceGroupId, title, fileName, hash (SHA-256 hex), fileSize (bytes), custodyType. Returns a multipart upload ID and presigned URLs for each part. Use for files over 5 MB. Follow with large_evidence_upload_complete once all parts are uploaded. |
| `large_evidence_upload_complete` | Completes a large file upload and seals the evidence group. Requires: large_evidence_upload_initiate → upload parts completed, case_file_create → caseFileId, evidence_group_create → evidenceGroupId. ASYNC: triggers TSP timestamping. Poll evidence_group_list until status === CLOSED. |
| `large_evidence_upload_get` | Reports how much of a large evidence upload the platform has actually received. Requires: caseFileId, evidenceGroupId and the evidence id. Returns fileName, totalSizeMB, chunkSizeMB and biggestUploadedOffset — compare biggestUploadedOffset against totalSizeMB to decide whether every part landed before calling large_evidence_upload_complete. Use it to resume or diagnose a stalled upload. |
| `evidence_upload` | Uploads a local file as evidence in one step: computes its SHA-256, registers the evidence record (custodyType INTERNAL = EAD stores the file), and uploads the bytes to S3 — no manual hashing or PUT needed. Internally this follows the required EAD sequence: create INTERNAL evidence → receive uploadFileUrl (presigned S3 URL) → PUT file bytes → return uploaded:true. Requires: case_file_create → caseFileId, evidence_group_create → evidenceGroupId. Provide EXACTLY ONE of `filePath` (absolute local path, stdio/local mode only) or `contentBase64` (base64-encoded file content, ~10 MB max). Use evidence_upload when the file is on the local machine; use evidence_create when you already have the SHA-256 hash, need to inspect/use uploadFileUrl manually, or have a public fileUrl. After this tool succeeds, verify with evidence_get/evidence_list and only then call evidence_seal. If this tool fails before returning an evidence id, check evidence_list before retrying; if retrying manually, use evidence_create with a fresh UUID. Local files must be under 1 GiB. |
| `notification_send` | Sends a certified notification to one or more recipients in a single call: creates the notification request, adds every recipient, and sends it. Generates every UUID itself — do not pass any id. Requires case_file_create → caseFileId. `content` MUST be HTML: plain text is accepted by the API and reports SENT but does not render on the recipient's landing page. Supported tags only: <p>, <strong>, <em>, <ul><li>, <ol><li> — no other tags, no CSS. Keep `subject` to plain ASCII, 100 characters maximum. Delivery is always by email; per recipient you can additionally set sendWaUrl (WhatsApp), sendSmsUrl (RCS or SMS depending on the handset) and otpRequired (one-time code), each of which needs phonePrefix with the + and phoneNumber. The maximum number of recipients is a per-subscription setting, not a fixed limit, so none is enforced here — the API rejects an oversized batch. This tool does NOT attach files; use notification_send_with_attachments for that, because attachments must be registered before recipients are added. PARTIAL SUCCESS IS REPORTED, NOT THROWN: if the request was created but a recipient or the send failed, the result still carries notificationRequestId together with recipientsAdded, recipientsFailed and sent:false, so you can finish with notification_receiver_add and notification_request_send instead of abandoning a draft. An INVALID recipient blocks the send, so this tool checks for one before sending and reports invalidRecipients rather than attempting a send that cannot succeed. If the initial create fails the tool raises an error instead: common causes are a caseFileId that does not exist, a subject over 100 characters, and an exhausted contracted notification plan, which no retry will fix. If that error is a timeout rather than a rejection, check notification_request_list before retrying — the request may have been created anyway. Poll notification_request_status for delivery progress, then notification_certificate_get per recipient. |
| `notification_send_with_attachments` | Sends a certified notification WITH one or more attached documents to one or more recipients, in a single call. Use notification_send instead when there are no attachments. This tool exists separately because attachments impose an ordering rule the API enforces and does not forgive: documents must be registered and fully uploaded BEFORE any recipient is added, and every document must reach READY_TO_SEND before the notification is sent — otherwise the send fails with 409/404 NOTIFICATION_NOT_FOUND. The tool performs that whole sequence for you: create → register and upload each document → wait for READY_TO_SEND → add recipients → send. Each attachment takes a local file path, base64 content, an HTTPS URL, or an n8n binary reference; the hash and the upload are handled internally. Generates every UUID itself — do not pass any id. Requires case_file_create → caseFileId. `content` MUST be HTML: plain text is accepted by the API and reports SENT but does not render on the recipient's landing page. Supported tags only: <p>, <strong>, <em>, <ul><li>, <ol><li>. Keep `subject` to plain ASCII, 100 characters maximum. Delivery is always by email; per recipient you can additionally set sendWaUrl (WhatsApp), sendSmsUrl (RCS or SMS depending on the handset) and otpRequired (one-time code), each of which needs phonePrefix with the + and phoneNumber. The maximum number of attachments and of recipients are per-subscription settings, not fixed limits, so neither is enforced here. IF AN ATTACHMENT FAILS THE RUN STOPS BEFORE RECIPIENTS ARE ADDED, on purpose: once recipients exist the API will not accept further documents, so continuing would produce a notification that can never carry the missing file. The result reports the draft's notificationRequestId so you can retry or delete it. An INVALID recipient blocks the send, so the tool checks for one before sending and reports invalidRecipients instead of attempting a doomed send. If the initial create fails the tool raises an error instead: common causes are a caseFileId that does not exist, a subject over 100 characters, and an exhausted contracted notification plan, which no retry will fix. If that error is a timeout rather than a rejection, check notification_request_list before retrying — the request may have been created anyway. Certificates can bundle the attachments — see notification_certificate_package_url. |

## Coexistence

This MCP server is the **current, actively maintained** interface for the EAD Enterprise Suite API.

If you previously used an earlier MCP server for EAD Enterprise Suite (prior to v1.0), note that this server supersedes it. Both servers can run side-by-side during a migration window — they connect to the same upstream API and share no local state. To avoid duplicate tool names in multi-server MCP setups, run only one at a time once migration is complete.

## License

MIT — see [LICENSE](LICENSE).
