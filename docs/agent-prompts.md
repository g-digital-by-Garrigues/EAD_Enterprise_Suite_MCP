# Agent Prompts — EAD Enterprise Suite MCP Server

End-to-end prompt examples with their expected tool sequences. Use these as starting points or copy them directly into Claude.

For step-by-step guided workflows, use the bundled slash-commands:
- `/evidence-lifecycle` — evidence creation + seal + certificate
- `/notification-lifecycle` — certified notification from creation to delivery certificate
- `/signature-lifecycle` — digital signature request: full lifecycle (create → upload → participants → activate → certificate)

---

## Prompt 1: Seal a group of documents as certified evidence

**User goal:** Certify a set of documents and obtain a blockchain-anchored legal certificate.

**Prompt:**
```
I need to certify the following files as legal evidence in case file <caseFileId>:
- /Documents/acuerdo-nda.pdf
- /Documents/anexo-tecnico.pdf
Group them under "Documentación NDA 2026", seal the group, and give me the certificate.
```

**Expected tool sequence:**
1. `evidence_group_create` — creates group "Documentación NDA 2026"
2. `evidence_create` × 2 — uploads each PDF as an evidence item
3. `evidence_seal` (pollable) — seals the group; returns task ID → polls until `completed`
4. `evidence_get` — retrieves certificate ID from the sealed group

**Sample agent response:**
> Evidence group "Documentación NDA 2026" sealed successfully. Group ID: `eg_abc123`. Both documents were timestamped and anchored at 15:02 UTC. Certificate ID: `cert_xyz789`. Use `evidence_get` at any time to retrieve the certificate details.

---

## Prompt 2: Create and complete a qualified digital signature request

**User goal:** Send a document for multi-party qualified electronic signature and retrieve the signed certificate.

**Prompt:**
```
I need to get "contrato-distribución.pdf" signed by two people:
- Pedro Sánchez (pedro@empresa.com) — ADVANCED signature
- Lucía Martín (lucia@empresa.com) — ADVANCED signature
Create the request, upload the document, add both signers, and activate it.
Close when both have signed and give me the signature certificate.
```

**Expected tool sequence:**
1. `use_case_list` — retrieves use case templates to find the ADVANCED signature workflow
2. `signature_request_create` (pollable) — creates the request with title + close condition `ALL_REQUIRED`
3. `signature_request_add_document` — uploads the PDF (returns S3 pre-signed URL for upload)
4. `signature_participant_create` × 2 — adds Pedro and Lucía with type `ADVANCED`
5. `activate_signature_request` — activates the request; sends invitations to signers
6. `signature_request_get` — polls until status `CLOSED`
7. `signature_certificate_get` — retrieves the legal signature certificate

**Sample agent response:**
> Signature request created (ID: `sig_456`). Document uploaded. Pedro Sánchez and Lucía Martín have been invited to sign. Request activated. I'll monitor until both sign. [After completion] Both parties signed at 16:45 UTC. Certificate ID: `sigcert_789`. The qualified signature certificate confirms legally binding signatures from both parties.

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
1. `notification_request_create` (pollable) — creates the notification
2. `notification_receiver_add` × 3 — adds each recipient
3. `notification_request_send` — dispatches the notification
4. `notification_request_status` — polls until `DELIVERED`
5. `notification_certificate_get` — retrieves the legal delivery certificate

**Sample agent response:**
> Notification dispatched to 3 recipients. Status: DELIVERED (all 3 confirmed). Certificate ID: `notif_cert_321`. Delivery timestamps: a@b.com at 14:01, c@d.com at 14:02, e@f.com at 14:03 UTC. Legal certificate available via `notification_certificate_get`.

---

## Prompt 4: Upload a large document for evidence (> 10 MB)

**User goal:** Upload a large file (video, large PDF) as certified evidence using the multipart upload flow.

**Prompt:**
```
I need to certify a 45 MB video file "grabacion-reunion.mp4" as evidence.
The standard upload won't work for a file this large — use the large upload flow.
Case file: <caseFileId>, evidence group: <evidenceGroupId>.
```

**Expected tool sequence:**
1. `large_evidence_upload_initiate` (pollable) — initiates multipart upload; returns S3 pre-signed URLs per part
2. *(agent instructs user to upload parts directly to S3 URLs)*
3. `large_evidence_upload_complete` (pollable) — completes the multipart upload and registers the evidence

**Sample agent response:**
> Large file upload initiated. The video has been split into 5 parts. Pre-signed upload URLs for each part: [Part 1: https://...] [Part 2: https://...] ... Please upload each part to its URL using your HTTP client, then I'll complete the registration. [After parts uploaded] Upload complete. Evidence ID: `ev_large_001`. The 45 MB video has been registered as certified evidence.

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
2. `signature_participant_list` — lists all participants with signing status
3. `signature_document_list` — lists uploaded documents

**Sample agent response:**
> Signature request "Contrato Distribución" (ID: `sig_456`) — Status: IN_PROGRESS. Participants: Pedro Sánchez ✅ signed at 15:30 UTC; Lucía Martín ⏳ pending (invitation sent). 1 document: contrato-distribución.pdf (4 pages). Waiting on 1 of 2 signatures to close.
