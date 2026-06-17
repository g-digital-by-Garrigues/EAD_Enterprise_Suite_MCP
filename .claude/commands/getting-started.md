# Getting Started (EAD Enterprise Suite)

Essential concepts and first steps for any workflow with EAD Enterprise Suite.

## Step 0 — Authenticate

Always call this first. Authentication is automatic — the server reads credentials from its environment:

```
session_login()
```

Returns a session JWT. To get `userId`, call `session_info()` immediately after (no parameters needed — it decodes the JWT):

```
session_info()  →  { userId: "<uuid>", type: "Password" }
```

Save `userId` — you need it to list your case files.

## Step 1 — Find your case file

Every operation in EAD requires a `caseFileId`. Case files are workspaces that group all your documents and processes.

```
case_file_list(userId: "<uuid-from-session-info>")
```

The response lists your case files. Use the `id` field (a UUID like `822def1b-dab2-496f-83ca-91f7bed2c1ab`), **not** the `code` (like `PR82`).

> Case files are created in the EAD portal — they cannot be created via MCP. If you have no case file, contact your EAD administrator.

## Step 2 — Generate valid UUIDs

Every resource you create requires a unique `id` you supply. The API validates strict UUID v4 format.

**The 4th group of the UUID must start with `8`, `9`, `a`, or `b`.**

Safe ways to generate valid UUIDs:

```bash
# macOS / Linux
python3 -c "import uuid; print(uuid.uuid4())"

# Node.js
node -e "const {randomUUID} = require('crypto'); console.log(randomUUID())"
```

❌ Do NOT invent UUIDs like `c3d4e5f6-a7b8-4901-cdef-...` — the `cdef` 4th group fails validation.
✅ A valid example: `4dbee9f1-2fcf-4ff9-aa50-53e72d99b617` (4th group `aa50` starts with `a`).

## Common first-time mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Using case file `code` (PR82) instead of `id` | 404 Not Found | Use `id` UUID from `case_file_list` |
| Not calling `session_login` first | 401 Unauthorized | Always authenticate before calling any other tool |
| Invalid UUID in any `id` field | Validation error | 4th group must start with `8`, `9`, `a`, or `b` |
| Calling `evidence_get` without `evidenceGroupId` | Missing required field error | `evidence_get` requires `caseFileId`, `evidenceGroupId`, AND `id` |
| Leaving an evidence group unsealed | Group stays OPEN forever, never certified | Always call `evidence_seal` after adding all evidence items |

## Quick reference

| I want to... | Tool(s) |
|---|---|
| Authenticate | `session_login` |
| List my case files | `case_file_list` (needs `userId`) |
| Get a case file's details | `case_file_get` |
| Start a signature workflow | See `/signature-lifecycle` |
| Certify evidence | See `/evidence-lifecycle` |
| Send a certified notification | See `/notification-lifecycle` |
| Create a certified dossier | See `/dossier-lifecycle` |
