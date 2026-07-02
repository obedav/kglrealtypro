# KGL Realty Pro

Production website for **KGL Realty Pro** — a licensed luxury real estate brokerage operating across Nigeria (Lagos, Abuja), Dubai, and the United Kingdom.

Live at [kglrealtypro.com](https://kglrealtypro.com). Built to 2026 standards: Next.js 15 App Router, React 19, TypeScript strict mode, Tailwind CSS v3.4, gold × navy luxury design system. No WordPress, no Elementor.

**Principles:** SOLID, DRY, KISS. Each file has one reason to change. Shared validation, shared sinks, shared layout components. No speculative abstraction.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15.1.6 (App Router), React 19, TypeScript (strict), Tailwind CSS 3.4 |
| Data | MySQL 8 on Namecheap cPanel, reached via `mysql2` |
| Editorial CMS | Plain PHP 8 on cPanel (`php-admin/`) — sessions + CSRF + PDO |
| AI concierge | Claude Haiku 4.5 (default), Sonnet 4.6 (escalated) — `@anthropic-ai/sdk` |
| Validation | Zod (runtime boundary) |
| Email | Resend |
| CDN / WAF / bot | Cloudflare + Turnstile |
| Host | Vercel (frontend) + Namecheap cPanel (MySQL + PHP admin) |

Five external services: Namecheap, Vercel, Cloudflare, Anthropic, Resend.

---

## Local setup

```bash
cp .env.example .env.local
# Fill MYSQL_* and ANTHROPIC_API_KEY at minimum.
# If MYSQL_* is omitted, dev mode serves STUB data so the UI still renders.
npm install
npm run dev
```

Open http://localhost:3000.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |

`scripts/smoke-test.ts` hits every public route against a given base URL and reports status + latency — see `scripts/README.md`.

---

## Environment variables

```env
# MySQL database
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
MYSQL_SSL=            # set to "true" on managed hosts with SSL endpoints

# Anthropic (for the concierge AI)
ANTHROPIC_API_KEY=

# Public site URL (used for OpenGraph and JSON-LD)
NEXT_PUBLIC_SITE_URL=https://kglrealtypro.com

# WhatsApp duty-agent number (international format, no +)
WHATSAPP_DUTY_AGENT_NUMBER=2348000000000

# Currency conversion rates (falls back to 1:1 if not set)
NEXT_PUBLIC_USD_TO_NGN=
NEXT_PUBLIC_GBP_TO_NGN=
NEXT_PUBLIC_AED_TO_NGN=

# Email notifications
RESEND_API_KEY=
RESEND_FROM=notifications@kglrealtypro.com
RESEND_DUTY_EMAIL=leads@kglrealtypro.com

# Bot protection
TURNSTILE_SECRET_KEY=   # optional; Turnstile verification is skipped if absent
```

---

## Project layout

```
src/
├── app/                       Next.js App Router pages
│   ├── page.tsx               Home (dark hero, featured listings, portfolio, FAQ, CTA)
│   ├── properties/            Index (faceted search + pagination) + [slug] detail
│   ├── agents/                Directory grid + [slug] profile
│   ├── blog/                  Insights index + [slug] article
│   ├── about/                 Story, values, team preview
│   ├── contact/               Contact form + map
│   ├── new-developments/      Off-plan & pre-completion listings
│   ├── investment/            Investment programs index
│   │   ├── cashback/          Real Estate Cashback program
│   │   └── land-vest/         Land Vest fractional program
│   ├── buyers-and-sellers-guide/  Guide index
│   ├── buyers-guide/          Buyer's guide (WP-driven)
│   ├── sellers-guide/         Seller's guide (WP-driven)
│   ├── short-stay/            Short-stay rentals (WP-driven)
│   ├── partners/              Partner network (WP-driven)
│   ├── privacy/               Privacy policy (WP-driven)
│   ├── terms/                 Terms & conditions (WP-driven)
│   └── api/
│       ├── chat/              Concierge SSE stream
│       └── concierge-actions/ request_tour / capture_lead / handoff_to_agent
│
├── components/
│   ├── ui/                    shadcn/ui primitives (Button, Card, Input)
│   ├── Header.tsx             Sticky header with transparent → solid scroll transition
│   ├── Footer.tsx             Dark navy footer with CTA band + back-to-top
│   ├── PageHero.tsx           Dark navy section header (reused on all secondary pages)
│   ├── HeroSearch.tsx         Home page diagonal split-screen hero with video
│   ├── PropertyCard.tsx       Full-bleed listing card with hover overlay
│   ├── PropertyGallery.tsx    Image gallery with lightbox
│   ├── PriceDisplay.tsx       Multi-currency price formatting
│   ├── WhatsAppFab.tsx        Floating WhatsApp CTA button
│   ├── ConciergeChat.tsx      Floating AI chat widget
│   ├── ContactForm.tsx        Lead capture form
│   ├── Reveal.tsx             Intersection-observer scroll-in animation
│   ├── WpContentPage.tsx      Shared layout for WordPress-driven content pages
│   └── search/
│       └── SearchFilters.tsx  URL-state faceted filter sidebar
│
├── lib/
│   ├── anthropic.ts           System prompt, tool definitions, chat route handler
│   ├── db.ts                  MySQL pool + query helpers (mysql2)
│   ├── data.ts                All public-site reads (listings, agents, blog posts)
│   ├── sinks/                 email, db-lead, whatsapp notification sinks
│   ├── validation.ts          Zod schemas (one per concierge tool)
│   ├── concierge-actions.ts   Shared action parser + response envelope
│   ├── sanitize.ts            HTML sanitiser for user/WP content
│   ├── fx.ts                  Currency conversion helpers
│   ├── use-favourite.ts       Client-side favourites (localStorage)
│   └── utils.ts               cn() and misc helpers
│
└── types/
    └── index.ts               Listing, Agent, BlogPost, Lead, TourRequest, HandoffRequest

db/
└── schema.sql                 Full MySQL schema

php-admin/                     Editorial CMS on Namecheap cPanel
├── index.php                  Listings table
├── listing-edit.php           Create / edit listing
├── listing-image-add.php      Attach image URL to listing
├── listing-image-delete.php   Remove image
├── posts.php                  Blog posts table
├── post-edit.php              Create / edit blog post
├── leads.php, tours.php, handoffs.php   Concierge-captured enquiries
├── login.php, logout.php      Session auth
├── includes/
│   ├── db.php                 PDO connection
│   ├── auth.php               Session + CSRF helpers
│   └── layout.php             Shared admin chrome
├── bin/seed-admin.php         CLI: create the first admin user
├── deploy/.htaccess.sample    HSTS, noindex, block includes/
└── deploy/.env.sample         DB creds template

scripts/
└── smoke-test.ts              Hits every public route, reports status + latency
```

---

## Design system

### Colors

| CSS variable | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `hsl(43 89% 38%)` dark gold | `hsl(43 90% 58%)` bright gold | Brand accent, CTAs, icons |
| `--accent` | `hsl(220 70% 14%)` navy | same | Page heroes, footer, dark sections |
| `--background` | white | near-black | Page background |
| `--secondary` | `hsl(43 25% 96%)` warm cream | — | Subtle backgrounds |

All variables are in `src/app/globals.css`.

### Typography

- **Headings:** `font-serif` = Playfair Display
- **Body / UI:** system sans-serif via Tailwind default

### Key UI patterns

```
Portrait card:     overflow-hidden rounded-2xl border
                   + h-1 bg-gradient-to-r from-primary  ← gold accent bar
                   + aspect-[3/3.5] photo

Page hero:         bg-accent (navy) + dot-grid texture
                   + radial gold glow + white text

Section header:    h-px w-8 bg-primary  ← line
                   + small uppercase gold label
                   + font-serif heading

Hover reveal:      grid-rows-[0fr] opacity-0
                   → group-hover:grid-rows-[1fr] opacity-100
```

---

## Data flow

- **Reads** (home, listings, blog, agents) go Next.js → `mysql2` pool → MySQL on cPanel. Domain queries live in `src/lib/data.ts`.
- **Concierge writes** (`lead`, `tour_request`, `handoff_request`) go through Zod validation → `src/lib/sinks/db-lead.ts` → MySQL. Email via Resend is fire-and-forget.
- **Editorial writes** (listings, images, blog posts, lead status) come from the PHP admin on cPanel → MySQL.

---

## How the concierge works

`src/app/api/chat/route.ts` wraps `chatRouteHandler` in `src/lib/anthropic.ts`. The handler:

1. Verifies Cloudflare Turnstile (if `TURNSTILE_SECRET_KEY` is set)
2. Picks `claude-haiku-4-5` by default, `claude-sonnet-4-6` when the client flags `escalated: true`
3. Builds the prompt with two `cache_control` breakpoints — frozen system prompt + per-listing context block
4. Streams Anthropic events as SSE to the browser
5. Emits `tool_use` calls for `request_tour`, `capture_lead`, `handoff_to_agent`

When Claude emits a tool call, the client fires a fire-and-forget `POST` to `/api/concierge-actions/{tool_name}`. Those handlers validate with Zod, write to MySQL (system of record), and notify the duty agent via Resend with a `wa.me` deep-link.

If Resend fails, the row is still in MySQL. If MySQL fails, the route returns 502 and the UI falls back to a WhatsApp link.

---

## Deploy

### Vercel (frontend)

1. Push to GitHub.
2. Import into Vercel; add all env vars from `.env.example`.
3. Add Vercel's outbound IP ranges to cPanel → Remote MySQL (or use a managed MySQL host with SSL and set `MYSQL_SSL=true`).
4. Deploy — preview URLs per PR.

### cPanel (MySQL + PHP admin)

1. cPanel → MySQL Databases: create DB + user + grant `ALL PRIVILEGES`.
2. `mysql -h HOST -u USER -p DB < db/schema.sql`
3. cPanel → Subdomains: point `admin.kglrealtypro.com` at the `php-admin/` directory (above `public_html`).
4. Copy `deploy/.env.sample` → `.env` (chmod 600), fill creds.
5. Copy `deploy/.htaccess.sample` → `.htaccess`.
6. `php bin/seed-admin.php <user> <password> "<Full Name>"`
7. cPanel → AutoSSL + "Force HTTPS Redirect".

---

## License

Proprietary — KGL Realty Pro. All rights reserved.
