// Custom tool: signature_request_add_document — adds optional fileUrl parameter for automatic S3 upload.
// When fileUrl is provided, the tool downloads the file and uploads it to the presigned S3 URL,
// eliminating the need for a separate PUT call.
// n8n-http: POST /case-files/{caseFileId}/signature-requests/{requestId}/documents
// Paths are relative to the emitted location: dist-repos/ead-enterprise-suite/src/tools/

import { createHash } from "node:crypto";
import { z } from "zod";
import { createClient, createConfig } from "../api/client/index.js";
import { createSignatureDocumentControllerRun } from "../api/sdk.gen.js";
import { defineTool } from "../core/index.js";

const BASE_URL = process.env.MCP_API_BASE_URL ?? "https://api-eadcustody.eadtrust.gocertius.io";

export const signature_request_add_document = defineTool({
  name: "signature_request_add_document",
  description:
    "Adds a document to a DRAFT signature request. " +
    "Requires: signature_request_create → requestId, case_file_create → caseFileId. " +
    "Provide a string `id` for the document. Compute SHA-256 hex hash of the PDF before calling. " +
    "Optional: pass `fileUrl` (a publicly accessible URL) to have the tool download and upload " +
    "the file to S3 automatically — no separate PUT needed. " +
    "If fileUrl is omitted, returns url (presigned S3 upload URL) for manual PUT. " +
    "Cannot add documents after activate_signature_request is called. " +
    "For CONFIGURABLE sequence: `groupId` must reference a Document type group " +
    "(not Signatory or DocumentSignatory) — passing a wrong group type returns 'Signature group not found'.",
  inputSchema: z.object({
    caseFileId: z.string().describe("UUID of the case file"),
    requestId: z.string().describe("UUID of the signature request (DRAFT)"),
    id: z
      .string()
      .describe(
        "UUID for the document — becomes documentId for coordinate_set and certificate_get",
      ),
    title: z.string().describe("Document title shown to signatories"),
    fileName: z.string().describe("File name including extension (e.g. contract.pdf)"),
    hash: z.string().describe("SHA-256 hex digest of the PDF content (64 hex chars)"),
    fileSize: z.number().optional().describe("File size in bytes (optional)"),
    groupId: z
      .string()
      .optional()
      .describe("For CONFIGURABLE sequence: ID of a Document type group"),
    convertToPdf: z.boolean().optional().describe("Convert non-PDF to PDF before processing"),
    fileUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "Optional public URL to download and auto-upload the PDF to S3. Eliminates the manual PUT step.",
      ),
  }),
  annotations: {
    title: "Signature Request Add Document",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  pollable: false,
  idempotencyWindowSeconds: 60,
  async execute(input, ctx) {
    const {
      caseFileId,
      requestId,
      id,
      title,
      fileName,
      hash,
      fileSize,
      groupId,
      convertToPdf,
      fileUrl,
    } = input as {
      caseFileId: string;
      requestId: string;
      id: string;
      title: string;
      fileName: string;
      hash: string;
      fileSize?: number;
      groupId?: string;
      convertToPdf?: boolean;
      fileUrl?: string;
    };

    const token = ctx.auth?.token ?? "";
    const sdkClient = createClient(
      createConfig({
        baseUrl: BASE_URL,
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    const body: Record<string, unknown> = { id, title, fileName, hash };
    if (fileSize !== undefined) body.fileSize = fileSize;
    if (groupId !== undefined) body.groupId = groupId;
    if (convertToPdf !== undefined) body.convertToPdf = convertToPdf;

    const response = await createSignatureDocumentControllerRun({
      client: sdkClient,
      path: { caseFileId, requestId } as any,
      body: body as any,
    });

    if (response.error !== undefined) {
      const msg =
        typeof response.error === "object" && response.error !== null
          ? JSON.stringify(response.error)
          : String(response.error);
      throw new Error(`signature_request_add_document error: ${msg}`);
    }

    const data = response.data as Record<string, unknown> | undefined;
    const presignedUrl = (data?.url ?? data?.uploadFileUrl) as string | undefined;

    if (fileUrl && presignedUrl) {
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(
          `signature_request_add_document: failed to download fileUrl (HTTP ${fileResponse.status})`,
        );
      }
      const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
      const hashB64 = createHash("sha256").update(fileBuffer).digest("base64");

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-amz-checksum-sha256": hashB64,
        },
        body: fileBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `signature_request_add_document: S3 upload failed (HTTP ${uploadResponse.status})`,
        );
      }

      return { documentId: id, uploaded: true };
    }

    return data ?? { url: presignedUrl };
  },
});
