# EAD Enterprise Suite MCP v2.1.1

A fix for the n8n connector. **The MCP server is unchanged from 2.1.0**: nothing to do
for a server deployment — Docker image, npx or any MCP client.

## Fixed in the n8n connector

Fields that take JSON — the filter, order and page of every list operation, signature
coordinates, the evidence IDs linked to a dossier, and the bulk add of receivers or
participants — were sent to the API as plain text when you typed the value into the
field, and the API refused it. A value written as an expression (`{{ ... }}`) was not
affected. From 2.1.1 a typed value is read as JSON, and a value that is not valid JSON
stops the node with a message that names the field instead of reaching the API.

## Upgrading the n8n connector

<!-- N8N_UPGRADE -->
### From 2.1.0

**Nothing to do.** JSON fields you type into the node — list filter, order and page,
signature coordinates, the evidence IDs of a dossier, bulk receivers or participants —
now reach the API as JSON; in 2.1.0 a typed value was refused. Values written as
expressions keep working as before.

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
