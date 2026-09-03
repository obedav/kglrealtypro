"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Mail, MessageSquare, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  listingSlug: string;
}

type Status = "idle" | "loading" | "success" | "error";

interface FieldErrors {
  full_name?: string;
  phone?: string;
  preferred_date?: string;
}

const inputBase =
  "w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm " +
  "placeholder:text-muted-foreground transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {msg}
    </p>
  );
}

export function ScheduleMeetingForm({ listingSlug }: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(els: HTMLFormControlsCollection): FieldErrors {
    const get = (name: string) =>
      (els.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? "";
    const errs: FieldErrors = {};
    if (!get("full_name")) errs.full_name = "Your name is required.";
    if (!get("phone")) errs.phone = "A phone number is required.";
    if (!get("preferred_date")) errs.preferred_date = "Please choose a date.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(e.currentTarget.elements);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setStatus("loading");
    setErrorMsg("");

    const els = e.currentTarget.elements;
    const get = (name: string) =>
      (els.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? "";

    const payload = {
      listing_slug: listingSlug,
      full_name: get("full_name"),
      email: get("email") || undefined,
      phone: get("phone"),
      preferred_date: get("preferred_date"),
      preferred_time_window: get("preferred_time") || undefined,
      notes: get("notes") || undefined,
    };

    try {
      const res = await fetch("/api/concierge-actions/request_tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Something went wrong — please try WhatsApp.");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <CheckCircle2 size={24} className="text-emerald-500" aria-hidden="true" />
        </div>
        <p className="font-serif text-lg font-semibold">Viewing requested!</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One of our agents will confirm your appointment within the same business day.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="font-serif text-lg font-semibold">Request a Viewing</p>

      {/* Full name */}
      <div>
        <div className="relative">
          <User
            size={13}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="full_name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={!!fieldErrors.full_name}
            aria-describedby={fieldErrors.full_name ? `${uid}-name-err` : undefined}
            className={cn(inputBase, fieldErrors.full_name && "border-destructive")}
          />
        </div>
        <FieldError id={`${uid}-name-err`} msg={fieldErrors.full_name} />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail
          size={13}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          name="email"
          type="email"
          placeholder="Email address (optional)"
          autoComplete="email"
          className={inputBase}
        />
      </div>

      {/* Phone */}
      <div>
        <div className="relative">
          <Phone
            size={13}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            autoComplete="tel"
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? `${uid}-phone-err` : undefined}
            className={cn(inputBase, fieldErrors.phone && "border-destructive")}
          />
        </div>
        <FieldError id={`${uid}-phone-err`} msg={fieldErrors.phone} />
      </div>

      {/* Date */}
      <div>
        <div className="relative">
          <Calendar
            size={13}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="preferred_date"
            type="date"
            min={today}
            aria-invalid={!!fieldErrors.preferred_date}
            aria-describedby={fieldErrors.preferred_date ? `${uid}-date-err` : undefined}
            className={cn(
              inputBase,
              "text-sm",
              fieldErrors.preferred_date && "border-destructive",
            )}
          />
        </div>
        <FieldError id={`${uid}-date-err`} msg={fieldErrors.preferred_date} />
      </div>

      {/* Time window */}
      <div className="relative">
        <Clock
          size={13}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <select
          name="preferred_time"
          className={cn(inputBase, "cursor-pointer appearance-none")}
        >
          <option value="">Preferred time (optional)</option>
          <option value="Morning (9am – 12pm)">Morning (9am – 12pm)</option>
          <option value="Afternoon (12pm – 3pm)">Afternoon (12pm – 3pm)</option>
          <option value="Late afternoon (3pm – 6pm)">Late afternoon (3pm – 6pm)</option>
          <option value="Flexible">Flexible — any time</option>
        </select>
      </div>

      {/* Notes */}
      <div className="relative">
        <MessageSquare
          size={13}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground"
        />
        <textarea
          name="notes"
          placeholder="Anything else you'd like us to know? (optional)"
          rows={3}
          className={cn(inputBase, "resize-none")}
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMsg}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Request Viewing"}
      </Button>
    </form>
  );
}
