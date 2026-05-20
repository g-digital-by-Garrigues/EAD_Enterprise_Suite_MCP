# Evidence Lifecycle (EAD Enterprise Suite)

Create and manage certified evidence chains in EAD Enterprise Suite, including large file uploads.

## Parameters

- `case_file_id` (required): UUID of the case file
- `evidence_group_name` (optional): Name for the evidence group
- `title` (required): Title of the evidence item
- `file_size` (optional): File size in bytes (required for large file uploads > 10 MB)

## Flow

### Standard evidence (< 10 MB)

1. **Create evidence group** — call `evidence_group_create` with the case file ID.
2. **Create evidence** — call `evidence_create` with file metadata. Upload via the returned `uploadFileUrl`.
3. **Seal the group** — call `evidence_seal` (long-running) to certify.

### Large evidence (≥ 10 MB)

1. **Create evidence group** — call `evidence_group_create`.
2. **Initiate large upload** — call `large_evidence_upload_initiate` to get a multi-part upload URL.
3. **Upload in parts** — upload the file in chunks to the provided presigned URLs.
4. **Complete upload** — call `large_evidence_upload_complete` to finalize the upload and register the evidence.
5. **Seal the group** — call `evidence_seal`.

## Example

"Upload a 50 MB contract archive as certified evidence for case file abc-123."

Tool sequence: `evidence_group_create` → `large_evidence_upload_initiate` → [upload] → `large_evidence_upload_complete` → `evidence_seal`
