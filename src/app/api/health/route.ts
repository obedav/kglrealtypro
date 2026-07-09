import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health — runtime connectivity check for external dependencies.
//
// Returns 200 when the site can serve content (WP reachable).
// Returns 503 when a critical dependency is down.
// Non-critical services (email, concierge) are reported as warnings — site
// still serves, but features degrade gracefully.
//
// Safe to expose publicly — no secrets leak, only status + latency.

type CheckStatus = "ok" | "degraded" | "down" | "configured" | "missing" | "skipped";
type Check = { status: CheckStatus; latency_ms?: number; detail?: string };

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T | null; latency_ms: number; error: string | null }> {
  const started = performance.now();
  try {
    const value = await fn();
    return { value, latency_ms: Math.round(performance.now() - started), error: null };
  } catch (error) {
    return {
      value: null,
      latency_ms: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkDataApi(): Promise<Check> {
  const url = (process.env.DATA_API_URL ?? "").replace(/\/$/, "");
  const token = process.env.DATA_API_TOKEN ?? "";
  if (!url || !token) {
    return { status: "missing", detail: `DATA_API_URL=${url ? "set" : "missing"} DATA_API_TOKEN=${token ? "set" : "missing"}` };
  }
  const testUrl = `${url}?action=featured_listings&limit=1`;
  const { value, latency_ms, error } = await timed(async () => {
    const res = await fetch(testUrl, {
      headers: { "X-Data-Token": token },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
    const json = JSON.parse(text) as unknown;
    return { count: Array.isArray(json) ? json.length : -1, raw: text.slice(0, 200) };
  });
  if (error) return { status: "down", latency_ms, detail: error };
  return { status: "ok", latency_ms, detail: `returned ${value?.count} listing(s)` };
}

async function checkWpGraphQL(): Promise<Check> {
  const endpoint = process.env.WP_GRAPHQL_ENDPOINT;
  if (!endpoint) return { status: "missing", detail: "WP_GRAPHQL_ENDPOINT not set" };

  // Minimal introspection query — zero auth, zero data exposure, pure reachability.
  const { value, latency_ms, error } = await timed(async () => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { data?: unknown; errors?: unknown };
    if (!body.data) throw new Error("GraphQL returned no data");
    return body;
  });

  if (error) return { status: "down", latency_ms, detail: error };
  return { status: "ok", latency_ms };
}

async function checkWpRest(): Promise<Check> {
  const endpoint = process.env.WP_REST_ENDPOINT;
  if (!endpoint) return { status: "missing", detail: "WP_REST_ENDPOINT not set" };

  const { latency_ms, error } = await timed(async () => {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  });

  if (error) return { status: "down", latency_ms, detail: error };
  return { status: "ok", latency_ms };
}

function checkEnv(key: string): Check {
  return process.env[key]
    ? { status: "configured" }
    : { status: "missing", detail: `${key} not set` };
}

export async function GET(_req: NextRequest): Promise<Response> {
  const [wpGraphQL, wpRest, dataApi] = await Promise.all([checkWpGraphQL(), checkWpRest(), checkDataApi()]);
  const anthropic = checkEnv("ANTHROPIC_API_KEY");
  const resend = checkEnv("RESEND_API_KEY");
  const turnstile = process.env.TURNSTILE_SECRET_KEY
    ? { status: "configured" as const }
    : { status: "skipped" as const, detail: "optional — not configured" };
  const wpLeadWriter = process.env.WP_LEAD_WRITER_APP_PASSWORD
    ? { status: "configured" as const }
    : { status: "missing" as const, detail: "concierge actions will not persist to WP" };

  // Overall rollup. WP is the only critical dependency; everything else degrades.
  const critical: Check[] = [wpGraphQL];
  const anyDown = critical.some((c) => c.status === "down");
  const anyMissing = critical.some((c) => c.status === "missing");
  const overallStatus: "ok" | "degraded" | "down" = anyDown ? "down" : anyMissing ? "degraded" : "ok";

  const body = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    checks: {
      data_api: dataApi,
      wp_graphql: wpGraphQL,
      wp_rest: wpRest,
      wp_lead_writer: wpLeadWriter,
      anthropic,
      resend,
      turnstile,
    },
  };

  return Response.json(body, {
    status: overallStatus === "down" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
