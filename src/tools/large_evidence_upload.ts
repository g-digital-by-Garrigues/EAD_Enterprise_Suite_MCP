// Custom tool: large_evidence_upload — Story 22-10 (E22). EAD Enterprise Suite only (the
// largeEvidenceUploads feature flag is off in GoCertius). Custom-only tool (customOnlyTools).
//
// Runs the whole large-upload flow the backend expects, which the agent cannot do itself (it cannot
// PUT binary chunks):
//   GET /settings → GET /profile + GET …/evidence-groups/{id} (creator + OPEN check) →
//   POST …/large-evidence-uploads → loop { GET …/pending-offsets?count=1 →
//   GET …/pending-offsets/{id}/upload-url → PUT <presigned S3 URL> (one chunk, streamed from disk) →
//   PUT …/pending-offsets/{id}/uploaded } → GET …/evidences/{evidenceId}/large-upload (progress).
// The backend completes the multipart upload itself when the last chunk is marked uploaded, and its
// Digital Trust callback then DELETES the upload record (later reads answer 404).
//
// LOCAL PATH ONLY (Hugo's decision D4): a file of up to 125 GB cannot travel inside a tool call, so the
// server streams it from its own disk. The path checks mirror mcp-core's FileResolver (HTTP mode refused,
// absolute, no "..", no symlink, MCP_FILE_ALLOWED_ROOTS, regular file) plus a read-permission check —
// mirrored rather than imported because the resolver buffers the whole file (1 GiB cap) and mcp-core must
// stay untouched (21-08).
//
// A BACKGROUND WORKER PER UPLOAD (code review of PR 3): one 1000 MB chunk can take longer than an MCP
// client's request timeout (60 s in the TypeScript SDK), so the upload cannot be bound to one call. Each
// upload runs in a worker inside this server process until it finishes, fails or is cancelled; a call
// starts or joins that worker, waits at most `timeBudgetSeconds`, and returns its progress. A new upload's
// first call returns within NEW_UPLOAD_MAX_WAIT_MS, so its ids always reach the agent. A second call for the
// same upload joins the running worker instead of racing it. If the server restarts, the next call resumes
// from the platform's pending offsets (FR11, NFR11 — no MCP Tasks).
//
// INTEGRITY: one file descriptor per worker (the path is not reopened per chunk), and the file's size and
// mtime are re-checked before each chunk is marked uploaded: a file that changes mid-upload stops it, so
// the platform never certifies a splice of two contents.
//
// Units: the contract says "MB"; this tool uses MiB (1,048,576 bytes) for both totalSizeMB (rounded up
// to the 6 decimals the backend accepts) and the chunk byte length, so its slicing is self-consistent.
// The platform's own convention is checked in the production live run (story 22-18).

import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, type FileHandle, lstat, open, realpath, stat } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { basename, isAbsolute, resolve as pathResolve, sep } from "node:path";
import { Readable } from "node:stream";
import { z } from "zod";
import { createClient, createConfig } from "../api/client/index.js";
import {
  createLargeEvidenceUploadControllerRun,
  listAndCreateEvidencePendingOffsetsControllerRun,
  notifyEvidenceUploadedOffsetControllerRun,
  showEvidenceGroupControllerRun,
  showEvidencePendingOffsetUploadUrlControllerRun,
  showLargeEvidenceUploadControllerRun,
  showProfileControllerRun,
  showSettingsControllerRun,
} from "../api/sdk.gen.js";
import {
  defineTool,
  FileInput,
  httpRequestContext,
  type ToolContext,
  toolError,
  UpstreamHttpError,
} from "../core/index.js";

// biome-ignore lint/suspicious/noExplicitAny: generated SDK functions — types validated at generation time
type SdkFn = (opts: any) => Promise<any>;
// biome-ignore lint/suspicious/noExplicitAny: generated SDK client
type SdkClient = any;

const OPERATION = "large_evidence_upload";
const BASE_URL = process.env.MCP_API_BASE_URL ?? "https://api-eadcustody.eadtrust.gocertius.io";
const MIB = 1024 * 1024;
/** Default wait per call: under the 60 s request timeout most MCP clients use. */
const DEFAULT_BUDGET_SECONDS = 50;
/** A new upload's first call returns within this, whatever its budget, so its ids reach the agent. */
const NEW_UPLOAD_MAX_WAIT_MS = 50_000;
/** When every chunk is in but the worker has not seen the empty pending list yet, wait this long. */
const FINISH_GRACE_MS = 5_000;
/** Inactivity timeout of one chunk PUT: a stalled socket must not hold the worker forever. */
const CHUNK_IDLE_TIMEOUT_MS = 5 * 60_000;
/** Read buffer for streaming a chunk from disk (memory stays far below one chunk). */
const READ_BUFFER_BYTES = 256 * 1024;
/** Attempts per step for temporary failures (network, 5xx, 408, 429, expired presigned URL). */
const ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 4_000];

/** totalSizeMB for `bytes`, in MiB, rounded UP to 6 decimals — exact, no float overflow at 125 GB. */
function toMiB6(bytes: number): number {
  const scaled = BigInt(bytes) * 1_000_000n;
  const mib = BigInt(MIB);
  const ceil = (scaled + mib - 1n) / mib;
  return Number(ceil) / 1_000_000;
}

/**
 * A PERMANENT input problem, as a structured tool error (the shape ctx.toolError throws). Never a bare
 * Error: mcp-core frames an unclassified Error as "Network error … transient — retry", which would send
 * the agent into a retry loop on a wrong path or an oversized file (seen in this tool's smoke test).
 */
function inputError(problem: string, remediation: string, suggestedTool?: string): never {
  throw toolError({
    operation: OPERATION,
    upstream: new Error(problem),
    remediation,
    ...(suggestedTool ? { suggestedTool } : {}),
  });
}

/** A failure retrying cannot fix (4xx other than 401/408/429, a changed file, a size mismatch…). */
class PermanentError extends Error {}

/** The presigned PUT answered with a non-2xx status. */
class ChunkPutError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`chunk upload refused by storage: HTTP ${status} ${body}`.trim());
  }
}

function isTemporary(err: unknown): boolean {
  if (err instanceof PermanentError) return false;
  const status =
    err instanceof UpstreamHttpError ? err.status : err instanceof ChunkPutError ? err.status : 0;
  if (status === 0) return true; // network error, timeout, aborted connection
  // A presigned URL that expired answers 403; a fresh URL is fetched on the next attempt.
  if (err instanceof ChunkPutError && status === 403) return true;
  return status === 408 || status === 429 || status >= 500;
}

function statusOf(response: { error?: unknown; response?: Response }): number {
  return response.response?.status ?? 0;
}

function upstreamError(response: { error?: unknown; response?: Response }, step: string): Error {
  return UpstreamHttpError.fromParsedError(
    statusOf(response),
    response.error,
    `${OPERATION} (${step})`,
  );
}

interface Fingerprint {
  dev: number;
  ino: number;
  size: number;
  mtimeMs: number;
}

const sameFile = (a: Fingerprint, b: Fingerprint) =>
  a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs;

/** The same path policy as mcp-core's FileResolver, without reading the file into memory. */
async function checkLocalPath(rawPath: string): Promise<{ real: string; fp: Fingerprint }> {
  if (httpRequestContext.getStore() || process.env.MCP_TRANSPORT === "http") {
    inputError(
      "large_evidence_upload reads a local file, which is not possible in HTTP (multi-user) mode: the server cannot see your files.",
      "Run this MCP server locally (stdio) on the machine that holds the file.",
    );
  }
  if (!isAbsolute(rawPath)) {
    inputError("file.path is not an absolute path.", "Pass the file's absolute path.");
  }
  if (rawPath.split(/[/\\]/).includes("..")) {
    inputError("file.path contains '..' segments.", "Pass the file's absolute path without '..'.");
  }
  const resolved = pathResolve(rawPath);
  let link: Awaited<ReturnType<typeof lstat>>;
  try {
    link = await lstat(resolved);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      inputError(
        `file.path does not exist: ${rawPath}`,
        "Check the path; the file must be on the machine running this MCP server.",
      );
    }
    inputError(
      `file.path cannot be inspected (${code ?? "unknown error"}): ${rawPath}`,
      "Check the path and that the user running this MCP server can access it.",
    );
  }
  if (link.isSymbolicLink()) {
    inputError("file.path is a symlink.", "Give the direct path to the file, not a link to it.");
  }
  const real = await realpath(resolved);
  const roots = (process.env.MCP_FILE_ALLOWED_ROOTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => pathResolve(p));
  if (roots.length > 0) {
    const realRoots = await Promise.all(roots.map((r) => realpath(r).catch(() => r)));
    const inside = realRoots.some(
      (root) => real === root || real.startsWith(root.endsWith(sep) ? root : root + sep),
    );
    if (!inside) {
      inputError(
        "file.path is outside MCP_FILE_ALLOWED_ROOTS.",
        "Place the file under one of the allowed directories, or ask whoever runs this server to allow its folder.",
      );
    }
  }
  const info = await stat(real);
  if (!info.isFile()) inputError("file.path is not a regular file.", "Pass the path of a file.");
  if (info.size === 0) {
    inputError("file.path is an empty file.", "Nothing to upload; check the file.");
  }
  try {
    await access(real, fsConstants.R_OK);
  } catch {
    inputError(
      "file.path cannot be read by the user running this MCP server (permission denied).",
      "Fix the file's permissions (or the host's privacy settings for that folder) and call again; nothing was created.",
    );
  }
  return {
    real,
    fp: { dev: info.dev, ino: info.ino, size: info.size, mtimeMs: info.mtimeMs },
  };
}

const LOOPBACK = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

/**
 * Bytes [start, end] of the open file as a stream, read at explicit positions. Not fs.ReadStream: its
 * destroy() closes the descriptor even with autoClose:false (Node 26), and the worker reuses one
 * descriptor for every chunk and every retry.
 */
function rangeStream(file: FileHandle, start: number, end: number): Readable {
  let pos = start;
  return new Readable({
    highWaterMark: READ_BUFFER_BYTES,
    read() {
      if (pos > end) {
        this.push(null);
        return;
      }
      const len = Math.min(READ_BUFFER_BYTES, end - pos + 1);
      const chunk = Buffer.allocUnsafe(len);
      file.read(chunk, 0, len, pos).then(
        ({ bytesRead }) => {
          if (bytesRead === 0) {
            this.destroy(new PermanentError("the file is shorter than when the upload started"));
            return;
          }
          pos += bytesRead;
          this.push(bytesRead === len ? chunk : chunk.subarray(0, bytesRead));
        },
        (err) => this.destroy(err),
      );
    },
  });
}

/** PUT bytes [start, end] (inclusive) of the open file to a presigned URL, streamed, with Content-Length. */
function putRange(url: string, file: FileHandle, start: number, end: number): Promise<void> {
  const target = new URL(url);
  // Evidence bytes never travel unencrypted; plain http is accepted only on loopback (local test doubles).
  if (
    target.protocol !== "https:" &&
    !(target.protocol === "http:" && LOOPBACK.has(target.hostname))
  ) {
    return Promise.reject(
      new PermanentError(`the platform returned a non-HTTPS upload URL (${target.protocol}//)`),
    );
  }
  const client = target.protocol === "http:" ? http : https;
  const length = end - start + 1;
  return new Promise((resolve, reject) => {
    let settled = false;
    let gotResponse = false;
    const stream = rangeStream(file, start, end);
    const req = client.request(
      target,
      { method: "PUT", headers: { "Content-Length": String(length) } },
      (res) => {
        gotResponse = true;
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c: string) => {
          if (body.length < 2000) body += c;
        });
        res.on("error", (err) => settle(err));
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) settle();
          else settle(new ChunkPutError(status, body.slice(0, 300)));
        });
        res.on("close", () =>
          settle(new Error("chunk upload: connection closed before the reply ended")),
        );
      },
    );
    function settle(err?: Error) {
      if (settled) return;
      settled = true;
      stream.unpipe(req);
      stream.destroy();
      if (err) {
        req.destroy();
        reject(err);
      } else {
        resolve();
      }
    }
    req.setTimeout(CHUNK_IDLE_TIMEOUT_MS, () => req.destroy(new Error("chunk upload stalled")));
    req.on("error", (err) => settle(err));
    req.on("close", () => {
      if (!gotResponse) settle(new Error("chunk upload: connection closed before any reply"));
    });
    stream.on("error", (err) => settle(err));
    stream.pipe(req);
  });
}

type Upload = {
  id: string;
  evidenceId: string;
  fileName: string;
  chunkSizeMB: number;
  totalSizeMB: number;
  biggestUploadedOffset: number;
};

/** The platform's numbers must make sense before anything is created or sliced. */
function checkChunkSize(chunkSizeMB: unknown, where: string): number {
  const n = Number(chunkSizeMB);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n * MIB)) {
    throw new PermanentError(
      `${where} gives a chunk size of ${String(chunkSizeMB)} MB, which this tool cannot slice into whole bytes`,
    );
  }
  return n * MIB;
}

/** Per-upload state, kept for the life of this server process. */
interface Worker {
  uploadId: string;
  evidenceId: string;
  fileName: string;
  totalSizeMB: number;
  chunkSizeMB: number;
  chunksTotal: number;
  chunksDone: number;
  fp: Fingerprint;
  status: "running" | "complete" | "failed";
  error?: unknown;
  /** True when the platform had already removed the record (evidence finished) when the worker ended. */
  finishedByPlatform: boolean;
  done: Promise<void>;
}

const workers = new Map<string, Worker>(); // by evidenceId

/** API calls for one upload, with one re-authentication on 401 and retries on temporary failures. */
class Api {
  private client: SdkClient;
  constructor(
    private readonly ctx: ToolContext,
    readonly caseFileId: string,
    readonly evidenceGroupId: string,
  ) {
    this.client = Api.makeClient(ctx.auth?.token ?? "", ctx.correlationId);
  }
  private static makeClient(token: string, correlationId?: string): SdkClient {
    return createClient(
      createConfig({
        baseUrl: BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(correlationId ? { "X-Correlation-Id": correlationId } : {}),
        },
      }),
    );
  }
  /**
   * One SDK call. Returns the raw response when its status is in `pass` (e.g. 404 handled by the caller);
   * throws UpstreamHttpError otherwise. A 401 re-authenticates once (long uploads outlive a session).
   */
  async call<T>(
    step: string,
    fn: SdkFn,
    opts: Record<string, unknown>,
    pass: number[] = [],
  ): Promise<{ data?: T; status: number }> {
    let reauthed = false;
    for (;;) {
      const response = await fn({ client: this.client, ...opts });
      if (response.error === undefined)
        return { data: response.data as T, status: statusOf(response) };
      const status = statusOf(response);
      if (pass.includes(status)) return { status };
      if (status === 401 && !reauthed && this.ctx.reauthenticate) {
        reauthed = true;
        const fresh = await this.ctx.reauthenticate();
        this.client = Api.makeClient(fresh.token, this.ctx.correlationId);
        continue;
      }
      throw upstreamError(response, step);
    }
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= ATTEMPTS || !isTemporary(err)) throw err;
      await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt - 1] ?? 4_000));
    }
  }
}

/** The worker: uploads every pending chunk of one upload, then records how it ended. */
function startWorker(api: Api, upload: Upload, file: FileHandle, fp: Fingerprint): Worker {
  const chunkBytes = checkChunkSize(upload.chunkSizeMB, "The upload");
  const w: Worker = {
    uploadId: upload.id,
    evidenceId: upload.evidenceId,
    fileName: upload.fileName,
    totalSizeMB: upload.totalSizeMB,
    chunkSizeMB: upload.chunkSizeMB,
    chunksTotal: Math.ceil(fp.size / chunkBytes),
    chunksDone: Math.max(0, upload.biggestUploadedOffset + 1),
    fp,
    status: "running",
    finishedByPlatform: false,
    done: Promise.resolve(),
  };
  const path = { caseFileId: api.caseFileId, evidenceGroupId: api.evidenceGroupId };
  const listFn = listAndCreateEvidencePendingOffsetsControllerRun as SdkFn;
  const urlFn = showEvidencePendingOffsetUploadUrlControllerRun as SdkFn;
  const doneFn = notifyEvidenceUploadedOffsetControllerRun as SdkFn;
  let lastMarked = upload.biggestUploadedOffset;

  w.done = (async () => {
    try {
      for (;;) {
        const page = await withRetry(() =>
          api.call<{ data: { id: string; offset: number }[] }>(
            "pending offsets",
            listFn,
            { path: { ...path, id: upload.id }, query: { count: 1 } },
            [404],
          ),
        );
        if (page.status === 404) {
          // The record is gone: the platform finished the evidence (its callback removes the record),
          // or someone cancelled the upload. Only the first is success, and only if the last chunk is in.
          if (lastMarked + 1 >= w.chunksTotal) {
            w.finishedByPlatform = true;
            break;
          }
          throw new PermanentError(
            "the upload no longer exists on the platform before its last chunk (cancelled, or removed elsewhere)",
          );
        }
        const next = page.data?.data[0];
        if (!next) break; // nothing pending and nothing left to create: every chunk is uploaded
        const start = next.offset * chunkBytes;
        if (start >= fp.size) {
          throw new PermanentError(
            `the platform asked for chunk ${next.offset}, which starts past the end of the file (${fp.size} bytes, ${chunkBytes}-byte chunks): the upload's size and this file disagree`,
          );
        }
        const end = Math.min(fp.size, start + chunkBytes) - 1;
        const offsetPath = { ...path, largeEvidenceUploadId: upload.id, id: next.id };
        const uploaded = await withRetry(async () => {
          const u = await api.call<{ url: string }>(
            `upload URL for chunk ${next.offset}`,
            urlFn,
            { path: offsetPath },
            [404],
          );
          if (u.status === 404) return false; // another worker (another process) took this offset
          await putRange(u.data?.url ?? "", file, start, end);
          return true;
        });
        if (!uploaded) continue;
        // The bytes just sent must be the bytes of the file this upload was started with.
        const now = await file.stat();
        if (now.size !== fp.size || now.mtimeMs !== fp.mtimeMs) {
          throw new PermanentError(
            "the file changed while it was being uploaded (size or modification time differs); chunk not marked uploaded",
          );
        }
        // 404 = the offset was already marked by another worker: same outcome, carry on.
        await withRetry(() =>
          api.call(`mark chunk ${next.offset} uploaded`, doneFn, { path: offsetPath }, [404]),
        );
        lastMarked = Math.max(lastMarked, next.offset);
        w.chunksDone = Math.min(w.chunksTotal, Math.max(w.chunksDone, next.offset + 1));
      }
      w.chunksDone = w.chunksTotal;
      w.status = "complete";
    } catch (err) {
      w.status = "failed";
      w.error = err;
    } finally {
      await file.close().catch(() => undefined);
    }
  })();
  workers.set(upload.evidenceId, w);
  return w;
}

/** Open the checked file and make sure the descriptor is that file (it may have been swapped since). */
async function openSame(real: string, fp: Fingerprint): Promise<FileHandle> {
  const file = await open(real, "r");
  const st = await file.stat();
  if (!sameFile(fp, { dev: st.dev, ino: st.ino, size: st.size, mtimeMs: st.mtimeMs })) {
    await file.close().catch(() => undefined);
    inputError(
      "file.path changed between the checks and the opening of the file.",
      "Make sure nothing is writing to or replacing the file, then call again.",
    );
  }
  return file;
}

/**
 * Start a worker unless a concurrent call already did while this one was awaiting: the registry is
 * re-read AFTER the last await, and startWorker registers synchronously, so one upload never gets two.
 */
async function startOrJoin(
  api: Api,
  upload: Upload,
  real: string,
  fp: Fingerprint,
): Promise<Worker> {
  const file = await openSame(real, fp);
  const raced = workers.get(upload.evidenceId);
  if (raced && raced.status !== "failed") {
    await file.close().catch(() => undefined);
    return raced;
  }
  return startWorker(api, upload, file, fp);
}

/** Wait for the worker at most `ms`; if every chunk is in, give it a short grace to see the end. */
async function waitFor(w: Worker, ms: number): Promise<void> {
  const sleep = (t: number) => new Promise<void>((r) => setTimeout(r, t).unref?.());
  await Promise.race([w.done, sleep(ms)]);
  if (w.status === "running" && w.chunksDone >= w.chunksTotal) {
    await Promise.race([w.done, sleep(FINISH_GRACE_MS)]);
  }
}

/** A worker that failed, as the structured error the agent gets — always with the ids. */
function workerFailure(w: Worker): never {
  const err = w.error;
  const ids = `Upload ${w.uploadId} (evidenceId "${w.evidenceId}")`;
  if (err !== null && typeof err === "object" && (err as { isError?: unknown }).isError === true) {
    throw err;
  }
  if (isTemporary(err)) {
    throw toolError({
      operation: OPERATION,
      upstream: err,
      remediation: `${ids} stopped on a temporary error after ${ATTEMPTS} attempts. Call large_evidence_upload again with that evidenceId and the same file to resume; chunks already uploaded are kept.`,
      suggestedTool: "large_evidence_upload_get",
    });
  }
  throw toolError({
    operation: OPERATION,
    upstream: err,
    remediation: `${ids} cannot continue, and retrying will not change that. If the file changed, resume with the original file; otherwise discard the upload with large_evidence_upload_cancel (id "${w.uploadId}").`,
    suggestedTool: "large_evidence_upload_cancel",
  });
}

const inputSchema = z.object({
  caseFileId: z.string().uuid().describe("UUID of the case file (case_file_create → caseFileId)."),
  evidenceGroupId: z
    .string()
    .uuid()
    .describe(
      "UUID of an OPEN evidence group that YOU created (evidence_group_create): the platform accepts chunks only from the group's creator.",
    ),
  file: FileInput.describe(
    "The file to upload. ONLY { source: 'path', path: '<absolute local path>' } is accepted: the server streams the file from its own disk in chunks. Other sources are refused.",
  ),
  title: z
    .string()
    .min(1)
    .optional()
    .describe("Evidence title shown to people. Required for a new upload; ignored when resuming."),
  fileName: z
    .string()
    .min(1)
    .optional()
    .describe(
      "File name stored with the evidence. Default: the path's base name. Ignored when resuming.",
    ),
  capturedAt: z
    .string()
    .optional()
    .describe("ISO 8601 moment the evidence was captured. Default: now. Ignored when resuming."),
  evidenceId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "To follow or resume an upload: the evidenceId a previous call returned for this same file. Omit to start a new upload.",
    ),
  timeBudgetSeconds: z
    .number()
    .int()
    .min(1)
    .max(3600)
    .optional()
    .describe(
      `Longest this call waits for the upload before returning its progress (default ${DEFAULT_BUDGET_SECONDS}; keep it under your client's request timeout). The upload itself keeps running in this server between calls. A new upload's first call returns within ${NEW_UPLOAD_MAX_WAIT_MS / 1000} s whatever this says.`,
    ),
});

export const large_evidence_upload = defineTool({
  name: "large_evidence_upload",
  description:
    "Uploads a LARGE file (up to the deployment's maxLargeEvidenceSizeMB, 125000 on EAD Enterprise Suite) as one evidence, from a LOCAL PATH ONLY: the server streams the file from its own disk in chunks, so the file must be on the machine running this MCP server (stdio/local mode). Base64, n8n and URL sources are refused. " +
    "Requires: case_file_create → caseFileId; an OPEN evidence group YOU created (evidence_group_create → evidenceGroupId) — the platform takes chunks only from the group's creator, so another user's group is refused before anything is created; a title for a new upload. " +
    "The upload runs inside this server, chunk by chunk (chunk size from the deployment's settings, 1000 MB on Suite), and keeps running between calls. Each call waits up to timeBudgetSeconds (default 50) and returns status in_progress or complete, with evidenceId, uploadId and chunksDone/chunksTotal; a new upload's first call returns within 50 s, so you always get its evidenceId. To follow or resume, call again with evidenceId and the same file: chunks already uploaded are never sent again, and after a server restart the upload resumes from the platform's record. If your client times out, just call again with the evidenceId. " +
    "When status is complete, the platform finishes the evidence asynchronously: wait until evidence_get(evidenceId) returns it before sealing. Then close the group with evidence_seal, or with large_evidence_upload_complete while other large uploads in it still run. Cancel an unfinished upload with large_evidence_upload_cancel (uploadId).",
  inputSchema,
  annotations: {
    title: "Large Evidence Upload",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  pollable: false,
  // No result cache: every call reports live progress. Also mcp-core's idempotency key drops nested
  // fields (the file object), so two DIFFERENT files with the same title would share a key — found by
  // this tool's smoke test (E22 22-10; fix on its own branch, see deferred-work.md).
  idempotencyWindowSeconds: 0,
  async execute(rawInput, ctx) {
    const input = rawInput as z.infer<typeof inputSchema>;
    const started = Date.now();
    const budgetMs = (input.timeBudgetSeconds ?? DEFAULT_BUDGET_SECONDS) * 1000;

    // 1. Local path only — refuse before any upstream request (D4).
    if (input.file.source !== "path") {
      inputError(
        `large_evidence_upload takes a local path only (file.source "path"), not "${input.file.source}": base64 and n8n binaries cannot carry a file of up to 125 GB inside a tool call, and URL sources are not supported.`,
        "Put the file on the machine running this MCP server and pass { source: 'path', path: '<absolute path>' }; for a small file use evidence_upload.",
        "evidence_upload",
      );
    }
    const { real, fp } = await checkLocalPath(input.file.path);
    const { caseFileId, evidenceGroupId } = input;
    const api = new Api(ctx, caseFileId, evidenceGroupId);
    const totalSizeMB = toMiB6(fp.size);
    const showFn = showLargeEvidenceUploadControllerRun as SdkFn;

    let w: Worker | undefined;
    let isNew = false;
    if (input.evidenceId) {
      // 2a. Follow or resume.
      const known = workers.get(input.evidenceId);
      if (known && !sameFile(known.fp, fp)) {
        inputError(
          `This file is not the one upload ${known.uploadId} is uploading (different file, or it was modified).`,
          "Pass the same, unmodified file; or cancel the upload with large_evidence_upload_cancel and start a new one.",
          "large_evidence_upload_cancel",
        );
      }
      if (known && known.status !== "failed") {
        w = known;
      } else {
        workers.delete(input.evidenceId); // a failed worker is restarted below
        const found = await api.call<Upload>(
          "resume: read the upload",
          showFn,
          { path: { caseFileId, evidenceGroupId, id: input.evidenceId } },
          [404],
        );
        if (found.status === 404 || !found.data) {
          inputError(
            `No upload is in progress for evidenceId "${input.evidenceId}" in this case file and evidence group: the ids may be wrong, or the upload already finished (the platform removes its record when it finishes the evidence) or was cancelled.`,
            "Check caseFileId, evidenceGroupId and evidenceId. If it finished, the evidence is in the group — check it with evidence_get. If it was cancelled, start a new upload without evidenceId.",
            "evidence_get",
          );
        }
        const upload = found.data;
        if (Math.abs(upload.totalSizeMB - totalSizeMB) > 0.000001) {
          inputError(
            `This file (${totalSizeMB} MB) is not the one upload ${upload.id} was created for (${upload.totalSizeMB} MB).`,
            "Resume with the same file, or start a new upload without evidenceId.",
          );
        }
        try {
          checkChunkSize(upload.chunkSizeMB, "The upload");
        } catch (err) {
          inputError((err as Error).message, "Report this upload to the platform team.");
        }
        w = await startOrJoin(api, upload, real, fp);
      }
    } else {
      // 2b. New upload: settings, then who may upload into this group, then create.
      isNew = true;
      const settings = (
        await api.call<{
          largeEvidenceChunkSizeMB: number;
          maxLargeEvidenceSizeMB: number;
          featureFlags?: { largeEvidenceUploads?: boolean };
        }>("settings", showSettingsControllerRun as SdkFn, {})
      ).data;
      if (settings?.featureFlags?.largeEvidenceUploads === false) {
        inputError(
          "Large evidence uploads are switched off on this deployment (settings.featureFlags.largeEvidenceUploads is false).",
          "Use evidence_upload for files within this deployment's normal size limit.",
          "evidence_upload",
        );
      }
      const cap = Number(settings?.maxLargeEvidenceSizeMB);
      try {
        checkChunkSize(settings?.largeEvidenceChunkSizeMB, "The deployment's settings");
        if (!Number.isFinite(cap) || cap <= 0) {
          throw new PermanentError(
            `The deployment's settings give no usable maxLargeEvidenceSizeMB (${String(settings?.maxLargeEvidenceSizeMB)})`,
          );
        }
      } catch (err) {
        inputError(
          `${(err as Error).message}. Nothing was created.`,
          "Report this to the platform team.",
        );
      }
      if (totalSizeMB > cap) {
        inputError(
          `The file is ${totalSizeMB} MB, above this deployment's maxLargeEvidenceSizeMB (${cap} MB). Nothing was created.`,
          "Split the content into files within the cap, or ask the platform team about the limit.",
        );
      }
      if (!input.title) {
        inputError(
          "title is missing.",
          "Give a title to start a new upload (only resuming may omit it).",
        );
      }
      // The platform lets any collaborator CREATE the upload but takes chunks only from the group's
      // creator, so a non-creator would leave an upload nobody but the creator can finish or cancel.
      const [profile, group] = await Promise.all([
        api.call<{ id: string }>("who am I", showProfileControllerRun as SdkFn, {}),
        api.call<{ status: string; createdBy?: { id: string } }>(
          "read the evidence group",
          showEvidenceGroupControllerRun as SdkFn,
          { path: { caseFileId, id: evidenceGroupId } },
        ),
      ]);
      if (group.data?.status !== "OPEN") {
        inputError(
          `The evidence group is ${group.data?.status ?? "in an unknown state"}, not OPEN: nothing can be uploaded into it. Nothing was created.`,
          "Create a new evidence group (evidence_group_create) and upload into that one.",
          "evidence_group_create",
        );
      }
      if (!profile.data?.id || group.data?.createdBy?.id !== profile.data.id) {
        inputError(
          "Only the evidence group's creator can upload into it, and you did not create this group. Nothing was created.",
          "Create your own evidence group (evidence_group_create) and upload into it, or ask the group's creator to upload.",
          "evidence_group_create",
        );
      }
      const created = {
        id: randomUUID(),
        evidenceId: randomUUID(),
        totalSizeMB,
        title: input.title,
        fileName: input.fileName ?? basename(real),
        capturedAt: input.capturedAt ?? new Date().toISOString(),
      };
      try {
        await api.call("create", createLargeEvidenceUploadControllerRun as SdkFn, {
          path: { caseFileId, evidenceGroupId },
          body: created,
        });
      } catch (err) {
        // The platform may have created it even if its reply was lost: hand back the ids.
        throw toolError({
          operation: OPERATION,
          upstream: err,
          remediation: `Creating upload ${created.id} (evidenceId "${created.evidenceId}") failed or its reply was lost. Before retrying, check with large_evidence_upload_get (id "${created.evidenceId}"): if it exists, call large_evidence_upload with that evidenceId instead of starting a new upload.`,
          suggestedTool: "large_evidence_upload_get",
        });
      }
      w = await startOrJoin(
        api,
        {
          id: created.id,
          evidenceId: created.evidenceId,
          fileName: created.fileName,
          chunkSizeMB: Number(settings?.largeEvidenceChunkSizeMB),
          totalSizeMB,
          biggestUploadedOffset: -1,
        },
        real,
        fp,
      );
    }

    // 3. Wait for the worker (bounded), then report.
    const before = w.chunksDone;
    const elapsed = Date.now() - started;
    const waitMs = Math.max(
      0,
      (isNew ? Math.min(budgetMs, NEW_UPLOAD_MAX_WAIT_MS) : budgetMs) - elapsed,
    );
    await waitFor(w, waitMs);
    if (w.status === "failed") {
      workers.delete(w.evidenceId);
      workerFailure(w);
    }
    const complete = w.status === "complete";
    return {
      status: complete ? "complete" : "in_progress",
      evidenceId: w.evidenceId,
      uploadId: w.uploadId,
      fileName: w.fileName,
      totalSizeMB: w.totalSizeMB,
      chunkSizeMB: w.chunkSizeMB,
      chunksTotal: w.chunksTotal,
      chunksDone: w.chunksDone,
      uploadedThisCall: w.chunksDone - before,
      secondsElapsed: Math.round((Date.now() - started) / 1000),
      next: complete
        ? `Every chunk is uploaded; the platform now finishes the evidence asynchronously${w.finishedByPlatform ? " (it already has)" : ""}. Before sealing, wait until evidence_get with id "${w.evidenceId}" returns it (large_evidence_upload_get answers 404 once it is finished). Then close the group: evidence_seal if no other large upload in it is running; otherwise large_evidence_upload_complete, which closes it when the last one ends.`
        : `Uploading in this server (${w.chunksDone}/${w.chunksTotal} chunks); it keeps going between calls. Call large_evidence_upload again with evidenceId "${w.evidenceId}" and the same file to follow it (if your client timed out, do the same). If the server restarts, that call resumes from the platform's record.`,
    };
  },
});
