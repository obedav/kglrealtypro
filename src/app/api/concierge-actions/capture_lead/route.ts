import type { NextRequest } from "next/server";
import { CaptureLeadInput } from "@/lib/validation";
import { saveLead } from "@/lib/sinks/db-lead";
import { notifyDutyAgent } from "@/lib/sinks/email";
import { ok, fail, parseBody, safeNotify } from "@/lib/concierge-actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, CaptureLeadInput);
  if (parsed instanceof Response) return parsed;

  let rowId: number;
  try {
    rowId = await saveLead({ kind: "lead", payload: parsed });
  } catch (error) {
    console.error("[capture_lead] DB save failed:", error);
    return fail("Could not save lead.", 502);
  }

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
        replyTo: parsed.email,
      }),
    "capture_lead",
  );

  return ok(rowId);
}
