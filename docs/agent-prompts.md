# Agent Prompts — EAD Enterprise Suite MCP Server

End-to-end prompt examples with their expected tool sequences. Use these as starting points or copy them directly into Claude.

For step-by-step guided workflows, use the bundled slash-commands:
- `/evidence-lifecycle` — evidence creation + seal + certificate
- `/dossier-lifecycle` — dossier workflow from template selection
- `/notification-lifecycle` — certified notification from creation to delivery certificate
- `/signature-lifecycle` — digital signature request: full lifecycle (create → upload → participants → activate → certificate)

---

## Prompt 1: Seal a group of documents as certified evidence

**User goal:** Certify a set of documents and obtain their certificate.

**Prompt:**
```
I need to certify the following files as legal evidence in case file <caseFileId>:
- /Documents/acuerdo-nda.pdf
- /Documents/anexo-tecnico.pdf
Group them under "Documentación NDA 2026", seal the group, and give me the certificate.
```

**Expected tool sequence:**
1. `evidence_group_create` — creates the group "Documentación NDA 2026"
2. `evidence_upload` × 2 — registers each PDF as an evidence and uploads its bytes
3. `evidence_get` — until both evidences are `COMPLETED` (`dossier_group_certify` leaves out, without an error, any evidence that is not)
4. `evidence_seal` — `evidencesCount: 2`; returns immediately, then poll `evidence_group_list` until the group is `CLOSED`
5. `dossier_template_list` — an editable template: on EAD Enterprise Suite the express certificate needs a `modelId` (403 without it)
6. `dossier_group_certify` — with that `modelId`; poll `dossier_get` until `CERTIFIED`, then `dossier_document_url` for the PDF

**Sample agent response:**
> "Documentación NDA 2026" is sealed with both documents. Its certificate (dossier `<dossierId>`) is CERTIFIED; here is the download link: `<url>`.

---

## Prompt 2: Send a contract for advanced signature in one call

**User goal:** Get a PDF signed by two people with an advanced signature, and the signature certificate when both have signed.

**Prompt:**
```
Get /Users/me/contratos/contrato-distribucion.pdf signed by:
- Pedro Sánchez, pedro@empresa.com, +34 600 111 222
- Lucía Martín, lucia@empresa.com, +34 600 333 444
Advanced signature, both must sign, deadline in two weeks. Case file: <caseFileId>.
```

**Expected tool sequence:**
1. *(agent reads the PDF)* — finds the page with the signature block and where each person signs (signature guide, "Placing signatures")
2. `signature_request_full` — `signatureType: ADVANCED`, `closeCondition: ALL_REQUIRED`, the document, both signatories with their phone (the one-time code goes there) and a position each; returns the `requestId` with status `ACTIVE`
3. `signature_request_get` or `signature_signatory_progress_list` — later, until the request is `COMPLETED`
4. `signature_certificate_get` — the signature certificate of the document (available once the request is `COMPLETED`)

**Sample agent response:**
> Sent for advanced signature: request `<requestId>` is ACTIVE. Pedro and Lucía will each get a one-time code on their phone to sign page 4 of the contract. I'll check back, and once the request is completed I'll get you the certificate.

---

## Prompt 3: Send a certified notification with proof of delivery

**User goal:** Send a legally binding notification and obtain a delivery certificate.

**Prompt:**
```
Send a certified notification to three recipients — a@b.com, c@d.com, e@f.com — with the
subject "Comunicación oficial" and the body from /Documents/comunicado.txt.
I need the delivery certificate for the file.
```

**Expected tool sequence:**
1. `notification_request_create` — creates the request (stays `DRAFT`); the body goes in as HTML (`<p>…</p>`)
2. `notification_receiver_add` × 3 — adds each recipient
3. `notification_receiver_list` — checks no recipient is `INVALID` (an `INVALID` recipient blocks the send)
4. `notification_request_send` — dispatches the notification
5. `notification_request_status` — until `SENT` (later states: `PARTIALLY_READ`, `FULLY_READ`, `PARTIALLY_ANSWERED`, `FULLY_ANSWERED`)
6. `notification_certificate_get` — one per recipient (`receiverId`); `notification_certificate_document_url` gives the PDF once it is `CERTIFIED`

**Sample agent response:**
> Notification sent to a@b.com, c@d.com and e@f.com — status: SENT. I have requested a delivery certificate for each recipient; I'll send you the three PDFs once they are certified.

---

## Prompt 4: Upload a large file as evidence (over 1 GiB)

**User goal:** Certify a file too large for `evidence_upload` (over 1 GiB) with the resumable large upload.

**Prompt:**
```
I need to certify a 3 GB video, /Users/me/videos/grabacion-reunion.mp4, as evidence.
Case file: <caseFileId>, evidence group: <evidenceGroupId>.
```

**Expected tool sequence:**
1. `large_evidence_upload` — starts the upload, which keeps running inside the MCP server; returns within 50 s with `status: "in_progress"` and the `evidenceId`
2. `large_evidence_upload` again with that `evidenceId` and the same file, until `status` is `complete` (each call waits up to 50 s and reports `chunksDone`/`chunksTotal`)
3. `evidence_get` — until the platform has finished the evidence
4. `evidence_seal` — closes the group (only if no other large upload in it is still running)

**Sample agent response:**
> The upload is running: 1 of 3 chunks (1000 MB each) so far, evidence ID `<evidenceId>`. I'll keep checking. … All 3 chunks are uploaded; the platform is finishing the evidence. Once `evidence_get` shows it, I'll seal the group.

---

## Prompt 5: Review the status of an active signature request

**User goal:** Check where a signature request stands — who has signed, who hasn't.

**Prompt:**
```
Check the status of signature request <signatureRequestId>. Who has signed and who is
still pending? Are there any documents I can already see?
```

**Expected tool sequence:**
1. `signature_request_get` — retrieves request metadata and current status
2. `signature_participant_list` — lists all participants with their role (SIGNATORY / OBSERVER /
   VALIDATOR), contact details and validity
3. `signature_document_list` — lists the request's documents with their status and
   `signatoryStatusStats`
4. `signature_document_signatory_list` — per-signatory signing status for one document

**Sample agent response:**
> Signature request "Contrato Distribución" (`<requestId>`) is PARTIALLY_SIGNED: Pedro Sánchez has signed, Lucía Martín has not yet. Its document, contrato-distribucion.pdf, is PARTIALLY_SIGNED. The signed PDF can be downloaded once the whole request is COMPLETED.

---

## Prompt 6: Leave one evidence out of an express certificate

**User goal:** Certify a sealed evidence group without one of its evidences.

**Prompt:**
```
In case file <caseFileId>, the group "Contrato y anexos" is already sealed. Issue its
certificate, but leave out the file titled "borrador-v1.pdf".
```

**Expected tool sequence:**
1. `evidence_group_get` — confirms the group is `CLOSED` (the API does not require it, but sealing before certifying is advised)
2. `evidence_list` — finds the id of "borrador-v1.pdf" (evidences created through the API start with `relevant: true`) and checks every evidence is `COMPLETED`: `dossier_group_certify` leaves out any other without an error
3. `evidence_update` — `relevant: false` on that evidence; `evidence_get` confirms it (the update returns no body)
4. `dossier_template_list` — an editable template's id, passed as `modelId`: the express certificate needs one on EAD Enterprise Suite (403 without it)
5. `dossier_group_certify` — without `evidenceIds`, so it certifies only the group's relevant evidences
6. `dossier_get` — until the dossier is `CERTIFIED`; then `dossier_document_url` for the PDF

**Sample agent response:**
> "borrador-v1.pdf" is now marked as not relevant, so certificate `<dossierId>` covers the other evidences of "Contrato y anexos". It is certifying; once it is CERTIFIED I'll send you the PDF link.

---

## Prompt 7: Close a finished case file

**User goal:** Close a case file so that no new evidence is added to it by mistake.

**Prompt:**
```
The "Due Diligence XYZ" matter is finished. Close its case file.
```

**Expected tool sequence:**
1. `session_info` → `case_file_list` — finds the case file's `id` (not its `code`)
2. `case_file_update` — `status: CLOSED` (needs the editor role or higher; the personal case file cannot be updated)
3. `case_file_get` — confirms `status: CLOSED` (the update returns no body)

**Sample agent response:**
> Case file "Due Diligence XYZ" (`<caseFileId>`) is now CLOSED. New evidence groups and evidences will be refused there until it is reopened (`status: OPEN`); large evidence uploads are not checked against it.
