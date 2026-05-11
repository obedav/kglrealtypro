# scripts

One-off ops scripts. Not part of the Next.js bundle.

## `smoke-test.ts`

Hits every public route against a given base URL and reports status + latency.
Run it locally before every deploy and against the production URL after every
deploy as a fast regression check.

```bash
cd scripts
npm install   # once

# local dev
SMOKE_BASE_URL=http://localhost:3000 npm run smoke

# production
npm run smoke -- https://kglrealtypro.com
```

**Exit codes:**
- `0` — all checks passed
- `1` — one or more failed

Add to a Vercel post-deploy webhook or run manually after DNS cutover for
instant confidence that nothing's 500-ing.
