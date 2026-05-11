/**
 * Smoke test — hits every public route against a given base URL and reports
 * status + latency. Use locally or against a deployed Vercel URL.
 *
 * Usage:
 *   SMOKE_BASE_URL=http://localhost:3000 npm run smoke
 *   SMOKE_BASE_URL=https://kglrealtypro.com npm run smoke
 *   npm run smoke -- https://kglrealtypro-xxx.vercel.app
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

type Check = {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  expect: number | number[];
  /** "follow" = follow redirects silently. "manual" = assert redirect status. */
  redirect?: "follow" | "manual";
  note?: string;
};

const CHECKS: Check[] = [
  // Core pages
  { path: "/",                       expect: 200 },
  { path: "/properties",             expect: 200 },
  { path: "/properties/nonexistent", expect: 404, note: "expected 404" },
  { path: "/agents",                 expect: 200 },
  { path: "/agents/nonexistent",     expect: 404, note: "expected 404" },
  { path: "/blog",                   expect: 200 },
  { path: "/about",                  expect: 200 },
  { path: "/contact",                expect: 200 },

  // Nav destinations
  { path: "/buyers-and-sellers-guide",  expect: 200 },
  { path: "/buyers-guide",              expect: 200 },
  { path: "/sellers-guide",             expect: 200 },
  { path: "/partners",                  expect: 200 },
  { path: "/investment",                expect: 200 },
  { path: "/investment/cashback",       expect: 200 },
  { path: "/investment/land-vest",      expect: 200 },
  { path: "/new-developments",          expect: 200 },
  { path: "/short-stay",                expect: 200 },
  { path: "/privacy",                   expect: 200 },
  { path: "/terms",                     expect: 200 },

  // SEO surfaces
  { path: "/sitemap.xml", expect: 200 },
  { path: "/robots.txt",  expect: 200 },

  // 301 redirects — city URLs
  { path: "/lagos",  expect: [301, 308], redirect: "manual", note: "→ /properties?city=Lagos" },
  { path: "/abuja",  expect: [301, 308], redirect: "manual", note: "→ /properties?city=Abuja" },
  { path: "/dubai",  expect: [301, 308], redirect: "manual", note: "→ /properties?city=Dubai" },
  { path: "/about-us",   expect: [301, 308], redirect: "manual", note: "→ /about" },
  { path: "/contact-us", expect: [301, 308], redirect: "manual", note: "→ /contact" },
  { path: "/patners",    expect: [301, 308], redirect: "manual", note: "→ /partners (typo fix)" },

  // API
  { path: "/api/health", expect: [200, 503], note: "503 ok if WP env missing" },
];

type Result = {
  check: Check;
  status: number;
  latency_ms: number;
  ok: boolean;
  detail: string;
};

const BASE_URL =
  process.argv[2] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:3000";

function expected(expect: number | number[]): number[] {
  return Array.isArray(expect) ? expect : [expect];
}

async function runCheck(check: Check): Promise<Result> {
  const url = `${BASE_URL.replace(/\/$/, "")}${check.path}`;
  const started = performance.now();

  try {
    const res = await fetch(url, {
      method: check.method ?? "GET",
      redirect: check.redirect ?? "follow",
      headers: check.body ? { "Content-Type": "application/json" } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    const latency_ms = Math.round(performance.now() - started);
    const allowed = expected(check.expect);
    const ok = allowed.includes(res.status);
    return {
      check,
      status: res.status,
      latency_ms,
      ok,
      detail: ok ? "" : `expected ${allowed.join("|")}`,
    };
  } catch (error) {
    const latency_ms = Math.round(performance.now() - started);
    return {
      check,
      status: 0,
      latency_ms,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  console.log(`\nSmoke test → ${BASE_URL}\n`);
  console.log(pad("Route", 40) + pad("Status", 8) + pad("Latency", 10) + "Note");
  console.log("─".repeat(80));

  const results: Result[] = [];
  for (const check of CHECKS) {
    const result = await runCheck(check);
    results.push(result);
    const mark = result.ok ? "✓" : "✗";
    const statusCol = result.status > 0 ? String(result.status) : "ERR";
    const note = result.ok ? (check.note ?? "") : result.detail;
    console.log(
      `${mark} ${pad(check.path, 38)}${pad(statusCol, 8)}${pad(result.latency_ms + "ms", 10)}${note}`,
    );
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;

  console.log("─".repeat(80));
  console.log(`\n${passed}/${results.length} passed${failed > 0 ? `, ${failed} failed` : ""}.`);

  if (failed > 0) {
    console.log("\nFailed routes:");
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  ${r.check.path} → ${r.status || "ERR"} (${r.detail})`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
