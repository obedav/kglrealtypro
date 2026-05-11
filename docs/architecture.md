# Architecture

Single-app rebuild of **kglrealtypro.com** — luxury real-estate frontend on Next.js 15,
headless WordPress on Namecheap, AI concierge via Claude. Everything persists in
WordPress or vendor APIs; no separate application database.

## Scope (confirmed)

Only `kglrealtypro.com`. `housesforsale.com.ng` is **not** in scope — no placeholder
code, no speculative multi-tenant architecture. If scope expands later, extract shared
code into workspace packages at that point.

## Principles

- **SOLID** — each file has one reason to change (sinks, validation, routes, UI).
- **DRY** — shared validation schemas, shared sinks, shared Header/Footer/ContactForm.
- **KISS** — flat functions over class hierarchies, plain npm, no workspace
  ceremony, no dependency-injection frameworks, no ORMs.

## Vendor list (after handoff)

Five external services. That's the whole list.

| Vendor | Role | Why chosen |
|---|---|---|
| Namecheap | Domain + DNS + WordPress hosting | Client already pays; cPanel + Softaculous for the CMS |
| Vercel | Next.js frontend | Zero-config Next 15, preview URLs, global edge |
| Cloudflare | WAF, CDN, Turnstile, IP allowlist for CMS | Free tier covers everything at this traffic |
| Anthropic | AI concierge | Haiku 4.5 default, Sonnet 4.6 on escalation |
| Resend | Transactional email | Cheapest reliable SMTP alternative |

No Supabase, no separate database, no external CRM. Leads live in WordPress as
custom post types — editors see them in the same admin panel they use for listings.

## Stack at a glance

```
         User
          ↓ HTTPS
  ┌───────────────────────────────────────────────────────┐
  │           Cloudflare (WAF, CDN, Turnstile)            │
  └────────────────────────┬──────────────────────────────┘
                           ↓
  ┌───────────────────────────────────────────────────────┐
  │        Vercel — Next.js 15 App Router                 │
  │                                                       │
  │   ┌─────────────┐   ┌───────────────┐   ┌──────────┐  │
  │   │  App pages  │   │ /api/chat     │   │ /api/    │  │
  │   │  (RSC)      │   │ (concierge    │   │ concierge│  │
  │   │             │   │  SSE stream)  │   │ -actions │  │
  │   └─────┬───────┘   └───────┬───────┘   └─────┬────┘  │
  │         │                   │                 │       │
  └─────────┼───────────────────┼─────────────────┼───────┘
            │                   │                 │
            │ GraphQL           │ REST+Basic      │ REST+Basic
            │ (read)            │ (Claude API)    │ (WP write)
            ↓                   ↓                 ↓
   ┌──────────────────┐   ┌─────────────┐   ┌──────────────┐
   │ cms.kglrealtypro │   │ Anthropic   │   │ cms.kglrealty│
   │    .com          │◀──┤ api.anthr…  │   │    pro.com   │
   │ (WordPress)      │   └─────────────┘   │   (WP REST)  │
   │                  │                     │              │
   │  • listings      │                     │   writes:    │
   │  • agents        │                     │   • lead     │
   │  • posts         │                     │   • tour_req │
   │  • pages         │                     │   • handoff  │
   │  • leads/*       │                     └──────────────┘
   └──────────────────┘
```

## Directory layout

```
kglrealtypro/
├── src/
│   ├── app/
│   │   ├── layout.tsx               Root layout, metadata
│   │   ├── globals.css              Tailwind + brand tokens
│   │   ├── page.tsx                 Home
│   │   ├── properties/
│   │   │   ├── page.tsx             Listings index with faceted search
│   │   │   └── [slug]/page.tsx      Listing detail + RealEstateListing JSON-LD
│   │   ├── agents/
│   │   │   ├── page.tsx             Agent directory
│   │   │   └── [slug]/page.tsx      Agent detail
│   │   ├── blog/
│   │   │   ├── page.tsx             Blog index
│   │   │   └── [slug]/page.tsx      Post detail + Article JSON-LD
│   │   ├── about/page.tsx           WP-driven static page
│   │   ├── contact/page.tsx         Contact form (reuses capture_lead)
│   │   └── api/
│   │       ├── chat/route.ts        Concierge SSE endpoint (thin wrapper)
│   │       └── concierge-actions/
│   │           ├── request_tour/route.ts
│   │           ├── capture_lead/route.ts
│   │           └── handoff_to_agent/route.ts
│   │
│   ├── components/
│   │   ├── ui/ (Button, Card, Input)
│   │   ├── Header.tsx               Shared nav — used on every page
│   │   ├── Footer.tsx               Shared footer
│   │   ├── PropertyCard.tsx
│   │   ├── ConciergeChat.tsx        Floating chat widget (client)
│   │   ├── ContactForm.tsx          Client form → capture_lead
│   │   └── search/
│   │       └── SearchFilters.tsx    URL-state-driven faceted filters
│   │
│   ├── lib/
│   │   ├── anthropic.ts             System prompt, tools, chat route handler
│   │   ├── wp.ts                    WPGraphQL queries: listings, agents, blog, pages, facets
│   │   ├── validation.ts            Zod schemas for the 3 concierge tools
│   │   ├── concierge-actions.ts     Shared request parser + response envelope
│   │   ├── sinks/
│   │   │   ├── email.ts             Resend wrapper + notifyDutyAgent
│   │   │   ├── wp-lead.ts           WP REST writer for lead CPTs
│   │   │   └── whatsapp.ts          wa.me deep-link generator
│   │   ├── fx.ts                    NGN/USD/GBP/AED formatter
│   │   └── utils.ts                 cn()
│   │
│   └── types/
│       └── index.ts                 Listing, Agent, BlogPost, Lead, TourRequest, HandoffRequest
│
├── scripts/
│   ├── migrate-wp.ts                One-off WP → WP migration with spam cleaning
│   ├── package.json
│   └── README.md
│
├── wp/
│   ├── mu-plugins/
│   │   ├── kgl-security.php         WP hardening (disable file edit, audit log, rate limit)
│   │   └── kgl-leads.php            lead / tour_request / handoff_request CPTs
│   └── README.md
│
├── docs/
│   ├── scope.md                     Client-facing scope doc
│   ├── architecture.md              This file
│   └── runbook.md                   Ops runbook
│
├── next.config.ts                   Security headers + image remotePatterns
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Data persistence model

Everything persists in one of three places. No fourth.

| Data | Lives in | Accessed by |
|---|---|---|
| Listings, agents, blog posts, static pages | WordPress (MySQL) | Next.js SSR via WPGraphQL |
| Leads, tour requests, handoff requests | WordPress (MySQL) as custom post types | Next.js writes via WP REST + Application Password; editors view in WP admin |
| Transient concierge chat history | Browser memory only | Client component state; discarded on page refresh. Re-summarized from prior turns is out of scope. |

No separate application DB. No Supabase. No Airtable. This is the KISS answer — the
client already uses WP admin every day; leads go there too.

## Data flow — listing render

```
[Visitor]
   ↓
[Vercel edge] ─── static/ISR, 5-min revalidate ───▶ cache hit → served
   ↓ (miss)
[Next.js Server Component]
   ↓ getListingBySlug(slug)  → single GraphQL query
[cms.kglrealtypro.com / WPGraphQL]
   ↓
[MySQL]
   ↑ mapListing → Listing type
[Server Component renders → Vercel caches for next 5 min]
```

## Data flow — concierge turn

```
[Visitor types in ConciergeChat widget]
   ↓ POST /api/chat { messages, listing, escalated }
[src/app/api/chat/route.ts → chatRouteHandler in src/lib/anthropic.ts]
   ↓ Turnstile verify (if enabled)
   ↓ select model: Haiku 4.5 (default) | Sonnet 4.6 (escalated)
   ↓ build system = [
       frozen system prompt   with cache_control,
       <current_listing> block with cache_control
     ]
   ↓ anthropic.messages.stream(...)
[Anthropic SSE events]
   ↓ forward text_delta + tool_use events → browser
   ↓ if final message has tool_uses:
     POST /api/concierge-actions/{tool_name}  (fire-and-forget from client)
```

## Data flow — concierge tool-call

```
[ConciergeChat → POST /api/concierge-actions/request_tour] (or capture_lead / handoff_to_agent)
   ↓
[route.ts]
   ├── parseBody(req, Zod schema)        validation boundary — rejects invalid shapes
   ├── saveLeadToWp(kind, title, meta)   persists to WP — primary source of truth
   │     ↓ POST https://cms.../wp-json/wp/v2/{lead|tour_request|handoff_request}
   │       Authorization: Basic <base64(writer-user:app-password)>
   │
   └── safeNotify(notifyDutyAgent)       non-blocking side effect
         ↓ Resend → duty-agent mailbox
         ↓ includes wa.me deep-link so agent can reply from their phone
   ↓
[Response: { ok: true, id: <wp post id> }]
```

If Resend is down, the lead still lives in WP. If WP is down, the route returns a
502 with a message directing the user to WhatsApp — nothing is lost silently.

## Security boundary

Post-incident hardening:

| Layer | What it does |
|---|---|
| Cloudflare | WAF rules against WP attack patterns; IP allowlist for `cms.*` admin routes; Turnstile on forms + chat |
| Next.js security headers | CSP, HSTS, X-Frame-Options, Permissions-Policy (see `next.config.ts`) |
| `kgl-security.php` (mu-plugin) | `DISALLOW_FILE_EDIT`, XML-RPC off, REST user enumeration off, login rate limit, admin audit log |
| WP Application Password | Dedicated low-privilege user for lead writes; revocable; scope-limited |
| Public surface | Public HTTPS terminates at Vercel. WP admin is unreachable except through Cloudflare with allowed IPs. |

## Performance targets

| Metric | Target | How |
|---|---|---|
| LCP | < 2.5s mobile | ISR + AVIF/WebP + hero priority hint |
| INP | < 200ms | RSC-first, client JS only for Concierge/SearchFilters/ContactForm |
| CLS | < 0.1 | Aspect-ratio containers on every `<Image>` |
| TTFB | < 400ms | Vercel edge cache hits |
| First concierge token | < 1s | Haiku 4.5 + prompt caching on the system prompt |

## Prompt caching

Two `cache_control` breakpoints per concierge request:

1. **Frozen system prompt** — cached across all requests indefinitely (5-min TTL
   refreshed by any concierge turn). Same prompt bytes = cache hit.
2. **Per-listing context block** — cached across all turns on the same listing, for
   the 5-minute TTL window.

Verify cache hits in production by reading `usage.cache_read_input_tokens` from the
`final` SSE event. If that's zero across repeated requests, a silent invalidator is
at work (common cause: date interpolated into the system prompt, or listing JSON
re-ordered).

## What's deliberately simple

Things you might expect but won't find:

- **No ORM.** WP is the database; we talk to it over REST (write) and GraphQL (read).
- **No DI container.** Sinks are plain exported functions.
- **No custom error types.** `{ ok: true, id }` / `{ ok: false, error }` throughout.
- **No state management library.** URL searchParams, React local state, and server
  components cover every case.
- **No workspace/monorepo tooling.** Flat `src/` — the next developer sees the whole
  app at a glance.

Each of these was considered and rejected as YAGNI for this scope.
