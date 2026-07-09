"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  listingSlug: string;
}

type Status = "idle" | "loading" | "success" | "error";

const inputBase =
  "w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm " +
  "placeholder:text-muted-foreground transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";

export function ScheduleMeetingForm({ listingSlug }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    };

    try {
      const res = await fetch("/api/concierge-actions/request_tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
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
        <p className="font-serif text-lg font-semibold">Meeting requested!</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One of our agents will confirm your appointment within the same business day.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="font-serif text-lg font-semibold">Schedule Meeting</p>

      {/* Full name */}
      <div className="relative">
        <User size={13} aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="full_name"
          type="text"
          placeholder="Your full name"
          required
          autoComplete="name"
          className={inputBase}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail size={13} aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="email"
          type="email"
          placeholder="Enter email address"
          autoComplete="email"
          className={inputBase}
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <Phone size={13} aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="phone"
          type="tel"
          placeholder="Your phone number"
          required
          autoComplete="tel"
          className={inputBase}
        />
      </div>

      {/* Date */}
      <div className="relative">
        <Calendar size={13} aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="preferred_date"
          type="date"
          required
          min={today}
          className={cn(inputBase, "text-sm")}
        />
      </div>

      {/* Time */}
      <div className="relative">
        <Clock size={13} aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="preferred_time"
          type="time"
          className={cn(inputBase, "text-sm")}
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMsg}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
