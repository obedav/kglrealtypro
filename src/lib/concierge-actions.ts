// Shared response envelope + error handling for the concierge-action routes.
// Keeps each route file tiny — just: validate → persist → notify → respond.

import { ZodError, type ZodSchema } from "zod";

export type ActionResult =
  | { ok: true; id: number | string }
  | { ok: false; error: string };

export function ok(id: number | string): Response {
  return Response.json({ ok: true, id } satisfies ActionResult);
}

export function fail(error: string, status = 400): Response {
  return Response.json({ ok: false, error } satisfies ActionResult, { status });
}

/**
 * Parse + validate untrusted JSON against a Zod schema.
 * Returns a ready-to-return 400 Response on failure; T on success.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<T | Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("Invalid JSON");
  }
  try {
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    }
    return fail("Validation failed");
  }
}

/**
 * Swallow non-fatal side-effect errors with logging, so a Resend outage
 * doesn't lose the lead that WP already persisted. Rethrow on WP failure —
 * if WP didn't save, we have nothing.
 */
export async function safeNotify(fn: () => Promise<void>, label: string): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error(`[concierge-actions/${label}] notification failed:`, error);
  }
}
