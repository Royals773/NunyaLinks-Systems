import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ChatRequestSchema,
  MAX_OUTPUT_TOKENS,
  buildSystemInstructions,
  buildTranscriptInput,
} from "@/lib/assistant";
import { REQUEST_TIMEOUT_MS } from "@/lib/assistant-limits";

// Needs the Node.js runtime: the OpenAI SDK isn't Edge-compatible here,
// and this route must only ever run server-side.
export const runtime = "nodejs";

/*
 * Same in-memory-per-instance rate limit approach as app/api/audit/route.ts
 * — a best-effort deterrent, not a hard guarantee on a multi-instance
 * deployment. A separate, tighter window than the audit form: chat is
 * conversational and cheap to abuse, so it gets its own budget.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 8;
// Hard ceiling on distinct IPs tracked at once, so a flood of spoofed
// X-Forwarded-For values can't grow this map without bound between
// prunes. Comfortably above any realistic legitimate concurrent load for
// a single chat widget.
const RATE_LIMIT_MAX_TRACKED_IPS = 5000;
const requestsByIp = new Map<string, { count: number; windowStart: number }>();

// Sweeps entries whose window has already expired. Called on every
// request rather than on a timer — this route runs on serverless
// instances that may not have a persistent background clock, and the
// short window keeps this cheap in practice.
function pruneExpiredEntries(now: number) {
  for (const [key, entry] of requestsByIp) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestsByIp.delete(key);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneExpiredEntries(now);

  const entry = requestsByIp.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    if (!entry && requestsByIp.size >= RATE_LIMIT_MAX_TRACKED_IPS) {
      // Store is saturated with active windows — fail closed for a new
      // IP rather than growing past the ceiling.
      return true;
    }
    requestsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Generous enough for MAX_MESSAGES messages at MAX_MESSAGE_LENGTH chars
// each, plus JSON overhead — modest, but not derived from Content-Length,
// which a client can omit or lie about.
const MAX_BODY_BYTES = 24_000;

const GENERIC_ERROR =
  "The assistant is unavailable right now. Please try again shortly, or use the Automation Opportunity Review form.";

class BodyTooLargeError extends Error {}

/**
 * Reads the request body under a hard byte ceiling, counting actual bytes
 * received rather than trusting the Content-Length header (which a client
 * can omit or under-report). Aborts and throws as soon as the limit is
 * crossed, before the full body is ever buffered or parsed.
 */
async function readBodyWithLimit(
  request: Request,
  limitBytes: number
): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > limitBytes) {
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    // Always release the reader/stream, including on the size-limit
    // throw above — otherwise an oversized upload would keep streaming
    // into memory after we've already decided to reject it.
    await reader.cancel().catch(() => {});
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }

  // Cheap early reject when the client honestly declares an oversized
  // body — but this is only a fast path. It is never the real control:
  // a client can omit Content-Length or under-report it, so the actual
  // bytes read below are what's enforced regardless of this header.
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let rawText: string;
  try {
    rawText = await readBodyWithLimit(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    // Any other stream-read failure is treated the same as a malformed
    // request — never logged, never surfaced beyond a generic message.
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 503 });
  }

  // ?? only falls through on null/undefined — an env var explicitly set
  // to "" or whitespace would otherwise be sent to OpenAI as an invalid
  // model name, so blank/whitespace-only values fall back too.
  const configuredModel = process.env.NUNYALINK_CHAT_MODEL?.trim();
  const model = configuredModel ? configuredModel : "gpt-5-mini";

  const client = new OpenAI({
    apiKey,
    timeout: REQUEST_TIMEOUT_MS,
    // At most one OpenAI attempt per visitor message — the SDK's
    // automatic retries (default: 2) are disabled outright, not just
    // reduced, so a single request never silently becomes multiple
    // attempts against OpenAI.
    maxRetries: 0,
  });

  try {
    const response = await client.responses.create({
      model,
      store: false,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      input: [
        { role: "developer", content: buildSystemInstructions() },
        // The entire client-supplied conversation — including any
        // message labelled "assistant" — goes in as one plain-text user
        // message, never as forwarded roles. See buildTranscriptInput's
        // doc comment for why.
        { role: "user", content: buildTranscriptInput(parsed.data.messages) },
      ],
    });

    const reply = response.output_text?.trim();
    if (!reply) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch {
    // Deliberately no logging here: this catch can carry chat content,
    // API errors, or other details this route must never persist.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}
