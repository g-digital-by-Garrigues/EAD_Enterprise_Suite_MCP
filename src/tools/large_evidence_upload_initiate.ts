// Hand-written override of large_evidence_upload_initiate (Suite). REST operation:
// CreateLargeEvidenceUploadController_run, pinned in customToolEndpoints.
// Deliberately WITHOUT the machine-readable REST header in its first lines (Hugo, 2026-11-26, story 22-12
// question 2): Distribution's n8n adapter builds each n8n operation from that header and omits a tool that
// has none. In n8n nothing can upload the chunks after "initiate", so it is left out of the n8n node;
// large_evidence_upload_get, _cancel and _complete stay (they work on uploads started elsewhere).

import { z } from "zod";
import { createClient, createConfig } from "../api/client/index.js";
import { createLargeEvidenceUploadControllerRun } from "../api/sdk.gen.js";
import {
  zCreateLargeEvidenceUploadControllerRunBody,
  zCreateLargeEvidenceUploadControllerRunPath,
} from "../api/zod.gen.js";
import { defineTool } from "../core/index.js";

const inputSchema = z.object({
  ...zCreateLargeEvidenceUploadControllerRunPath.shape,
  ...zCreateLargeEvidenceUploadControllerRunBody.shape,
});

export const large_evidence_upload_initiate = defineTool({
  name: "large_evidence_upload_initiate",
  description:
    "Low-level first step of a large upload: registers a large evidence upload in an evidence group and returns NOTHING — no upload URLs, no chunk list. Fields: id (new UUID v4 for the upload), evidenceId (new UUID v4 for the evidence), totalSizeMB (the file size in MB, up to 6 decimals; refused above the deployment's maxLargeEvidenceSizeMB, 125 GB on EAD Enterprise Suite), title, fileName, capturedAt (ISO 8601). The chunks then go through pending-offset and upload-URL endpoints that are not exposed as tools, so this call alone cannot upload a file: to upload one, use large_evidence_upload, which runs the whole flow from a local path. large_evidence_upload can continue an upload registered here only if totalSizeMB was given as bytes ÷ 1,048,576 rounded up to 6 decimals (it checks the size). Check an upload with large_evidence_upload_get (evidenceId); cancel it with large_evidence_upload_cancel (id).",
  inputSchema,
  annotations: {
    title: "Large Evidence Upload Initiate",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  pollable: false,
  async execute(input, ctx) {
    const token = ctx.auth?.token ?? "";
    const sdkClient = createClient(
      createConfig({
        baseUrl: process.env.MCP_API_BASE_URL ?? "https://api-eadcustody.eadtrust.gocertius.io",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(ctx.correlationId ? { "X-Correlation-Id": ctx.correlationId } : {}),
        },
      }),
    );

    // biome-ignore lint/suspicious/noExplicitAny: generated SDK call — input shape validated above
    const inp = input as any;
    // biome-ignore lint/suspicious/noExplicitAny: generated SDK function — types validated at generation time
    const sdkFn = createLargeEvidenceUploadControllerRun as (opts: any) => Promise<any>;
    const response = await sdkFn({
      client: sdkClient,
      path: zCreateLargeEvidenceUploadControllerRunPath.parse(inp),
      body: zCreateLargeEvidenceUploadControllerRunBody.parse(inp),
    });

    if (response.error !== undefined) {
      const msg =
        typeof response.error === "object" && response.error !== null && "message" in response.error
          ? String(response.error.message)
          : JSON.stringify(response.error);
      throw new Error(msg);
    }
    return response.data;
  },
});
