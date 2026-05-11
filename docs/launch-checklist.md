# Launch Checklist — KGL Realty Pro Refurb

Run this front-to-back for cutover from the compromised site to the new build.
Each section has a defined done-state. Tick items off as you go.

---

## Phase 0 — Contain the damage on the live site (today, 1 hour)

- [ ] Full cPanel backup of the current site saved outside the hosting account
- [ ] Database dump (via phpMyAdmin) saved alongside the backup
- [ ] `home-wp-comments-post.php` deleted from `Kglrealtypro.com/public_html/`
- [ ] `.tmp/` directory contents downloaded for forensics, then deleted
- [ ] `wp-admin.zip` (268 MB) deleted from `Kglrealtypro.com/public_html/`
- [ ] Orphan `/wp-admin/`, `/wp-content/`, `/wp-includes/` at `/home/houseyty/` zipped + deleted
- [ ] `robots.txt` replaced with a clean 10-line version
- [ ] Raw access logs checked for `home-wp-comments-post` hits (date of first hit, total count, source IP spread recorded)

Done when: Google's cached preview of kglrealtypro.com no longer shows casino text (may take 24-48h).

---

## Phase 1 — Provision the new CMS hosting (SysKay, 1 day)

- [ ] SysKay plan purchased — renewal price confirmed with client
- [ ] Account credentials stored in a shared password manager (1Password / Bitwarden shared vault)
- [ ] 2FA enabled on the SysKay account
- [ ] Subdomain `cms.kglrealtypro.com` created in the SysKay cPanel
- [ ] Let's Encrypt SSL auto-issued for `cms.kglrealtypro.com`

Done when: `https://cms.kglrealtypro.com/` returns a placeholder page with a valid cert.

---

## Phase 2 — Install and harden WordPress on SysKay (2 hours)

Follow `wp/README.md` exactly.

- [ ] WordPress installed via Softaculous (admin user is NOT `admin`, DB prefix is NOT `wp_`)
- [ ] WP core updated to latest
- [ ] WPGraphQL, WPGraphQL for ACF, ACF Pro, Wordfence, LiteSpeed Cache installed
- [ ] All four mu-plugins uploaded to `wp-content/mu-plugins/`:
  - [ ] `kgl-security.php`
  - [ ] `kgl-leads.php`
  - [ ] `kgl-listings.php`
  - [ ] `kgl-agents.php`
- [ ] Settings → Permalinks → Save (flushes rewrite rules; confirms CPTs work)
- [ ] `nextjs-lead-writer` user created (Contributor role) with an Application Password
- [ ] Verified via WPGraphQL IDE: `listings`, `agents`, `posts`, `leads` all return schema without errors
- [ ] Cloudflare in front of `cms.kglrealtypro.com` (proxied, WAF WordPress ruleset on, admin IP-allowlisted)

Done when: wp-admin → GraphQL IDE runs the smoke-test query in `wp/README.md` successfully.

---

## Phase 3 — Run the content migration (2-4 hours)

- [ ] `scripts/.env.local` populated with both source and destination creds
- [ ] Dry-run: `cd scripts && npm install && npm run migrate` (DRY_RUN defaults to 1)
- [ ] Review the dry-run log for "cleaned N spam blocks" lines — spot-check 3-5 items
- [ ] Live run: `DRY_RUN=0 npm run migrate`
- [ ] In wp-admin, spot-check: 5 imported listings, 2 agents, 3 blog posts
- [ ] For each spot-check, confirm the spam has been stripped (no French text, no `-35255px` divs)
- [ ] Elementor-built pages (home, about) — manually rebuild in Next.js since Elementor serialized data doesn't migrate cleanly (see `docs/architecture.md`)
- [ ] Estatik listings — if the standard `/listing` endpoint didn't expose them, run a supplementary script against Estatik's own API

Done when: every listing has correct price, gallery, status, and cleaned description on the new CMS.

---

## Phase 4 — Deploy the frontend to Vercel (1 hour)

- [ ] GitHub repo pushed (push the whole monorepo)
- [ ] Vercel project created → imported from GitHub
- [ ] Vercel env vars set (all from `.env.example`):
  - [ ] `WP_GRAPHQL_ENDPOINT=https://cms.kglrealtypro.com/graphql`
  - [ ] `WP_REST_ENDPOINT=https://cms.kglrealtypro.com/wp-json`
  - [ ] `WP_LEAD_WRITER_USER`
  - [ ] `WP_LEAD_WRITER_APP_PASSWORD`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `RESEND_API_KEY`
  - [ ] `LEAD_NOTIFY_EMAIL`
  - [ ] `WHATSAPP_DUTY_AGENT_NUMBER`
  - [ ] `NEXT_PUBLIC_SITE_URL=https://kglrealtypro.com`
  - [ ] Turnstile keys (optional for Phase 1)
- [ ] First deploy succeeds (Build logs clean, no env errors)
- [ ] Preview URL (`kglrealtypro-xxxx.vercel.app`) renders with real CMS content
- [ ] Concierge chat works end-to-end: ask about a listing → see streaming response → test a tool call (request_tour) → confirm WP post created + Resend email fired

Done when: preview URL passes Lighthouse mobile Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 95.

---

## Phase 5 — DNS cutover (the live moment, ~30 min)

**Prep:**
- [ ] TTL on old `kglrealtypro.com` DNS records reduced to 5 minutes (do this 24h before cutover so it's propagated)
- [ ] Launch-day announcement drafted — client knows exact date/time

**Cutover:**
- [ ] `kglrealtypro.com` A record pointed at Vercel
- [ ] `www.kglrealtypro.com` CNAME → `cname.vercel-dns.com`
- [ ] `cms.kglrealtypro.com` A record pointed at SysKay (orange-cloud on Cloudflare)
- [ ] Verified from multiple locations via https://www.whatsmydns.net/ that new records have propagated
- [ ] HTTPS working on both `kglrealtypro.com` and `cms.kglrealtypro.com`
- [ ] All old URLs 301-redirect to new equivalents (check 10 random deep links)

**Verify:**
- [ ] Home page loads in < 2s on mobile
- [ ] At least 3 property detail pages load with JSON-LD `RealEstateListing` schema present
- [ ] Concierge chat opens and responds
- [ ] Contact form submission → lead appears in wp-admin → email received
- [ ] `curl https://kglrealtypro.com/robots.txt` returns the clean minimal file
- [ ] `curl https://kglrealtypro.com/sitemap.xml` returns valid XML with all listing URLs

Done when: 10 random visitors can browse, contact, and interact without errors.

---

## Phase 6 — Post-launch (first 72h)

- [ ] Google Search Console: remove old property, add new property, submit fresh sitemap
- [ ] If the site was flagged for malware: **Security & Manual Actions → Request Review**
- [ ] Old hosting account: put into read-only maintenance mode, keep as fallback for 14 days
- [ ] Monitor Vercel analytics + logs for the first 48 hours
- [ ] Check Cloudflare → Security dashboard for blocked bot traffic (validates WAF)

---

## Phase 7 — Handoff (week 2)

- [ ] Screen-recorded walkthrough (≤ 90 min total, broken into 4–5 videos):
  - [ ] How to add / edit a listing
  - [ ] How to add a new agent
  - [ ] How to publish a blog post
  - [ ] How to view leads and tour requests
  - [ ] How to update plugins safely
  - [ ] How to read Vercel deploy logs
- [ ] Written runbook (`docs/runbook.md`) updated with SysKay-specific login URLs
- [ ] Shared password vault handed over with all admin credentials
- [ ] Client trained on 2FA setup (personally, not over email)
- [ ] 30-day support window explicitly communicated with end date

Done when: client can add a listing, review a lead, and roll back a deploy without you.

---

## Phase 8 — Old hosting account decommission (week 4)

Only after 14 days of new site running cleanly with no issues:

- [ ] Final forensic archive of the old hosting account (full tarball + DB dump) saved offsite
- [ ] Domain nameservers confirmed pointing away from old hosting
- [ ] No email dependent on old hosting (or MX records already migrated)
- [ ] Client gives explicit "OK to cancel" for the old hosting plan
- [ ] Old hosting plan cancelled (or downgraded to a dormant tier if client wants to keep it for a while longer)

---

## Emergency rollback plan

At any phase, if the new build has a critical issue:

1. Revert the `kglrealtypro.com` DNS A record to the old hosting IP (TTL is 5 min, so it propagates fast)
2. The old site is still running; visitors see the old site again
3. Investigate on the new build without customer-facing impact
4. Re-cut DNS when fixed

This is why the old hosting stays live for at least 2 weeks post-cutover.
