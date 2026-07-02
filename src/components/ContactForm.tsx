"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Reuses the capture_lead concierge action — a contact form IS a lead capture.
// Single pipeline, single inbox, single admin screen. DRY.

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ prefilledListing }: { prefilledListing?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const data = new FormData(event.currentTarget);
    const body = {
      source: "form" as const,
      full_name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      email: String(data.get("email") ?? "").trim() || undefined,
      interest_summary: [
        prefilledListing ? `Interested in listing: ${prefilledListing}.` : null,
        String(data.get("message") ?? "").trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    };

    try {
      const res = await fetch("/api/concierge-actions/capture_lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Something went wrong.");
      }
      setStatus("success");
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="mt-5 font-serif text-xl font-semibold">Message received</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          One of our agents will follow up within the same business day. We appreciate
          your interest.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <><Loader2 size={15} className="mr-2 animate-spin" />Sending…</>
        ) : "Send message"}
      </Button>
    </form>
  );
}
