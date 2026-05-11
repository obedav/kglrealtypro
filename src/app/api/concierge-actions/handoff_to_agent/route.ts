import type { NextRequest } from "next/server";
import { HandoffToAgentInput } from "@/lib/validation";
import { saveLead } from "@/lib/sinks/db-lead";
import { notifyDutyAgent } from "@/lib/sinks/email";
import { dutyAgentWhatsappLink } from "@/lib/sinks/whatsapp";
import { ok, fail, parseBody, safeNotify } from "@/lib/concierge-actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, HandoffToAgentInput);
  if (parsed instanceof Response) return parsed;

  let rowId: number;
  try {
    rowId = await saveLead({ kind: "handoff_request", payload: parsed });
  } catch (error) {
    console.error("[handoff_to_agent] DB save failed:", error);
    return fail("Could not record handoff.", 502);
  }

  const waLink = dutyAgentWhatsappLink(
    `Handoff (${parsed.urgency}, ${parsed.reason}): ${parsed.summary}`,
  );
  const emailText =
    `Human-handoff requested (handoff_requests #${rowId})\n\n` +
    `Reason: ${parsed.reason}\n` +
    `Urgency: ${parsed.urgency}\n` +
    `Summary: ${parsed.summary}\n` +
    (parsed.contact_phone ? `Phone: ${parsed.contact_phone}\n` : "") +
    (parsed.contact_email ? `Email: ${parsed.contact_email}\n` : "") +
    (waLink ? `\nReply via WhatsApp: ${waLink}\n` : "");

  await safeNotify(
    () =>
      notifyDutyAgent({
        subject: `Handoff requested — ${parsed.reason}`,
        text: emailText,
        urgency: parsed.urgency,
        replyTo: parsed.contact_email,
      }),
    "handoff_to_agent",
  );

  return ok(rowId);
}
