// STR-E14-01: Set signature box coordinates for a signatory on a document.
// Required before activate_signature_request for INTERPOSITION-type requests.
// Tip: signature_request_full_create handles the entire flow (create → upload → participant → coordinates → activate) in a single call.

import { defineTool } from "../core/index.js";
import { z } from "zod";
import { createClient, createConfig } from "../api/client/index.js";
import { updateSignatureCoordinatesControllerRun } from "../api/sdk.gen.js";
import {
  zUpdateSignatureCoordinatesControllerRunBody,
  zUpdateSignatureCoordinatesControllerRunPath,
} from "../api/zod.gen.js";

const inputSchema = z.object({
  ...zUpdateSignatureCoordinatesControllerRunPath.shape,
  ...zUpdateSignatureCoordinatesControllerRunBody.shape,
});

export const signature_coordinate_set = defineTool({
  name: "signature_coordinate_set",
  description:
    "Set the signature box position for a signatory on a specific document page. " +
    "Required before activate_signature_request for INTERPOSITION signature types. " +
    "Call once per signatory per document with page (1-based), x and y pixel coordinates. " +
    "Use signature_request_full_create to handle the entire signature workflow (upload, participants, coordinates, activation) in a single call.",
  inputSchema,
  annotations: {
    destructive: false,
    idempotent: true,
    requiresUserConfirmation: false,
  },
  pollable: false,
  idempotencyWindowSeconds: 60,
  async execute(input, ctx) {
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

    // biome-ignore lint/suspicious/noExplicitAny: generated SDK call — input shape validated above
    const inp = input as any;
    // biome-ignore lint/suspicious/noExplicitAny: generated SDK function — types validated at generation time
    const sdkFn = updateSignatureCoordinatesControllerRun as (opts: any) => Promise<any>;
    const response = await sdkFn({
      client: sdkClient,
      path: zUpdateSignatureCoordinatesControllerRunPath.parse(inp),
      body: zUpdateSignatureCoordinatesControllerRunBody.parse(inp),
    });

    if (response.error !== undefined) {
      const msg =
        typeof response.error === "object" &&
        response.error !== null &&
        "message" in response.error
          ? String(response.error.message)
          : JSON.stringify(response.error);
      throw new Error(msg);
    }
    return response.data ?? {};
  },
});
