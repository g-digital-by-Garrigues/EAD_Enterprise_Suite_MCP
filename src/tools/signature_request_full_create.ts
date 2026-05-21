// STR-E14-02: Composite signature request tool.
// Handles the full signature workflow in a single call:
// create request → download document → compute SHA256 → add document → upload to S3
// → add participants → set coordinates (INTERPOSITION) → activate.
// Task completes via SSE when all signatories have signed (same bridge as signature_request_create).

import { createHash, randomUUID } from "node:crypto";
import { defineTool } from "../core/index.js";
import { z } from "zod";
import { createClient, createConfig } from "../api/client/index.js";
import {
  createSignatureRequestControllerRun,
  createSignatureDocumentControllerRun,
  createSignatureParticipantControllerRun,
  updateSignatureCoordinatesControllerRun,
  activateSignatureRequestControllerRun,
} from "../api/sdk.gen.js";

const zSignatory = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phonePrefix: z.string().optional().describe("Must include '+' (e.g. '+34')"),
  phoneNumber: z.string().optional(),
  signaturePage: z.number().int().min(1).optional().default(1),
  signatureX: z.number().optional().default(30),
  signatureY: z.number().optional().default(230),
});

const inputSchema = z.object({
  caseFileId: z.string().uuid(),
  id: z.string().uuid().optional().describe("Signature request ID. Generated automatically if omitted."),
  name: z.string().describe("Display name for the signature request."),
  language: z
    .enum(["es_ES", "ca_ES", "eu_ES", "gl_ES", "va_ES", "en_GB"])
    .describe("Language for the signatory UI and notifications."),
  signatureType: z
    .enum(["INTERPOSITION", "BIOMETRIC"])
    .describe(
      "INTERPOSITION: electronic signature with placement box (coordinates required). " +
        "BIOMETRIC: handwritten biometric signature (no coordinates needed).",
    ),
  deadline: z.string().describe("ISO 8601 datetime by which all signatories must sign."),
  documentUrl: z
    .string()
    .url()
    .describe("Publicly accessible URL to download the document (PDF recommended)."),
  documentTitle: z.string().describe("Display title for the document in the signature portal."),
  documentFileName: z
    .string()
    .optional()
    .describe("File name to use (e.g. 'contract.pdf'). Inferred from URL if omitted."),
  signatories: z
    .array(zSignatory)
    .min(1)
    .describe(
      "List of signatories. For INTERPOSITION type, signaturePage/signatureX/signatureY define " +
        "the signature box position on the document (defaults: page 1, x 30, y 230).",
    ),
});

export const signature_request_full_create = defineTool({
  name: "signature_request_full_create",
  description:
    "Create and activate a signature request end-to-end in a single call. " +
    "Downloads the document from documentUrl, computes the SHA-256 hash, uploads to EAD storage, " +
    "adds all signatories, sets signature box coordinates (for INTERPOSITION type), and activates. " +
    "The MCP task stays open (working) until all participants have signed or rejected — " +
    "resolved via SSE event, no polling needed. " +
    "Individual tools (signature_request_create, signature_request_add_document, " +
    "signature_participant_create, signature_coordinate_set, activate_signature_request) " +
    "are available for advanced scenarios requiring fine-grained control.",
  inputSchema,
  annotations: {
    destructive: false,
    idempotent: false,
    requiresUserConfirmation: false,
  },
  pollable: true,
  sseOnly: true,
  idempotencyWindowSeconds: 86400,

  async execute(rawInput, ctx) {
    // biome-ignore lint/suspicious/noExplicitAny: input is validated by inputSchema above
    const input = rawInput as z.infer<typeof inputSchema>;
    const token = ctx.auth?.token ?? "";
    const sdkClient = createClient(
      createConfig({
        baseUrl: process.env.MCP_API_BASE_URL ?? "",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(ctx.correlationId ? { "X-Correlation-Id": ctx.correlationId } : {}),
        },
      }),
    );

    const requestId = input.id ?? randomUUID();
    const documentId = randomUUID();

    // ── 1. Download document ────────────────────────────────────────────────
    const docResponse = await fetch(input.documentUrl);
    if (!docResponse.ok) {
      throw new Error(`Failed to download document: HTTP ${docResponse.status} from ${input.documentUrl}`);
    }
    const docBuffer = Buffer.from(await docResponse.arrayBuffer());
    const hashHex = createHash("sha256").update(docBuffer).digest("hex");
    const hashBase64 = createHash("sha256").update(docBuffer).digest("base64");

    const fileName =
      input.documentFileName ??
      (input.documentUrl.split("/").pop()?.split("?")[0] || "document.pdf");

    // ── 2. Create signature request ─────────────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: SDK call
    const createFn = createSignatureRequestControllerRun as (opts: any) => Promise<any>;
    const createResp = await createFn({
      client: sdkClient,
      path: { caseFileId: input.caseFileId },
      body: {
        id: requestId,
        name: input.name,
        language: input.language,
        signatureType: input.signatureType,
        deadline: input.deadline,
      },
    });
    if (createResp.error !== undefined) {
      throw new Error(errorMsg(createResp.error));
    }

    // ── 3. Add document (get S3 upload URL) ────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: SDK call
    const addDocFn = createSignatureDocumentControllerRun as (opts: any) => Promise<any>;
    const addDocResp = await addDocFn({
      client: sdkClient,
      path: { caseFileId: input.caseFileId, requestId },
      body: {
        id: documentId,
        hash: hashHex,
        title: input.documentTitle,
        fileName,
        fileSize: docBuffer.length,
      },
    });
    if (addDocResp.error !== undefined) {
      throw new Error(errorMsg(addDocResp.error));
    }
    const uploadUrl: string = (addDocResp.data as { url: string }).url;

    // ── 4. Upload document to S3 ───────────────────────────────────────────
    const uploadResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-amz-checksum-sha256": hashBase64,
      },
      body: docBuffer,
    });
    if (!uploadResp.ok) {
      throw new Error(`S3 upload failed: HTTP ${uploadResp.status}`);
    }

    // ── 5. Add signatories ─────────────────────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: SDK call
    const addParticipantFn = createSignatureParticipantControllerRun as (opts: any) => Promise<any>;
    const signatoryIds: string[] = [];

    for (const signatory of input.signatories) {
      const signatoryId = signatory.id ?? randomUUID();
      signatoryIds.push(signatoryId);

      const participantBody: Record<string, unknown> = {
        id: signatoryId,
        role: "SIGNATORY",
        firstName: signatory.firstName,
        lastName: signatory.lastName,
        email: signatory.email,
        linkToAllDocuments: true,
      };
      if (signatory.phonePrefix && signatory.phoneNumber) {
        participantBody.phonePrefix = signatory.phonePrefix;
        participantBody.phoneNumber = signatory.phoneNumber;
      }

      const partResp = await addParticipantFn({
        client: sdkClient,
        path: { caseFileId: input.caseFileId, requestId },
        body: participantBody,
      });
      if (partResp.error !== undefined) {
        throw new Error(errorMsg(partResp.error));
      }
    }

    // ── 6. Set signature coordinates (INTERPOSITION only) ─────────────────
    if (input.signatureType === "INTERPOSITION") {
      // biome-ignore lint/suspicious/noExplicitAny: SDK call
      const coordFn = updateSignatureCoordinatesControllerRun as (opts: any) => Promise<any>;

      for (let i = 0; i < signatoryIds.length; i++) {
        const signatory = input.signatories[i]!;
        const signatoryId = signatoryIds[i]!;

        const coordResp = await coordFn({
          client: sdkClient,
          path: { caseFileId: input.caseFileId, requestId, documentId, signatoryId },
          body: {
            coordinates: [
              {
                page: signatory.signaturePage,
                x: signatory.signatureX,
                y: signatory.signatureY,
              },
            ],
          },
        });
        if (coordResp.error !== undefined) {
          throw new Error(errorMsg(coordResp.error));
        }
      }
    }

    // ── 7. Activate ────────────────────────────────────────────────────────
    // biome-ignore lint/suspicious/noExplicitAny: SDK call
    const activateFn = activateSignatureRequestControllerRun as (opts: any) => Promise<any>;
    const activateResp = await activateFn({
      client: sdkClient,
      path: { caseFileId: input.caseFileId, requestId },
    });
    if (activateResp.error !== undefined) {
      throw new Error(errorMsg(activateResp.error));
    }

    return {
      requestId,
      documentId,
      status: "ACTIVE",
      signatoryCount: input.signatories.length,
      message:
        "Signature request created and activated. Waiting for signatories to sign. " +
        "The task will complete automatically when all participants have responded.",
    };
  },
});

function errorMsg(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as Record<string, unknown>).message);
  }
  return JSON.stringify(error);
}
