import { NextResponse } from "next/server";
import { Resend } from "resend";
import { tasks } from "@trigger.dev/sdk";
import {
  HONEYPOT_FIELD_NAME,
  sanitizeAuditPayload,
  validateAuditPayload,
  type AuditRequestPayload,
} from "@/lib/audit";
// Type-only: erased at build time, so the task implementation (and its
// OpenAI / Composio dependencies) is never bundled or registered inside
// this route. Only @trigger.dev/sdk's lightweight HTTP client runs here.
import type { processOpportunityReviewTask } from "@/src/trigger/process-opportunity-review";

// Instantiated lazily per-request: constructing eagerly at module load
// throws if RESEND_API_KEY isn't set yet (e.g. during build-time page data
// collection, before env vars are available).
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

/*
 * Very simple in-memory rate limit: N submissions per IP per window.
 * This resets on every cold start and is per-instance, so on a
 * multi-instance/serverless deployment (e.g. Vercel) it's a best-effort
 * deterrent rather than a hard guarantee — a determined abuser spread
 * across instances could exceed it. Good enough for a lead form; if this
 * ever needs to be airtight, swap this Map for a shared store
 * (e.g. Upstash Redis / Vercel KV).
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const submissionsByIp = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = submissionsByIp.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    submissionsByIp.set(ip, { count: 1, windowStart: now });
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLeadEmailHtml(payload: AuditRequestPayload) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#1F3A5F;vertical-align:top;width:200px;">${escapeHtml(
        label
      )}</td>
      <td style="padding:8px 12px;color:#12192b;">${escapeHtml(
        value || "—"
      )}</td>
    </tr>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7F4EE;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#1F3A5F;padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;">New Automation Opportunity Review Request</h1>
      </div>
      <div style="padding:24px 32px;">
        <div style="background:#F4E1CC;border-left:4px solid #A6431F;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#A6431F;">Time-wasting process</p>
          <p style="margin:0 0 12px;font-size:16px;color:#12192b;">${escapeHtml(
            payload.process
          )}</p>
          <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#A6431F;">Hours per week</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#1F3A5F;">${escapeHtml(
            payload.hoursPerWeek || "Not sure"
          )}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tbody>
            ${row("Full name", payload.fullName)}
            ${row("Business name", payload.businessName)}
            ${row("Email", payload.email)}
            ${row("Phone", payload.phone)}
            ${row("Business location", payload.location)}
            ${row("Industry", payload.industry)}
            ${row("Number of employees", payload.employees)}
            ${row("Preferred contact method", payload.contactMethod)}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function buildConfirmationEmailHtml(payload: AuditRequestPayload) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7F4EE;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#1F3A5F;padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;">We&rsquo;ve got your review request</h1>
      </div>
      <div style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:15px;color:#12192b;">Hi ${escapeHtml(
          payload.fullName
        )},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#12192b;">
          Thanks for telling us about ${escapeHtml(
            payload.businessName
          )}&rsquo;s biggest time-drain. NunyaLink Systems will be in touch within one working day to book your free Automation Opportunity Review.
        </p>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#12192b;">
          — The NunyaLink Systems team
        </p>
      </div>
    </div>
  </div>`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let rawPayload: Record<string, unknown>;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot: real users never populate this field. Bots that fill in
  // every input on the form will. Pretend success without sending mail
  // or leaking that the field was a trap.
  if (
    typeof rawPayload[HONEYPOT_FIELD_NAME] === "string" &&
    (rawPayload[HONEYPOT_FIELD_NAME] as string).trim().length > 0
  ) {
    console.warn("Audit request rejected: honeypot field populated.");
    return NextResponse.json({ ok: true });
  }

  const data = sanitizeAuditPayload(rawPayload);

  const validationError = validateAuditPayload(data);
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 }
    );
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.AUDIT_FROM_EMAIL as string,
      to: process.env.AUDIT_TO_EMAIL as string,
      replyTo: data.email,
      subject: `New Automation Opportunity Review request — ${data.businessName}`,
      html: buildLeadEmailHtml(data),
    });
  } catch (error) {
    console.error("Failed to send audit request email:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong sending your request.",
      },
      { status: 500 }
    );
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.AUDIT_FROM_EMAIL as string,
      to: data.email,
      subject: "We've got your review request",
      html: buildConfirmationEmailHtml(data),
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  // Additive automation: the owner has already received the Resend lead
  // notification above, so any failure here must never affect the
  // visitor's response. Disabled unless the flag is exactly "true".
  if (process.env.NUNYALINK_AUTOMATION_ENABLED === "true") {
    try {
      await tasks.trigger<typeof processOpportunityReviewTask>(
        "process-opportunity-review",
        {
          leadId: `WEB-${data.submissionId}`,
          submittedAt: new Date().toISOString(),
          fullName: data.fullName,
          businessName: data.businessName,
          email: data.email,
          phone: data.phone || null,
          businessLocation: data.location,
          industry: data.industry,
          numberOfEmployees: data.employees,
          timeDrainingProcess: data.process,
          hoursPerWeek: data.hoursPerWeek,
          preferredContact: data.contactMethod,
          followUpDelayHours: 24,
          dryRun: false,
        },
        { idempotencyKey: `opportunity-review:${data.submissionId}` }
      );
    } catch {
      console.error("Automation enqueue failed.");
    }
  }

  return NextResponse.json({ ok: true });
}
