# Deployment Guide — KGL Realty Pro

## Prerequisites

- Node.js 20+ and npm
- A Vercel account (or equivalent Next.js host)
- MySQL 8 database accessible from the host (Namecheap cPanel)
- A Google account with Gmail 2FA enabled (for SMTP app password)
- An Anthropic API key

---

## Step 1 — Clone and Install

```bash
git clone <repo-url>
cd kglrealtypro
npm install
```

---

## Step 2 — Configure Environment Variables

Copy the example file and fill in every value:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Description |
|---|---|
| `MYSQL_HOST` | cPanel MySQL hostname (e.g. `srv1234.main-hosting.eu`) |
| `MYSQL_PORT` | Usually `3306` |
| `MYSQL_DATABASE` | Database name created in cPanel |
| `MYSQL_USER` | Database user created in cPanel |
| `MYSQL_PASSWORD` | Password for the DB user |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `GMAIL_USER` | Gmail address used to send notifications |
| `GMAIL_APP_PASSWORD` | Generated at Google Account → Security → App Passwords |
| `LEAD_NOTIFY_EMAIL` | Comma-separated addresses to receive lead/tour alerts |
| `WHATSAPP_DUTY_AGENT_NUMBER` | E.164 format, e.g. `+2347038141774` |
| `NEXT_PUBLIC_SITE_URL` | Production URL, e.g. `https://kglrealtypro.com` |

### Optional Variables

| Variable | Description |
|---|---|
| `DATA_API_URL` | PHP proxy base URL (alternative to direct MySQL) |
| `DATA_API_TOKEN` | Secret token for the PHP proxy |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (bot protection) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `WP_REST_ENDPOINT` | WordPress REST API base URL for content pages |
| `ANTHROPIC_MODEL_DEFAULT` | Override the default concierge model |
| `ANTHROPIC_MODEL_ESCALATED` | Override the escalated concierge model |

---

## Step 3 — Database Setup

See `docs/DATABASE.md` for full schema and migration instructions.

Quick summary:
1. Create the database and user in cPanel → MySQL Databases
2. Add Vercel's outbound IPs to cPanel → Remote MySQL (or use `%` wildcard)
3. Run `db/schema.sql` via phpMyAdmin or the cPanel terminal
4. Run `db/migrations.sql` and `db/migration-session2.sql` in order

---

## Step 4 — Vercel Deployment

### 4a — Connect Repository

1. Go to vercel.com → Add New Project
2. Import the Git repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `/` (default)

### 4b — Set Environment Variables

In Vercel project → Settings → Environment Variables, add **every** variable from Step 2.

> **Important:** Variables prefixed `NEXT_PUBLIC_` are embedded at build time. If you change them, trigger a redeploy.

### 4c — Deploy

```bash
git push origin main
```

Vercel will auto-deploy on push to `main`. First deploy takes ~2–3 minutes.

---

## Step 5 — Verify the Deployment

After deploying, check these endpoints:

| Check | URL | Expected |
|---|---|---|
| Health | `/api/health` | `{ "db": "ok", "anthropic": "ok" }` |
| Homepage | `/` | Hero video + featured listings load |
| Properties | `/properties` | Listing grid renders |
| Concierge | `/` → chat widget | Responds within 5 s |
| Lead email | Submit contact form | Admin receives HTML email |

---

## Step 6 — Cloudflare Turnstile (Optional but Recommended)

1. Sign up at dash.cloudflare.com → Turnstile
2. Create a widget, set domain to `kglrealtypro.com`
3. Copy Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Copy Secret Key → `TURNSTILE_SECRET_KEY`
5. Redeploy

Without Turnstile, the concierge is unprotected against bot traffic.

---

## Step 7 — Analytics (Optional)

1. Create a GA4 property at analytics.google.com
2. Copy the Measurement ID (`G-XXXXXXXXXX`)
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel
4. Redeploy

Events tracked: `lead_captured`, `tour_requested`, `agent_handoff`.

---

## Rollback

To roll back a broken deploy in Vercel:
1. Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → **Promote to Production**

---

## Local Development

```bash
cp .env.example .env.local
# Fill in at minimum: ANTHROPIC_API_KEY
# Leave MySQL blank to use stub/demo data
npm run dev
```

The app runs at `http://localhost:3000`. Without MySQL configured, stub listings and agents are served so the UI is fully functional for development.
