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
| **MCP Official Registry** | Auto-discovered as `io.github.g-digital-by-Garrigues/ead-enterprise-suite` by any client that reads the registry — [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/v0/servers/io.github.g-digital-by-Garrigues/ead-enterprise-suite) |
| **n8n community node** | In n8n Settings → Community Nodes → install `@g-digital/n8n-nodes-ead-enterprise-suite` (works with the AI Agent node via `usableAsTool`) — [npmjs.com/package/@g-digital/n8n-nodes-ead-enterprise-suite](https://www.npmjs.com/package/@g-digital/n8n-nodes-ead-enterprise-suite) |
| **Smithery** | `smithery mcp install g-digital/ead-enterprise-suite` (from v1.0.7) — [smithery.ai/servers/g-digital/ead-enterprise-suite](https://smithery.ai/servers/g-digital/ead-enterprise-suite) |

Every channel ships the same MCP server contract; the tools and env-var configuration below apply regardless of which install path you choose.

## Installation

### Claude Desktop

```json
{
  "mcpServers": {
    "ead-enterprise-suite": {
      "args": [
        "-y",
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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
        "mcp-ead-enterprise-suite"
      ],
      "command": "npx",
      "env": {
        "MCP_AUTH_EMAIL": "",
        "MCP_AUTH_PASSWORD": "<PASTE_MCP_AUTH_PASSWORD_HERE>",
        "MCP_OPENID_CLIENT_ID": "",
        "MCP_OPENID_ISSUER": "",
        "MCP_OPENID_REFRESH_TOKEN": "<PASTE_MCP_OPENID_REFRESH_TOKEN_HERE>",
        "PORT": ""
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

| Name | Required | Secret | Description |
| --- | --- | --- | --- |
| `MCP_AUTH_EMAIL` | Yes | No | Flow 1: Email / password description: Your GoCertius account email address isSecret: false |
| `MCP_AUTH_PASSWORD` | Yes | Yes | description: Your GoCertius account password isSecret: true (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) |
| `MCP_OPENID_CLIENT_ID` | Yes | No | description: OpenID Connect client ID isSecret: false |
| `MCP_OPENID_ISSUER` | Yes | No | Flow 2: OpenID Connect (alternative to email/password) description: OpenID Connect issuer URL isSecret: false |
| `MCP_OPENID_REFRESH_TOKEN` | Yes | Yes | description: OpenID Connect refresh token isSecret: true (See https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/ for credential acquisition.) |
| `PORT` | Yes | No | Transport (optional) description: HTTP port when running in hosted (HTTP) mode; ignored in stdio mode isSecret: false |

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

For credential setup instructions, visit: [https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/](https://www.eadtrust.eu/soluciones-legaltech/enterprise-suite/)

## Bundled Skills

This package ships Claude Code slash-commands under `.claude/commands/`. After install, invoke them from Claude Code:

- `/getting-started` — authentication, finding your case file, generating valid UUIDs
- `/signature-lifecycle` — full signature workflow (quick path + step-by-step)
- `/evidence-lifecycle` — certified evidence creation and sealing
- `/notification-lifecycle` — certified notification delivery
- `/dossier-lifecycle` — template-driven certified dossier creation

See [docs/agent-prompts.md](docs/agent-prompts.md) for end-to-end prompt examples and the tool sequences they trigger.

## Available Tools

This server exposes **31 tools**:

| Tool | Description |
|------|-------------|
| `evidence_create` | Add a file to an open evidence group. Returns a presigned S3 upload URL for INTERNAL custody; records only the hash for EXTERNAL. |
| `evidence_list` | List all evidence items in an evidence group, filterable by status, date range, and type. |
| `evidence_seal` | Seal and certify an evidence group (long-running MCP task). Closes the group and timestamps all contained evidence. |
| `evidence_get` | Get full details of a single evidence item including status, hash, and custody type. |
| `evidence_group_create` | Create a new open evidence group. Type can be FILE, PHOTO, VIDEO, or WEB_PLUGIN. |
| `evidence_group_list` | List all evidence groups in a case file with their current status and evidence counts. |
| `dossier_create` | Create a certified dossier from a template. EAD certifies it automatically after creation. |
| `dossier_list` | List dossiers in a case file, filterable by status (DRAFT, CERTIFYING, CERTIFIED). |
| `dossier_get` | Get a dossier's details including the certified PDF download URL once CERTIFIED. |
| `dossier_template_list` | List available dossier templates. Use the returned `id` when calling `dossier_create`. |
| `notification_request_create` | Create a certified notification request in DRAFT status. Add recipients then call `notification_request_send`. |
| `notification_request_send` | Trigger delivery of a certified notification to all recipients (long-running MCP task — waits for DELIVERED). |
| `notification_request_status` | Get the current status and receiver statistics of a notification request. |
| `notification_receiver_add` | Add a recipient to a DRAFT notification request. Supports optional SMS OTP per recipient. |
| `notification_certificate_get` | Generate or retrieve the legal delivery certificate for a specific notification receiver. |
| `case_file_list` | List case files accessible to a user. Requires the `userId` returned by `session_login`. |
| `case_file_get` | Get details of a specific case file by its UUID. |
| `session_login` | Authenticate with EAD Enterprise Suite. Supports email/password and OpenID Connect (Azure AD device flow). |
| `session_info` | Look up the authentication type (Password or OpenID) configured for an email address. |
| `use_case_list` | List available use cases (workflow templates) in a company. |
| `signature_request_create` | Create a signature request envelope in DRAFT status. For the full automated flow use `signature_request_full_create`. |
| `signature_request_get` | Get the current status and details of a signature request. |
| `signature_request_cancel` | Cancel a signature request in DRAFT or ACTIVE status. |
| `signature_request_add_document` | Attach a PDF to a signature request and receive a presigned S3 upload URL. Hash must be SHA-256 hex. |
| `signature_document_list` | List documents in a signature request and check their processing status (poll for READY_TO_SIGN before activating). |
| `signature_participant_create` | Add a signatory, observer, or validator to a signature request. |
| `signature_participant_list` | List all participants linked to a signature request. |
| `activate_signature_request` | Activate a signature request, sending signing invitations to all participants. Documents must be READY_TO_SIGN first. |
| `signature_certificate_get` | Retrieve the legal signature certificate once the request reaches SIGNED or CLOSED status. |
| `large_evidence_upload_initiate` | Start a multipart upload for evidence files ≥ 10 MB. Returns presigned URLs for each chunk. |
| `large_evidence_upload_complete` | Finalize a multipart evidence upload and register the evidence in the group. |

## Coexistence

This MCP server is the **current, actively maintained** interface for the EAD Enterprise Suite API.

If you previously used an earlier MCP server for EAD Enterprise Suite (prior to v1.0), note that this server supersedes it. Both servers can run side-by-side during a migration window — they connect to the same upstream API and share no local state. To avoid duplicate tool names in multi-server MCP setups, run only one at a time once migration is complete.

## License

MIT — see [LICENSE](LICENSE).
