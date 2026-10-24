# P9a Launch Preparation — Design

**Date:** 2026-10-24
**Builds on:** P3 leads (Resend email sink, R-05), P4 SEO and CSP, P5 i18n, roadmap P9 ([`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md))
**Roadmap:** P9 is split into **P9a** (this design: code that needs nothing from the owner) and **P9b** (real content, photos, `.com` domain, go-live).

## Goal

Make the site ready to run publicly on `thun-things.vercel.app` until the `.com` domain exists: branded HTML lead emails, no search indexing on the temporary host, a production build that refuses missing configuration, a final CSP review and a launch checklist for the owner.

## Owner decisions [USER, 2026-10-24]

| ID   | Decision                                                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P9-1 | Temporary host `thun-things.vercel.app`; the future domain is a `.com` only.                                                                                            |
| P9-2 | Lead notifications keep going to the owner's current Gmail (`LEADS_TO_EMAIL`); the domain is only needed for the sending address.                                       |
| P9-3 | P9 is split: P9a now (one PR), P9b when photos, content and the domain are ready.                                                                                       |
| P9-4 | The customer confirmation email follows the page language (vi/en); the owner notification stays Vietnamese.                                                             |
| P9-5 | **No indexing until `.com`**: the temporary host answers `noindex`; indexing and the sitemap submission start on `.com`.                                                |
| P9-6 | Until a verified domain exists customers get **no confirmation email** (Resend's test sender only reaches the account owner); accepted. The success page promises none. |

## 1. HTML lead emails

- `lib/leads/emailHtml.ts` renders both emails as HTML strings (no new dependency): inline styles only, table layout for mail clients, system font stack, ink on white, 1px borders, square corners (DR-1), no gradients, emoji or images other than the product photo (DR-2). Max width 560px; readable on a phone.
- **Every interpolated value is HTML-escaped** (lead fields are visitor input). URLs are built with `URL` and only `https:`, `mailto:` and `tel:` schemes are emitted.
- **Owner notification (vi):** heading = purpose; product block (photo when the product has a real `src`, name, price, link to the product page); request details (size, quantity, locale); contact block with tappable `mailto:` email, `tel:` phone and a Zalo link (`https://zalo.me/0…` from the normalised `+84` number); name and address; the message in a quoted block with line breaks kept; footer with time (Asia/Ho_Chi_Minh) and "consent given". Subject unchanged.
- **Customer confirmation (page locale):** greeting, the existing success copy for the form, the request summary (purpose, product with link), and the shop name. Subject from the locale's messages.
- The plain-text versions stay and are sent alongside (`text` + `html`); the customer text version also follows the page locale.
- `EmailMessage` gains `html`; the Resend send call passes it through.

## 2. No indexing on the temporary host

- `lib/seo/indexing.ts`: `isIndexable(siteUrl: string): boolean` is false when the host ends with `.vercel.app`, true otherwise (localhost and the future `.com`).
- When not indexable: `robots.txt` disallows everything and omits the sitemap line; `buildMetadata` adds `robots: { index: false, follow: false }`; pages that already set `noindex` keep it. Switching `NEXT_PUBLIC_SITE_URL` to `https://<name>.com` turns indexing on with no code change.
- Vercel preview deployments already send `X-Robots-Tag: noindex`; this covers the production deployment on `vercel.app`.

## 3. Production configuration check

- `scripts/check-production-config.mjs` runs before `next build` (`"build": "node scripts/check-production-config.mjs && next build"`) and only enforces on Vercel production builds (`VERCEL_ENV=production`); local, CI and preview builds pass through.
- Required in production: `NEXT_PUBLIC_SITE_URL` (https), `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_GA_ID`. With `AI_ENABLED=true`, at least one of `GEMINI_API_KEY` / `ANTHROPIC_API_KEY`.
- On failure it prints the **names** of missing variables (never values) and exits 1, so a broken production deploy never replaces a working one.

## 4. CSP review

Review `lib/security/csp.ts` against what production loads after P6–P8 (GA, same-origin APIs, Vercel image optimisation, `blob:`/`data:` where used) and remove anything unused; record the result in the ADR. AI providers are server-side and need no CSP entry.

## 5. Launch checklist

`docs/launch-checklist.md` (English, owner-facing steps): P9a items to confirm on Vercel (env list, GA4 data retention), P9b inputs (photo sizes and naming, policy and About text, R-01 status review), and the `.com` steps (add domain in Vercel, DNS, 308 redirect from `vercel.app`, Resend domain verification with SPF/DKIM, switch `LEADS_FROM_EMAIL` and `NEXT_PUBLIC_SITE_URL`, Search Console DNS verification, sitemap submission, re-run `pnpm perf`).

## Testing

- Unit: HTML escaping of every field (script tags, quotes, `javascript:` in message), owner and customer HTML contain the expected sections per locale, Zalo/tel/mailto links, product photo only with a real `src`, text versions per locale; email sink sends `html` and `text`; `isIndexable` for vercel.app, localhost, `.com`; robots and metadata when not indexable; production config check (enforced only with `VERCEL_ENV=production`, names-only output, AI key rule).
- E2E: robots.txt and the meta robots tag stay indexable on the test host (localhost) — existing SEO specs unchanged.
- Email preview: a script writes sample HTML files to a git-ignored folder for visual checks; evidence PNGs of both emails (vi owner, vi and en customer) rendered in Chromium.

## Out of scope (P9b)

Real photos and texts, `.com` domain, Resend domain verification, Search Console, Lighthouse with real photos.
