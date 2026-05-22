# Notification Lifecycle (EAD Enterprise Suite)

Send certified electronic notifications and retrieve the legal certificate.

## Key concepts

- **type**: Controls recipient interaction — `NO_RESPONSE` (read-only), `ACCEPTED_OR_NOT` (accept/reject), `RECEIVED_AGREE` (acknowledge receipt).
- **OTP**: One-time password gate for opening the notification (`otpByDefault: true`).
- **WhatsApp**: Send access link via WhatsApp (`sendWaUrlByDefault: true`).
- The notification is sent to recipients only when you call `notification_request_send`. Creating the request is just a draft.

## IDs you need before starting

- `caseFileId` — from `case_file_list`

## Flow

### Step 1 — Create the notification request (draft)

```
notification_request_create(
  caseFileId: "<uuid>",
  id: "<new-uuid>",
  subject: "Notification subject (max 100 chars)",
  content: "Full body text of the notification",
  language: "es_ES",               # or "en_GB"
  type: "NO_RESPONSE",             # NO_RESPONSE | ACCEPTED_OR_NOT | RECEIVED_AGREE
  otpByDefault: false,             # optional — OTP gate for recipients
  sendWaUrlByDefault: false        # optional — send WhatsApp access link
)
```

Returns the created notification request object with `id` and `status: "DRAFT"`.

### Step 2 — Add recipients

```
notification_receiver_add(
  caseFileId: "<uuid>",
  notificationRequestId: "<notif-uuid>",
  id: "<new-uuid>",
  firstName: "Ana",
  lastName: "García",
  email: "ana@empresa.com",
  phonePrefix: "+34",             # optional — required for WhatsApp or OTP by phone
  phoneNumber: "600000000",       # optional
  otpRequired: false,             # optional — override global OTP setting per recipient
  sendWaUrl: false                # optional — override WhatsApp setting per recipient
)
```

Repeat for each recipient.

### Step 3 — Send the notification

```
notification_request_send(caseFileId, notificationRequestId)
```

This triggers delivery. The MCP task stays open (working) until the notification is delivered or fails — resolved via SSE event, no polling needed.

### Step 4 — Check status (optional)

```
notification_request_status(caseFileId, notificationRequestId)
```

Returns current status: `DRAFT` → `PROCESSING` → `DELIVERED` | `FAILED`.

### Step 5 — Retrieve the legal certificate

```
notification_certificate_get(caseFileId, notificationRequestId)
```

Only available once status is `DELIVERED`.

## Status transitions

```
DRAFT → (send) → PROCESSING → DELIVERED
                            ↘ FAILED
```

## Example

"Send a certified notification to ana@empresa.com confirming receipt of a contract."

```
1. case_file_list(userId)                          → caseFileId
2. notification_request_create(...)                → notificationRequestId
3. notification_receiver_add(..., email: "ana@empresa.com")
4. notification_request_send(caseFileId, notificationRequestId)
   ← task completes when delivered
5. notification_certificate_get(...)               → legal certificate
```
