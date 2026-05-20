# Signature Lifecycle (EAD Enterprise Suite)

Manage the full digital signature workflow: create a signature request, add documents and participants, activate, and obtain the legal certificate.

## Parameters

- `title` (required): Title of the signature request
- `document_path` (required): Path to the PDF document to be signed
- `signers` (required): List of signer email addresses
- `case_file_id` (optional): UUID of the associated case file
- `use_case_id` (optional): Use case template UUID for workflow configuration

## Flow

1. **Create signature request** — call `signature_request_create` with title and metadata. This is a LONG-RUNNING operation — returns a task ID. The request starts in DRAFT status.

2. **Add document** — call `signature_request_add_document` with the request ID to upload the PDF to be signed. The document is uploaded via a signed URL.

3. **Add participants** — the signers are typically configured in the request. Use `signature_participant_list` to verify participant setup.

4. **Activate** — when all documents and participants are configured, the request transitions to ACTIVE status and notifications are sent to signers.

5. **Monitor progress** — use `signature_request_get` to track signing status (DRAFT → ACTIVE → PARTIALLY_SIGNED → SIGNED → CLOSED).

6. **Cancel if needed** — use `signature_request_cancel` to cancel an active request before completion.

7. **Get certificate** — when all parties have signed, call `signature_certificate_get` to retrieve the certified signature package (PDF + metadata + signatures).

## Example

"Have alice@company.com and bob@company.com sign the employment_contract.pdf."

Tool sequence: `signature_request_create` → `signature_request_add_document` → `signature_request_get` → `signature_certificate_get`
