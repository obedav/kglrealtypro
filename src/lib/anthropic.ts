import type { NextRequest } from "next/server";
import type { Listing } from "@/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { matchRule } from "@/lib/concierge-rules";

// ── Streaming helper ────────────────────────────────────────────────────────

function streamStaticResponse(text: string): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      send({ type: "text", text });
      send({ type: "stop", stop_reason: "end_turn" });
      send({
        type: "final",
        usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
        tool_uses: [],
      });
      send({ type: "done" });
      controller.close();
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

// ── Turnstile verification ──────────────────────────────────────────────────

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

// ── Request type ────────────────────────────────────────────────────────────

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatRequestBody = {
  messages: ChatMessage[];
  listing?: Listing;
  turnstileToken?: string;
};

// ── Route handler ───────────────────────────────────────────────────────────

export async function chatRouteHandler(req: NextRequest): Promise<Response> {
  // Rate limit
  const ip = getClientIp(req);
  const { ok: allowed, retryAfter } = checkRateLimit(ip, 30, 10 * 60 * 1000);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // Parse body
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Bot protection
  if (!(await verifyTurnstile(body.turnstileToken))) {
    return Response.json({ error: "Verification failed" }, { status: 403 });
  }

  // Extract last user message
  const lastUserMsg = [...body.messages].reverse().find((m) => m.role === "user");
  const userText = String(lastUserMsg?.content ?? "").trim();

  // Rule match → static response; no match → WhatsApp fallback
  const answer = matchRule(userText, body.listing);
  return streamStaticResponse(answer);
}
