# Notification Lifecycle (EAD Enterprise Suite)

Send certified electronic notifications via EAD Enterprise Suite and retrieve the legal certificate.

## Parameters

- `subject` (required): Subject line of the notification
- `body` (required): Body text of the notification
- `recipient_email` (required): Email address of the recipient
- `use_case_id` (optional): Use case template ID for workflow configuration
- `case_file_id` (optional): UUID to associate with an existing case file

## Flow

1. **Create a notification request** — call `notification_request_create` with subject, body, and use case metadata. This is a LONG-RUNNING operation (pollable).

2. **Add recipients** — call `notification_receiver_add` with the recipient's email. Multiple recipients can be added to a single request.

3. **Monitor delivery** — use `notification_request_status` to track progress (PENDING → PROCESSING → DELIVERED).

4. **Retrieve the certificate** — once delivered, call `notification_certificate_get` to generate the legal certificate.

## Example

"Send a certified notification to contract-party@company.com about the signature request."

Tool sequence: `notification_request_create` → `notification_receiver_add` → `notification_request_status` → `notification_certificate_get`
