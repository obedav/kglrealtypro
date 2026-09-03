"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/gtag";
import type { Listing } from "@/types";

type UiMessage = { role: "user" | "assistant"; content: string };
type ToolUse = { id: string; name: string; input: Record<string, unknown> };

type SseEvent =
  | { type: "text"; text: string }
  | { type: "tool_input_delta"; partial: string }
  | { type: "tool_use_start"; id: string; name: string }
  | { type: "stop"; stop_reason: string }
  | { type: "final"; usage: Record<string, number>; tool_uses: ToolUse[] }
  | { type: "done" }
  | { type: "error"; error: string };

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const ESCALATION_TRIGGERS = [
  "speak to",
  "talk to",
  "human agent",
  "real person",
  "legal",
  "tax",
  "negotiate",
  "off market",
  "off-market",
];

export function ConciergeChat({ listing }: { listing?: Listing }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Load and render the Cloudflare Turnstile invisible widget when chat opens
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !open) return;

    function renderWidget() {
      if (!turnstileContainerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered
      widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey!,
        theme: "light",
        size: "invisible",
        callback: (token: string) => {
          turnstileTokenRef.current = token;
        },
        "expired-callback": () => {
          turnstileTokenRef.current = null;
        },
      });
    }

    if (document.getElementById("cf-turnstile-script")) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [open]);

  const shouldEscalate = (text: string) =>
    ESCALATION_TRIGGERS.some((trigger) => text.toLowerCase().includes(trigger));

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const nextHistory: UiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const token = turnstileTokenRef.current ?? undefined;
      turnstileTokenRef.current = null; // tokens are one-time use

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          listing,
          escalated: shouldEscalate(trimmed),
          turnstileToken: token,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Chat failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const toolUses: ToolUse[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;

          let evt: SseEvent;
          try {
            evt = JSON.parse(payload) as SseEvent;
          } catch {
            continue;
          }

          if (evt.type === "text") {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: last.content + evt.text };
              }
              return copy;
            });
          } else if (evt.type === "final") {
            toolUses.push(...evt.tool_uses);
          } else if (evt.type === "error") {
            throw new Error(evt.error);
          }
        }
      }

      if (toolUses.length > 0) {
        const results = await Promise.allSettled(
          toolUses.map((use) =>
            fetch(`/api/concierge-actions/${use.name}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(use.input),
            }).then((r) => {
              if (!r.ok) throw new Error(`${use.name} failed: ${r.status}`);
            }),
          ),
        );

        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          console.error("[concierge] tool action failures:", failures);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Note: your request was received but one step didn't save correctly. Please follow up via WhatsApp to confirm.",
            },
          ]);
        }

        for (const use of toolUses) {
          if (use.name === "capture_lead") trackEvent("lead_captured", { method: "concierge" });
          if (use.name === "request_tour") trackEvent("tour_requested", { method: "concierge" });
          if (use.name === "handoff_to_agent") trackEvent("agent_handoff", { method: "concierge" });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          copy[copy.length - 1] = {
            role: "assistant",
            content: `Sorry — ${message}. Try again, or tap WhatsApp to reach an agent directly.`,
          };
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      controllerRef.current = null;
      // Refresh the Turnstile widget so a fresh token is ready for the next message
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }

  return (
    <>
      {/* Hidden Turnstile widget container */}
      <div ref={turnstileContainerRef} className="hidden" aria-hidden="true" />

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close concierge" : "Open concierge"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="KGL concierge chat"
          className={cn(
            "fixed bottom-24 right-6 z-50 flex w-[min(92vw,380px)] flex-col rounded-lg border bg-background shadow-2xl",
            "h-[min(70vh,560px)]",
          )}
        >
          <div className="border-b p-4">
            <p className="font-serif text-base font-medium">KGL Concierge</p>
            <p className="text-xs text-muted-foreground">
              {listing ? `Asking about ${listing.title}` : "Here to help — ask anything."}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-md bg-muted p-3 text-sm">
                Hi — I can answer questions about our listings, help you book a viewing,
                or connect you with an agent. How can I help?
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <span className="inline-flex items-center gap-1 py-0.5" aria-label="Typing">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                ) : "")}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={streaming}
            />
            <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
              {streaming ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
