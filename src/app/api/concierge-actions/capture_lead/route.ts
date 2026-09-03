import type { NextRequest } from "next/server";
import { CaptureLeadInput } from "@/lib/validation";
import { saveLead } from "@/lib/sinks/db-lead";
import { notifyDutyAgent } from "@/lib/sinks/email";
import { leadCapturedHtml } from "@/lib/sinks/email-templates";
import { ok, fail, parseBody, safeNotify } from "@/lib/concierge-actions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { ok: allowed, retryAfter } = checkRateLimit(getClientIp(req), 10, 10 * 60 * 1000);
  if (!allowed) return fail(`Too many requests. Retry in ${retryAfter}s.`, 429);

  const parsed = await parseBody(req, CaptureLeadInput);
  if (parsed instanceof Response) return parsed;

  let rowId: number;
  try {
    rowId = await saveLead({ kind: "lead", payload: parsed });
  } catch (error) {
    logger.error("capture_lead/db", error);
    return fail("Could not save lead.", 502);
  }

  const templateData = {
    rowId,
    full_name: parsed.full_name,
    phone: parsed.phone,
    email: parsed.email,
    budget_ngn: parsed.budget_ngn,
    location_preference: parsed.location_preference,
    timeframe: parsed.timeframe,
    interest_summary: parsed.interest_summary,
  };
  const emailText =
    `New qualified lead (leads #${rowId})\n\n` +
    `Name: ${parsed.full_name}\n` +
    (parsed.phone ? `Phone: ${parsed.phone}\n` : "") +
    (parsed.email ? `Email: ${parsed.email}\n` : "") +
    (parsed.budget_ngn ? `Budget: ₦${parsed.budget_ngn.toLocaleString()}\n` : "") +
    (parsed.location_preference ? `Area: ${parsed.location_preference}\n` : "") +
    (parsed.timeframe ? `Timeframe: ${parsed.timeframe}\n` : "") +
    `\nInterest:\n${parsed.interest_summary}\n`;

  await safeNotify(
    () =>
      notifyDutyAgent({
        subject: `New lead — ${parsed.full_name}`,
        text: emailText,
        html: leadCapturedHtml(templateData),
        replyTo: parsed.email,
      }),
    "capture_lead",
  );

  return ok(rowId);
}
