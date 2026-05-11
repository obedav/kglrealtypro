# KGL Realty Pro — Runbook

Operational playbook for the people keeping the site running after handoff.

## Vendors & credentials

| Vendor | What it does | Where to log in |
|---|---|---|
| Namecheap | Domain + DNS + CMS host | namecheap.com |
| Vercel | Frontend hosting | vercel.com/dashboard |
| Cloudflare | CDN, WAF, bot protection | dash.cloudflare.com |
| WordPress | Content / listings | cms.kglrealtypro.com/wp-admin |
| Anthropic | Claude API (AI concierge) | console.anthropic.com |
| Supabase | Auth + buyer accounts | supabase.com/dashboard |
| Resend | Transactional email | resend.com |
| GitHub | Source code | github.com/kglrealtypro |

Credentials are in the shared 1Password vault "KGL Realty Pro".

## Adding or editing a property

1. Log into `cms.kglrealtypro.com/wp-admin`
2. Listings → Add New
3. Fill every field in the "Listing Details" meta box (price, city, beds, baths, sqm, etc.)
4. Upload the gallery — minimum 5 photos, landscape orientation preferred, 2000px wide or more
5. Set status (Available / Sold / Off-market)
6. Publish
7. The new listing appears on the public site within 5 minutes (ISR revalidation)

## Adding an agent

Users → Add New → role = Agent. Fill the profile fields (bio, photo, phone, WhatsApp).

## "The site looks stale"

Next.js revalidates listing pages every 5 minutes. To force immediate refresh:

1. Vercel dashboard → Deployments → latest → "Redeploy"
2. Or trigger from WordPress by editing and re-saving a listing

## "The site is slow"

1. Check Vercel status page: vercel-status.com
2. Check Cloudflare: cloudflarestatus.com
3. If WordPress admin is slow but public site is fast, it's the CMS host (EasyWP / Kinsta)
4. If both are slow, open a Vercel ticket and share the deploy URL

## Rolling back a bad deploy

Vercel → Project → Deployments → find the last known-good deploy → "Promote to Production".
Takes 30 seconds. Zero downtime.

## Rotating secrets

If a key may have leaked:

1. Anthropic API key: console.anthropic.com → Settings → API Keys → create new, delete old
2. WordPress admin passwords: wp-admin → Users → Edit → new password
3. WP salts: regenerate at https://api.wordpress.org/secret-key/1.1/salt/ and paste into `wp-config.php`
4. DB password: hosting panel → reset → update `wp-config.php`
5. After any rotation, update Vercel env vars and redeploy

## AI concierge usage

- Usage tracked at console.anthropic.com → Usage
- Default tier: ~$40–120/month at moderate traffic
- If costs spike: check for abuse (same IP, many requests). Turnstile should catch this — verify it's enabled in `.env`

## "The concierge is giving wrong answers"

Usually means listing data in WordPress is wrong or missing — fix the source. The system
prompt is in `src/lib/anthropic.ts`; only change it if you know why. Re-deploy after any
change.

## Weekly checklist

- [ ] Wordfence scan clean (Monday)
- [ ] Core Web Vitals still green (PageSpeed Insights on homepage + one listing)
- [ ] No new admin users appeared that you didn't create
- [ ] Anthropic usage tracking within expected range
- [ ] Backups running (managed host dashboard)

## Emergency: site is down or showing spam

1. **Don't panic, don't delete anything.**
2. Take a full backup snapshot first (host panel + DB dump)
3. Change the WordPress admin password and all hosting credentials
4. Contact the original developer with the snapshot ID and a timeline of what you noticed
5. Put Cloudflare in "Under Attack" mode via the dashboard → Security → Settings
