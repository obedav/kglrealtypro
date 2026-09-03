import type { NextRequest } from "next/server";

type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();
let lastCleanup = Date.now();

function sweep() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.reset) store.delete(key);
  }
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  sweep();
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.reset) {
    store.set(identifier, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
