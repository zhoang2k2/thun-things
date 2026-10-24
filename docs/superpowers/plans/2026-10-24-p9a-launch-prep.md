# P9a — Launch Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branded HTML lead emails, no indexing on `vercel.app`, a production build that refuses missing configuration, a CSP review and an owner launch checklist.

**Architecture:** String-built, escaped HTML emails beside the existing text templates; a host-based indexing switch used by `robots.ts` and `buildMetadata`; a pre-build Node script that only enforces on Vercel production.

**Tech Stack:** Next.js 16.4 metadata routes, Resend, Vitest, Playwright.

**Spec:** [`../specs/2026-10-24-p9a-launch-prep-design.md`](../specs/2026-10-24-p9a-launch-prep-design.md).

**Branch / PR:** `phase/p9a-launch-prep` from `develop` → one PR.

## Global Constraints

- Every visitor value in HTML is escaped; only `https:`, `mailto:`, `tel:` links.
- Owner email Vietnamese; customer email (HTML and text) in the lead's locale.
- DR-1/DR-2 in emails: square corners, flat colours, no emoji.
- `noindex` exactly when the site host ends with `.vercel.app`.
- The config check prints variable names only and enforces only with `VERCEL_ENV=production`.
- Keep P4–P8 guarantees (render modes, Lighthouse budgets, axe, CSP tests, both locales).

## Review Focus

1. **Hostile lead input** (`<script>`, quotes, `javascript:` URLs, very long messages) in HTML emails. Task 1.
2. **Customer on `/en`** gets English HTML and text; owner still Vietnamese. Task 1.
3. **Indexing switch** flips on `.com` without code changes, never on localhost tests. Task 2.
4. **CI and preview builds** never fail on the production check. Task 3.

---

### Task 1: HTML lead emails

**Files:** Create `lib/leads/emailHtml.ts` (+ test); modify `lib/leads/templates.ts` (customer text per locale), `lib/leads/emailSink.ts` (+ test), `lib/leads/sink.ts` if the send adapter needs `html`; messages if new email labels are needed (vi/en).

**Interfaces:** `ownerEmailHtml(lead, product, siteUrl): string`; `customerEmailHtml(lead, product, siteUrl): string`; `EmailMessage.html?: string`; `customerEmail` uses `lead.locale`.

- [ ] Tests: escaping of every field; owner HTML sections, `mailto:`/`tel:`/Zalo links, photo only with `src`; customer HTML and text in vi and en; sink sends `html` with `text` for both emails.
- [ ] Commit `[FEATURE] Send branded HTML lead emails`.

### Task 2: No indexing on the temporary host

**Files:** Create `lib/seo/indexing.ts` (+ test); modify `app/robots.ts` (+ test), `lib/seo/metadata.ts` (+ test).

- [ ] Tests: `isIndexable` for `https://thun-things.vercel.app`, `http://localhost:3000`, `https://thunthings.com`; robots disallow-all without sitemap when not indexable; metadata `robots.index === false` when not indexable and absent otherwise.
- [ ] Commit `[FEATURE] Keep the temporary host out of search results`.

### Task 3: Production configuration check

**Files:** Create `scripts/check-production-config.mjs` (+ `scripts/check-production-config.test.ts`); modify `package.json` `build`; docs `docs/configuration-variables.md`.

- [ ] Tests: passes without `VERCEL_ENV=production`; lists each missing required name; rejects a non-https site URL; AI enabled without keys fails; output never contains a value.
- [ ] Commit `[FEATURE] Refuse production builds with missing configuration`.

### Task 4: CSP review, checklist, email evidence, PR

- [ ] CSP review with tests updated for any removal; ADR-012 (P9a decisions) + index row.
- [ ] `docs/launch-checklist.md`; roadmap: P9 split into P9a/P9b, P9a `IN REVIEW`.
- [ ] Email preview script → evidence PNGs (owner vi, customer vi, customer en).
- [ ] Full suite, `pnpm perf`, push, PR, evidence, CI.

## P9a Acceptance

- [ ] HTML emails escaped and localised; text versions kept.
- [ ] `vercel.app` production answers `noindex`; `.com` will index without code changes.
- [ ] Production build fails fast on missing configuration; CI and previews unaffected.
- [ ] CI green; evidence in the PR; owner confirmed the Vercel env list and GA4 retention; owner merged.
