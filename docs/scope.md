# KGL Realty Pro — Site Rebuild Scope

*For: KGL Realty Pro leadership. From: [Your Name]. Date: 2026-04-21.*

Hey — putting this in writing so we're both aligned before I start building. Nothing formal. Think of it as the shared reference we can both point at if something feels off three weeks from now.

---

## What we're building

A full rebuild of **kglrealtypro.com** — replacing the compromised WordPress site with a modern, secure, mobile-first platform built for how luxury buyers actually shop in 2026 and beyond.

**Architecture:** WordPress stays as the content system you and the team already know (agents keep editing listings exactly as they do today), but it sits on a private, locked-down server. The public site is a fast, modern frontend (Next.js) that pulls from WordPress invisibly. The combined effect: you keep your familiar admin panel, visitors get a much faster and more polished experience, and the attack surface that caused the spam injection is gone.

---

## What's in v1 (what I'm building for you)

- **Homepage** — brand-led editorial design, featured listings, testimonials, call-to-action
- **Property search & listings** — faceted filters (price, beds, type, city, amenities), map view, sort, save-for-later
- **Property detail pages** — full gallery, floor plan, 360° tour slot, agent contact, WhatsApp button, similar listings
- **Agent profiles** — individual pages for each KGL agent with direct contact
- **Blog / insights** — articles, categories, author pages
- **Contact & about pages**
- **Buyer accounts** — save listings, save searches, get email alerts on new matches
- **AI Concierge** — intelligent chatbot on every page that answers listing questions, qualifies leads, and routes complex inquiries to a human agent (Claude-powered)
- **Multi-currency display** — NGN / USD / GBP / AED toggle
- **Full 500-listing migration** from current site (with cleaned media)
- **SEO** — structured data, XML sitemap, Search Console re-submission, 301 redirect map to preserve rankings
- **Security hardening** — WAF, bot protection, 2FA on all admin accounts, managed backups
- **NDPR compliance** — cookie consent, privacy policy, data-deletion flow
- **Performance** — Core Web Vitals tuned for mobile (LCP <2.5s target)
- **Accessibility** — WCAG 2.2 AA baseline
- **Admin training** — 60-minute recorded walkthrough + written runbook

## What's NOT in v1 — explicitly

These are real and valuable, but out of scope for this build. Happy to add any of them in a Phase 2 when the foundation is proven:

- Online payment / transactional checkout
- IDX / MLS data feeds (not common in Nigeria; Dubai-specific IDX is Phase 2)
- Custom admin analytics dashboard (you'll use GA4 + PostHog until then)
- Virtual staging / AR previews
- Mobile apps (iOS/Android)
- Multi-language beyond English (French / Yoruba available in Phase 2)
- A/B testing platform
- CRM from scratch (we'll integrate with one you already use, or defer)

If something comes up mid-build that's not on the "in v1" list, we'll decide together: either swap it in (removing something else), or park it for Phase 2. No silent additions — they're what derails timelines.

---

## Timeline & cadence

- **Realistic delivery: ~14 weeks** at ~10–15 focused hours per week on my side.
- **Weekly check-in:** 20 minutes, same day every week. You'll see live progress on a staging link starting week 3.
- **No hard deadline** (per our conversation), so I'm prioritizing quality over speed.

---

## What I need from you

- **Brand assets** (logo files, fonts, photography rights confirmation) — before week 2
- **Agent bios + headshots** — before week 7
- **Privacy policy + terms of service copy** — before week 12 (can use a template to start)
- **Any specific listings that need special treatment** (featured, exclusive, off-market markers) — flagged as we go
- **Decision-maker availability** for weekly check-ins and design sign-off

Missing content is the #1 reason projects stall. I'll send a shared Google Drive link with a simple checklist.

---

## Post-launch support & handoff

- **30 days of free fixes after go-live** — bugs, small tweaks, questions, anything broken. No charge.
- **After day 30:** the site is fully yours. You'll have full admin access, the source code, all passwords, hosting logins, and a written runbook covering:
  - How to add/edit listings and agents
  - How to update WordPress safely
  - How to roll back a bad deploy
  - Who to call at each vendor (Vercel, Cloudflare, hosting)
  - How to run a backup
- If you want ongoing maintenance after day 30 (security updates, feature tweaks, occasional support), we'll talk about a simple monthly retainer separately. Zero pressure — the site will run fine unattended with the auto-updates in place.

---

## Budget

**₦500,000 total**, one-time. Covers all the work above and the 30-day post-launch support window.

Year-1 infrastructure costs (hosting, CDN, AI API usage, email) are estimated at **₦0–₦80,000 depending on traffic** — I'll set everything up on free tiers where possible and flag anything that needs paid upgrade before it hits.

---

## One ask on scope creep

Friends ask friends for "one more small thing" — it's natural. What I'd request: if something new comes up, let's talk about it on the weekly check-in rather than in an evening WhatsApp message. I'll always consider it, we'll decide together whether it fits v1 or becomes a Phase 2 item, and nothing gets lost.

The best projects between people who know each other end with the friendship intact *and* a working site. That's my goal.

---

## Sign-off

If this looks right, reply "confirmed" and I'll kick off week 1 (discovery + moodboard + WordPress lockdown). If anything feels off, say so now — cheaper to fix in a doc than in code.

Thanks for the trust on this one.

— [Your Name]
