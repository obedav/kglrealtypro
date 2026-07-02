/**
 * Writes leads, tour requests, and handoff requests to MySQL.
 * Replaces the old WP-CPT sink. Each kind maps to a dedicated table whose
 * columns mirror the Zod-validated action payload.
 */

import { exec, isDbConfigured } from "@/lib/db";
import type {
  CaptureLeadInput,
  TourRequestInput,
  HandoffToAgentInput,
} from "@/lib/validation";

type SaveKind =
  | { kind: "lead";            payload: CaptureLeadInput }
  | { kind: "tour_request";    payload: TourRequestInput }
  | { kind: "handoff_request"; payload: HandoffToAgentInput };

/**
 * Create a row in the matching table. Returns the new row id.
 * Throws on DB errors — caller decides whether to degrade gracefully.
 */
export async function saveLead(input: SaveKind): Promise<number> {
  if (!isDbConfigured()) {
    // Dev fallback — log and return a synthetic id so the API route can
    // still notify the duty agent and respond 200 locally.
    console.log("[db-lead/dev]", input);
    return -1;
  }

  switch (input.kind) {
    case "lead": {
      const p = input.payload;
      const { insertId } = await exec(
        `INSERT INTO leads
          (source, full_name, phone, email, interest_summary,
           budget_ngn, location_preference, timeframe)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.source ?? "concierge",
          p.full_name,
          p.phone ?? null,
          p.email ?? null,
          p.interest_summary,
          p.budget_ngn ?? null,
          p.location_preference ?? null,
          p.timeframe ?? null,
        ],
      );
      return insertId;
    }

    case "tour_request": {
      const p = input.payload;
      const { insertId } = await exec(
        `INSERT INTO tour_requests
          (listing_slug, preferred_date, preferred_time_window,
           full_name, phone, email, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          p.listing_slug,
          p.preferred_date,
          p.preferred_time_window ?? null,
          p.full_name,
          p.phone,
          p.email ?? null,
          p.notes ?? null,
        ],
      );
      return insertId;
    }

    case "handoff_request": {
      const p = input.payload;
      const { insertId } = await exec(
        `INSERT INTO handoff_requests
          (reason, summary, urgency, contact_phone, contact_email)
         VALUES (?, ?, ?, ?, ?)`,
        [
          p.reason,
          p.summary,
          p.urgency,
          p.contact_phone ?? null,
          p.contact_email ?? null,
        ],
      );
      return insertId;
    }
  }
}
