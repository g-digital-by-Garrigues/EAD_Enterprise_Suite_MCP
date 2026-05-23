# Dossier Lifecycle (EAD Enterprise Suite)

Create certified dossiers from case file data using EAD Enterprise Suite templates.

## How EAD dossiers work

Dossiers are template-driven certified documents. They reference a `dossierTemplateId` that determines the structure and fields. Once created, EAD processes and certifies the dossier asynchronously.

**Status progression**: `DRAFT` → `CERTIFYING` → `CERTIFIED`

## Flow

### 1. List available templates

```
dossier_template_list()
```

Returns available templates. Note the `id` of the template you want to use.

### 2. Create the dossier

```
dossier_create(
  caseFileId: "<uuid>",
  id: "<new-uuid>",
  name: "Dossier name",
  language: "es_ES",               # or "en_GB" / "pt_PT"
  validityFrom: "2026-01-01",
  validityTo: "2027-01-01",
  dossierTemplateId: "<template-uuid>",   # from dossier_template_list
  filledFields: { "fieldName": "value" }  # template-specific fields (optional)
)
```

The dossier is created in `DRAFT` and EAD begins certification automatically.

### 3. Monitor certification

```
dossier_list(caseFileId: "<uuid>")
```

Check `status` until it reaches `CERTIFIED`. Certification typically takes a few seconds.

### 4. Retrieve the dossier

```
dossier_get(caseFileId: "<uuid>", dossierId: "<uuid>")
```

Returns the full dossier record, including the download URL for the certified PDF once status is `CERTIFIED`.

## Example

```
dossier_template_list()
  → pick template id

dossier_create
  id=<uuid>  caseFileId=<cf-id>
  name="Expediente certificado"  language=es_ES
  validityFrom=2026-01-01  validityTo=2027-01-01
  dossierTemplateId=<template-id>

dossier_list  caseFileId=<cf-id>
  → wait for status=CERTIFIED

dossier_get  caseFileId=<cf-id>  dossierId=<uuid>
  → download certified PDF
```

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Skip `dossier_template_list` | Wrong or missing `dossierTemplateId` → creation error | Always list templates first to get a valid template ID |
| `validityFrom` after `validityTo` | Validation error | Ensure `validityFrom` is before `validityTo` |
| Check status before EAD processes | Status still `DRAFT` or `CERTIFYING` | Poll `dossier_list` every few seconds until `CERTIFIED` |
