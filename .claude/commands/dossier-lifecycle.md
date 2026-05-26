# Dossier Lifecycle (EAD Enterprise Suite)

Create "Certificados de evidencia" — tamper-evident PDFs that bundle one or more sealed evidence items from any case file.

## Two creation modes

| Mode | Tool | Evidences | When to use |
|---|---|---|---|
| **Express** | `dossier_group_certify` | All from ONE evidence group | Single group, one step |
| **Full** | `dossier_create` → `dossier_evidence_link` → `dossier_certify` | Any subset from any groups | Multiple groups or specific selection |

## Full flow (multi-group)

1. **List templates**
   - `dossier_template_list()` — returns available templates; note `id` and any required `schema` fields

2. **Create a DRAFT dossier**
   - `dossier_create` with a generated UUID `id`, `caseFileId`, `name`, `language`, `validityFrom`, `validityTo`, `dossierTemplateId`
   - Optional: `filledFields` for template-required fields, `password` + `confirmPassword` for password-protected certificates
   - Dossier starts in `DRAFT` status

3. **Update metadata (optional)**
   - `dossier_update` with `caseFileId`, `dossierId`, and any fields to change
   - Only allowed while the dossier is in `DRAFT`

4. **Browse linkable evidences (optional)**
   - `dossier_evidence_list_to_link` with `caseFileId` and `dossierId`
   - Returns evidences eligible for linking (only `COMPLETED` evidences from `CLOSED` groups)

5. **Link evidences**
   - `dossier_evidence_link` with `caseFileId`, `dossierId`, `caseFileToLinkId` (same as `caseFileId` when evidences are in the same case file), and `ids` (array of evidence UUIDs)
   - Can be called multiple times for different batches

6. **Preview (optional)**
   - `dossier_preview` with `caseFileId` and `dossierId`
   - Returns an HTML preview of the Certificado de evidencia before certifying

7. **Certify**
   - `dossier_certify` with `caseFileId` and `dossierId`
   - Status: `DRAFT` → `CERTIFYING` → `CERTIFIED`
   - Certification is asynchronous; poll `dossier_list` until status is `CERTIFIED`
   - Note: `dossier_certify` has no SSE bridge — always poll regardless of runtime

## Express flow (single group)

```
dossier_group_certify
  id=<uuid>  caseFileId=<cf-id>  evidenceGroupId=<group-id>
  name="..."  language=es_ES  dossierTemplateId=<template-id>
  [evidenceIds=["uuid1","uuid2"]]   ← optional: filter specific evidences within the group
```

Creates and certifies in one call. Do NOT call with the same `id` twice — first call creates and certifies immediately, subsequent calls fail.

## After certification

Once status is `CERTIFIED`, these operations are available:

| Action | Tool | Notes |
|---|---|---|
| Download PDF | `dossier_document_url` | Returns a presigned URL for the certified PDF |
| Download ZIP | `dossier_package_url` | Returns a presigned URL for ZIP (PDF + evidence files) |
| Manage visibility | `dossier_visibility` | Toggle public access to the certificate |
| Delete certificate | `dossier_delete` | Permanent — cannot be undone |

## Linked evidence management

After linking, inspect or remove linked evidences:

- `dossier_evidence_list` — list all evidences linked to the dossier
- `dossier_evidence_get` — get details of a specific linked evidence
- `dossier_evidence_delete` — unlink a specific evidence (only in `DRAFT`)

## Example — full flow

```
dossier_template_list()
  → pick template id

dossier_create
  id=<uuid>  caseFileId=<cf-id>
  name="Certificado contrato 2026"  language=es_ES
  validityFrom=2026-01-01  validityTo=2027-01-01
  dossierTemplateId=<template-id>

dossier_evidence_link
  caseFileId=<cf-id>  dossierId=<uuid>  caseFileToLinkId=<cf-id>
  ids=["ev-1","ev-2","ev-3"]

dossier_certify
  caseFileId=<cf-id>  dossierId=<uuid>

dossier_list  caseFileId=<cf-id>
  → wait for status=CERTIFIED

dossier_document_url  caseFileId=<cf-id>  dossierId=<uuid>
  → presigned PDF download URL
```

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Call `dossier_certify` without linking evidences | `Unknow` error | Always call `dossier_evidence_link` before `dossier_certify` |
| Link evidences from unsealed groups | API error | Only `COMPLETED` evidences from `CLOSED` groups can be linked |
| Update dossier after certifying | Error | `dossier_update` only works in `DRAFT` |
| Call `dossier_group_certify` twice with same `id` | First certifies, second fails | Use each `id` only once |
| Missing `caseFileId` in link or certify | Empty network error | Both require `caseFileId` — always pass it explicitly |
| `validityFrom` after `validityTo` | Validation error | Ensure `validityFrom` is before `validityTo` |
