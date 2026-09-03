"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/gtag";
import type { ActionResult } from "@/lib/concierge-actions";

// Reuses the capture_lead concierge action — a contact form IS a lead capture.
// Single pipeline, single inbox, single admin screen. DRY.

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
};

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (!name) errors.name = "Name is required.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!message) errors.message = "Message is required.";

  return errors;
}

export function ContactForm({ prefilledListing }: { prefilledListing?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStatus("submitting");
    setServerError("");

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
      const json = (await res.json()) as ActionResult;
      if (!res.ok || !json.ok) {
        throw new Error(json.ok === false ? json.error : "Something went wrong.");
      }
      setStatus("success");
      trackEvent("lead_captured", { method: "contact_form" });
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Unknown error.");
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
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          aria-invalid={!!fieldErrors.name}
          className={fieldErrors.name ? "border-destructive" : ""}
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            aria-invalid={!!fieldErrors.phone}
            className={fieldErrors.phone ? "border-destructive" : ""}
          />
          {fieldErrors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={!!fieldErrors.email}
            className={fieldErrors.email ? "border-destructive" : ""}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          aria-invalid={!!fieldErrors.message}
          className={`flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${fieldErrors.message ? "border-destructive" : "border-input"}`}
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-1 text-xs text-destructive">{fieldErrors.message}</p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? (
          <><Loader2 size={15} className="mr-2 animate-spin" />Sending…</>
        ) : "Send message"}
      </Button>
    </form>
  );
}
