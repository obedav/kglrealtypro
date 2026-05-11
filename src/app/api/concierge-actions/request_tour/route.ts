import type { NextRequest } from "next/server";
import { TourRequestInput } from "@/lib/validation";
import { saveLead } from "@/lib/sinks/db-lead";
import { notifyDutyAgent } from "@/lib/sinks/email";
import { dutyAgentWhatsappLink } from "@/lib/sinks/whatsapp";
import { ok, fail, parseBody, safeNotify } from "@/lib/concierge-actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, TourRequestInput);
  if (parsed instanceof Response) return parsed;

  let rowId: number;
  try {
    rowId = await saveLead({ kind: "tour_request", payload: parsed });
  } catch (error) {
    console.error("[request_tour] DB save failed:", error);
    return fail("Could not save request — please try WhatsApp.", 502);
  }

  const waLink = dutyAgentWhatsappLink(
    `New tour request: ${parsed.full_name} (${parsed.phone}) for ${parsed.listing_slug} on ${parsed.preferred_date}`,
  );
  const emailText =
    `New tour request (tour_requests #${rowId})\n\n` +
    `Listing: ${parsed.listing_slug}\n` +
    `Date: ${parsed.preferred_date}${parsed.preferred_time_window ? " (" + parsed.preferred_time_window + ")" : ""}\n` +
    `Name: ${parsed.full_name}\n` +
    `Phone: ${parsed.phone}\n` +
    (parsed.email ? `Email: ${parsed.email}\n` : "") +
    (parsed.notes ? `\nNotes:\n${parsed.notes}\n` : "") +
    (waLink ? `\nReply via WhatsApp: ${waLink}\n` : "");

  await safeNotify(
    () =>
      notifyDutyAgent({
        subject: `Tour request — ${parsed.listing_slug}`,
        text: emailText,
        replyTo: parsed.email,
      }),
    "request_tour",
  );

  return ok(rowId);
}
