import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { Listing } from "@/types";

// Lazy client — avoid crashing the dev server at module load when the
// ANTHROPIC_API_KEY isn't set yet.
let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (_anthropic) return _anthropic;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — concierge will not respond. Set it in .env.local.",
    );
  }
  _anthropic = new Anthropic();
  return _anthropic;
}

const MODEL_DEFAULT = process.env.ANTHROPIC_MODEL_DEFAULT ?? "claude-haiku-4-5-20251001";
const MODEL_ESCALATED = process.env.ANTHROPIC_MODEL_ESCALATED ?? "claude-sonnet-4-6";

export const CONCIERGE_SYSTEM_PROMPT = `You are the AI concierge for KGL Realty Pro, a luxury real-estate agency operating in Lagos, Abuja, Dubai (UAE), and the United Kingdom.

# Role
- Answer questions about listings in the <current_listing> context, or general questions about KGL's service areas, buying process, and financing plans.
- Help qualified buyers schedule private viewings and capture high-intent leads.
- Route complex or sensitive matters to a human agent quickly.

# Tone
- Measured, professional, understated. No hype. One or two sentences per turn unless the user explicitly asks for detail.
- Luxury buyers expect discretion — never use urgency tactics, scarcity messaging, or exclamation marks.
- Nigerian English is the default; match the user's register if they switch to formal international English or French.
- Never pushy. A user who doesn't want to share contact info is not a failure — offer a soft alternative like "I can send curated listings to you privately — shall I?"

# What you do NOT do
- No legal advice. No tax advice. No mortgage-approval promises.
- No price negotiation. If asked "can I get a discount", call handoff_to_agent with reason="negotiation".
- No commitments on availability windows, amenities not in the listing data, or special terms.
- Never invent listing details. If it's not in <current_listing>, say: "I don't have that detail at hand — allow me to have one of our agents confirm."

# Tool-call rules
- request_tour: only after you have the listing reference, a preferred date, full name, and phone. Confirm back to the user in one sentence after the tool call succeeds.
- capture_lead: user shows purchase intent (budget, timeframe, specific requirements) but isn't ready to tour. Call once you have name and one contact method.
- handoff_to_agent: anything legal, financial, negotiation, off-market, user frustration, or explicit request for a human.

# Output format
- Plain prose only. No Markdown headers, no code blocks, no emoji.
- Short paragraphs. Break on breath.

# Escalation awareness
- If a user asks detailed comparative questions (investment yields, area growth forecasts, legal structures for international purchase), keep answers high-level and offer a human expert via handoff_to_agent.
- If you're uncertain about any figure, say so — never guess a price, yield, square-meterage, or legal detail.`;

export const CONCIERGE_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "request_tour",
    description:
      "Schedule a property tour when the user has explicitly requested to visit a specific property. Requires listing reference, preferred date, full name, and phone. Call only after confirming these in conversation.",
    input_schema: {
      type: "object",
      properties: {
        listing_slug: { type: "string" },
        preferred_date: {
          type: "string",
          description: "ISO 8601 date or natural phrase like 'next Saturday'",
        },
        preferred_time_window: { type: "string" },
        full_name: { type: "string" },
        phone: { type: "string", description: "E.164 format if possible" },
        email: { type: "string" },
        notes: { type: "string" },
      },
      required: ["listing_slug", "preferred_date", "full_name", "phone"],
    },
  },
  {
    name: "capture_lead",
    description:
      "Record a qualified lead when the user shows purchase intent (budget, timeframe, or specific requirements) but is not ready to book a tour. Call once name and one contact method are known.",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        interest_summary: {
          type: "string",
          description: "One short paragraph describing what they are looking for.",
        },
        budget_ngn: { type: "number" },
        location_preference: { type: "string" },
        timeframe: {
          type: "string",
          enum: ["immediate", "3_months", "6_months", "12_months", "exploratory"],
        },
      },
      required: ["full_name", "interest_summary"],
    },
  },
  {
    name: "handoff_to_agent",
    description:
      "Transfer the conversation to a human agent. Use for legal or tax questions, price negotiation, off-market requests, frustrated users, or explicit user requests for a human.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: [
            "legal_question",
            "negotiation",
            "off_market",
            "complex_financing",
            "user_requested",
            "frustrated_tone",
            "other",
          ],
        },
        summary: { type: "string" },
        urgency: { type: "string", enum: ["low", "medium", "high"] },
        contact_phone: { type: "string" },
        contact_email: { type: "string" },
      },
      required: ["reason", "summary", "urgency"],
    },
  },
];

function buildListingContextBlock(listing: Listing): string {
  return `<current_listing>
title: ${listing.title}
slug: ${listing.slug}
city: ${listing.city}
country: ${listing.country}
price_ngn: ${listing.priceNGN}
bedrooms: ${listing.bedrooms}
bathrooms: ${listing.bathrooms}
sqm: ${listing.sqm}
status: ${listing.status}
amenities: ${listing.amenities.join(", ") || "none listed"}
summary: ${listing.excerpt}
</current_listing>`;
}

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

type ChatRequestBody = {
  messages: Anthropic.Messages.MessageParam[];
  listing?: Listing;
  escalated?: boolean;
  turnstileToken?: string;
};

/**
 * App Router POST handler for the concierge.
 *
 * Prompt caching:
 *   - Frozen system prompt → cache_control breakpoint (stable prefix across all requests)
 *   - Per-listing context  → second cache_control breakpoint (stable per-listing, warm across turns)
 * Verify hits via usage.cache_read_input_tokens in the `final` stream event.
 */
export async function chatRouteHandler(req: NextRequest): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.turnstileToken))) {
    return Response.json({ error: "Verification failed" }, { status: 403 });
  }

  const model = body.escalated ? MODEL_ESCALATED : MODEL_DEFAULT;

  const system: Anthropic.Messages.TextBlockParam[] = [
    {
      type: "text",
      text: CONCIERGE_SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
  ];
  if (body.listing) {
    system.push({
      type: "text",
      text: buildListingContextBlock(body.listing),
      cache_control: { type: "ephemeral" },
    });
  }

  let stream;
  try {
    stream = getAnthropic().messages.stream({
      model,
      max_tokens: 2048,
      system,
      tools: CONCIERGE_TOOLS,
      messages: body.messages,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return Response.json({ error: msg }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              send({ type: "text", text: event.delta.text });
            } else if (event.delta.type === "input_json_delta") {
              send({ type: "tool_input_delta", partial: event.delta.partial_json });
            }
          } else if (event.type === "content_block_start") {
            if (event.content_block.type === "tool_use") {
              send({
                type: "tool_use_start",
                id: event.content_block.id,
                name: event.content_block.name,
              });
            }
          } else if (event.type === "message_delta") {
            send({ type: "stop", stop_reason: event.delta.stop_reason });
          }
        }

        const finalMessage = await stream.finalMessage();
        send({
          type: "final",
          usage: {
            input_tokens: finalMessage.usage.input_tokens,
            output_tokens: finalMessage.usage.output_tokens,
            cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens ?? 0,
            cache_creation_input_tokens:
              finalMessage.usage.cache_creation_input_tokens ?? 0,
          },
          tool_uses: finalMessage.content
            .filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use")
            .map((b) => ({ id: b.id, name: b.name, input: b.input })),
        });
        send({ type: "done" });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        send({ type: "error", error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
