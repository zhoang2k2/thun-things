# Configuration Variables

> Agents never read real environment files (roadmap rule R4). This document and the example file at the repo root (`.env.example`) are the contract. The owner fills `.env.local` (local) and Vercel project settings (preview/production) before the phase that needs each value.

All variables are declared in the env schema module (`lib/env.ts`) from P0. Variables not needed by the current phase are optional; a missing value disables the related feature instead of crashing the app.

| Variable                   | Scope  | Needed from | Default when missing           | Owner action                                       |
| -------------------------- | ------ | ----------- | ------------------------------ | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | public | P1          | `http://localhost:3000`        | Set preview URL in Vercel; production domain at P9 |
| `RESEND_API_KEY`           | server | P3          | — (contact form disabled)      | Create Resend account, API key                     |
| `LEADS_TO_EMAIL`           | server | P3          | — (contact form disabled)      | Inbox that receives leads                          |
| `LEADS_FROM_EMAIL`         | server | P3          | `onboarding@resend.dev`        | Verified sender; switch to own domain at P9        |
| `UPSTASH_REDIS_REST_URL`   | server | P3          | — (rate limit off in dev only) | Create Upstash Redis database                      |
| `UPSTASH_REDIS_REST_TOKEN` | server | P3          | —                              | Same database                                      |
| `NEXT_PUBLIC_GA_ID`        | public | P6          | — (analytics off)              | GA4 measurement ID (`G-XXXXXXX`)                   |
| `ANTHROPIC_API_KEY`        | server | P8          | — (AI off)                     | Anthropic Console key + spend cap                  |
| `ANTHROPIC_MODEL`          | server | P8          | `claude-haiku-5-5` [PROPOSED]  | Confirm model                                      |
| `AI_ENABLED`               | server | P8          | `false`                        | Set `true` to enable rationale                     |

## Rules

- `NEXT_PUBLIC_*` values are bundled into the browser. Never put a secret in them.
- Server values are only read through the `@/lib/env` module in server code.
- Adding or renaming a variable requires updating the schema module, the example file, and this table in the same commit.
- In production (`VERCEL_ENV=production`), a phase may promote its variables to required once that phase is DONE.
