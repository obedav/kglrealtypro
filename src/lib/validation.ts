import { z } from "zod";

// Zod schemas mirror the tool `input_schema` declarations in src/lib/anthropic.ts.
// Single source of truth for runtime validation at the action-handler boundary.

export const TourRequestInput = z.object({
  listing_slug: z.string().min(1),
  preferred_date: z.string().min(1),
  preferred_time_window: z.string().optional(),
  full_name: z.string().min(1).max(200),
  phone: z.string().min(5).max(32),
  email: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
});
export type TourRequestInput = z.infer<typeof TourRequestInput>;

export const CaptureLeadInput = z.object({
  full_name: z.string().min(1).max(200),
  phone: z.string().min(5).max(32).optional(),
  email: z.string().email().optional(),
  interest_summary: z.string().min(1).max(2000),
  budget_ngn: z.number().positive().optional(),
  location_preference: z.string().max(200).optional(),
  timeframe: z
    .enum(["immediate", "3_months", "6_months", "12_months", "exploratory"])
    .optional(),
  source: z
    .enum(["concierge", "form", "whatsapp", "phone", "referral"])
    .optional(),
});
export type CaptureLeadInput = z.infer<typeof CaptureLeadInput>;

export const HandoffToAgentInput = z.object({
  reason: z.enum([
    "legal_question",
    "negotiation",
    "off_market",
    "complex_financing",
    "user_requested",
    "frustrated_tone",
    "other",
  ]),
  summary: z.string().min(1).max(2000),
  urgency: z.enum(["low", "medium", "high"]),
  contact_phone: z.string().min(5).max(32).optional(),
  contact_email: z.string().email().optional(),
});
export type HandoffToAgentInput = z.infer<typeof HandoffToAgentInput>;
