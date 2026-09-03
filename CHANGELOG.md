# Changelog

All notable changes to KGL Realty Pro are documented here.

## [1.0.0] — 2026-09-03

### Security
- Added per-IP rate limiting (30 req/10 min on `/api/chat`; 10 req/10 min on concierge actions)
- Tightened `sanitize-html` allow-list — removed `"*": ["class"]` wildcard; images restricted to HTTPS only
- Added `public/robots.txt` blocking `/api/`, `/admin/`, `/db/` from crawlers
- Added `AbortSignal.timeout(30_000)` to Anthropic API stream calls

### Features
- AI concierge tool-use failures now surface a visible warning to the user
- Live FX rates fetched from `open.er-api.com` every 6 hours via `/api/fx-rates`; client price display updates automatically
- GA4 analytics wired via `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `lead_captured`, `tour_requested`, `agent_handoff` events tracked
- HTML email templates for all three agent notification types (lead, tour request, handoff)
- Privacy policy — full NDPA 2023 + UK GDPR compliant 13-section document
- Terms & Conditions — full 13-section document covering agency scope, AI concierge, liability
- WordPress REST API implemented in `getPageBySlug` — activates when `WP_REST_ENDPOINT` is set
- Contact form now has inline field-level validation with `aria-invalid` / `aria-describedby`

### Bug Fixes
- Fixed broken global `canonical: "/"` in layout — replaced with per-page canonicals on all key routes
- Fixed silent tool-use failures in `ConciergeChat` — switched to `Promise.allSettled`
- Fixed `generateMetadata` in `blog/[slug]`, `agents/[slug]`, `investment/[slug]` — wrapped in try/catch
- Fixed missing `generateStaticParams` try/catch in `investment/[slug]`
- Updated stale FX fallback rates (was May 2026; now September 2026 values)

### Refactoring
- Extracted contact details to `src/lib/constants.ts` — single source of truth for phone, WhatsApp, email, address
- Replaced hardcoded TEAM array in About page with live `getAgents()` call; stub agents updated with photo paths
- Added structured JSON logger (`src/lib/logger.ts`) — `console.error` replaced across route handlers
- Removed unused `express` and `cors` packages (44 packages removed)
- Replaced weak `evt: { type: string; [key: string]: unknown }` SSE type with a `SseEvent` discriminated union
- Replaced `{ ok: boolean; error?: string }` cast in `ContactForm` with canonical `ActionResult` type
- Hero video changed from `preload="auto"` to `preload="metadata"` — reduces initial bandwidth on mobile

### Documentation
- Added `docs/DEPLOYMENT.md` with full Vercel deployment checklist
- Added `docs/DATABASE.md` with migration instructions
- Updated `.env.example` with `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `WP_REST_ENDPOINT`
- Bumped version to `1.0.0`
