# Configuration Variables

> Agents never read real environment files (roadmap rule R4). This document and the example file at the repo root (`.env.example`) are the contract. The owner fills `.env.local` (local) and Vercel project settings (preview/production) before the phase that needs each value.

All variables are declared in the env schema module (`lib/env.ts`) from P0. Variables not needed by the current phase are optional; a missing value disables the related feature instead of crashing the app.

| Variable                   | Scope  | Needed from | Default when missing           | Owner action                                                          |
| -------------------------- | ------ | ----------- | ------------------------------ | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | public | P1          | `http://localhost:3000`        | Set preview URL in Vercel; production domain at P9                    |
| `RESEND_API_KEY`           | server | P3          | — (contact form disabled)      | Create Resend account, API key                                        |
| `LEADS_TO_EMAIL`           | server | P3          | — (contact form disabled)      | Inbox that receives leads                                             |
| `LEADS_FROM_EMAIL`         | server | P3          | `onboarding@resend.dev`        | Verified sender; switch to own domain at P9                           |
| `UPSTASH_REDIS_REST_URL`   | server | P3          | — (rate limit off in dev only) | Create Upstash Redis database                                         |
| `UPSTASH_REDIS_REST_TOKEN` | server | P3          | —                              | Same database                                                         |
| `NEXT_PUBLIC_GA_ID`        | public | P6          | — (analytics off)              | GA4 measurement ID (`G-XXXXXXX`); set for Production and Preview      |
| `GEMINI_API_KEY`           | server | P8          | — (Gemini skipped)             | AI Studio key; billing-enabled project + budget alert for Production  |
| `GEMINI_MODEL`             | server | P8          | `gemini-3.1-flash-lite`        | Cheapest for new keys; move to `gemini-3.5-flash-lite` before 2027-05 |
| `ANTHROPIC_API_KEY`        | server | P8          | — (no fallback)                | Optional fallback: Anthropic Console key + spend cap                  |
| `ANTHROPIC_MODEL`          | server | P8          | `claude-haiku-5-5`             | Cheapest current Claude                                               |
| `AI_ENABLED`               | server | P8          | `false`                        | Set `true` to enable rationale                                        |

## Rules

- `NEXT_PUBLIC_*` values are bundled into the browser. Never put a secret in them.
- Server values are only read through the `@/lib/env` module in server code.
- Adding or renaming a variable requires updating the schema module, the example file, and this table in the same commit.
- In production (`VERCEL_ENV=production`), a phase may promote its variables to required once that phase is DONE.
- Since P9a, Vercel production builds stop before `next build` when any of these is missing: `NEXT_PUBLIC_SITE_URL` (https), `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_GA_ID`; with `AI_ENABLED=true`, also one of `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` (`scripts/check-production-config.mjs`, names only in the log). Local, CI and preview builds are not checked.
- While `NEXT_PUBLIC_SITE_URL` is a `*.vercel.app` address the site answers `noindex` (robots.txt and meta). Set it to the `.com` address to open the site to search engines.
- The quiz rationale (P8) runs only with `AI_ENABLED=true` and at least one of `GEMINI_API_KEY` / `ANTHROPIC_API_KEY`. Gemini is tried first; Anthropic takes over when the Gemini key is missing or Gemini fails. The Gemini free tier may use requests to improve Google products: fine for local and preview testing (quiz inputs carry no personal data), but use a paid-tier key for Production.
- `NEXT_PUBLIC_GA_ID` only takes effect after the visitor accepts analytics cookies, and only on production deployments (`VERCEL_ENV=production`). To check events on a preview or locally, open any page with `?ga_debug=1`, accept, and watch GA4 → Admin → DebugView.
