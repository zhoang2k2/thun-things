# P3 — Contact, Notify-me, Policy & About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visitors can order through the Contact form and ask to be notified about sold-out products; the owner receives every submission by email; customers get a confirmation once the domain is verified; Policy and About have structured placeholder content.

**Architecture:** Server Functions + `useActionState` forms (progressive enhancement). Zod schemas in `lib/leads/schema.ts`; delivery through a `LeadSink` interface with a Resend implementation; Upstash rate limiting; a readiness check that disables forms cleanly when configuration is missing.

**Tech Stack:** Next.js 16.4 Server Functions, React 19 `useActionState`, Zod 4, `resend`, `@upstash/ratelimit` + `@upstash/redis`, Vitest + RTL, Playwright.

**Spec:** [`../specs/2026-10-23-p3-contact-forms-design.md`](../specs/2026-10-23-p3-contact-forms-design.md).

**Branch / PR:** `phase/p3-contact-forms` (rebase onto `develop` once P2 merges) → one PR, evidence via `pnpm evidence`.

## Global Constraints

- Agents never read real env files; tests and e2e use explicit test values only (rule R4).
- No lead data (email, phone, address, message) in logs, errors, or analytics.
- Strings in `content/copy/vi.ts`; DR-1/DR-2 apply to every form control (square inputs, no shadows).
- Read the installed Next docs on Server Functions, `useActionState`, `searchParams` under Cache Components, and `headers()` before writing those files.

## Review Focus

1. **Missing configuration:** no Resend key / inbox (or no Upstash in production) → disabled form, server function refuses. Pinned by Task 1 and Task 6 tests.
2. **Phone formats:** `0912 345 678`, `+84 912.345.678`, `84912345678` accepted; `12345`, letters rejected. Pinned by Task 2 tests.
3. **Notify-me with neither email nor phone** → field error, nothing sent. Pinned by Task 2 and Task 7 tests.
4. **Honeypot filled** → success shown, nothing delivered. Pinned by Task 5 test.
5. **Unknown `?product=`** on Contact → ignored, form still works. Pinned by Task 6 test.

---

### Task 0 (Owner) — required before P3 starts

- [x] Merge PR #3 (P2 DONE) and connect Vercel (carried from P1).
- [x] Create a **Resend** account → API key. Use the **Resend account email** as `LEADS_TO_EMAIL` until the domain is verified (P9).
- [x] Create an **Upstash Redis** database → REST URL and token.
- [ ] Set in `.env.local` (done by the owner, 2026-10-23) **and** Vercel (Preview + Production) using the names in `.env.example`: `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`; leave `LEADS_FROM_EMAIL` empty (defaults to `onboarding@resend.dev`).
- [ ] Optional (defaults apply): policy text, About text and photo, chat channel link, footer contact email.

### Task 1 (BE): Form readiness

**Files:** Create `lib/leads/readiness.ts` (+ test). No change to `.env.example`.

**Interfaces:** no new owner-facing variable. `canSendCustomerConfirmation(fromEmail = env.LEADS_FROM_EMAIL): boolean` → true only when the sender is outside `resend.dev`. `leadSinkMode(): 'email' | 'memory'` → `memory` only when the test-only `E2E_LEADS_SINK=memory` is set by Playwright and never when `VERCEL_ENV === 'production'` (read in `lib/leads/readiness.ts`, not in `lib/env.ts`, `.env.example`, or `docs/configuration-variables.md`). `getFormReadiness(): { enabled: true } | { enabled: false; reason: 'email' | 'ratelimit' }` — email needs `RESEND_API_KEY` and `LEADS_TO_EMAIL` (unless memory mode); rate limit needs Upstash when `NODE_ENV === 'production'`.

- [x] Tests: confirmation off for empty / `@resend.dev` senders, on for an own-domain sender; `memory` refused in production; readiness reasons for each missing piece.
- [x] Implement; commit `[TASK] Add form readiness`.

### Task 2 (BE): Lead schemas

**Files:** Create `lib/leads/schema.ts`, `lib/leads/phone.ts` (+ tests).

**Interfaces:** `normalizeVietnamesePhone(input: string): string | null` → `+84xxxxxxxxx`; `contactFormSchema` (purpose enum, email, phone, optional name ≤ 80, size ≤ 10, quantity int 1–20, address ≤ 300, message ≤ 1000, productSlug optional, consent literal `on`/`true`, honeypot `website` optional); `notifyFormSchema` (productSlug, email?, phone?, consent; refine: at least one of email/phone with the error on `email`). Types `ContactForm`, `NotifyForm`. Messages from copy.

- [x] Tests: phone accept/reject list (Review Focus 2); contact requires email + phone + consent; optional fields accept empty strings; quantity bounds; notify requires one of email/phone (Review Focus 3).
- [x] Implement; commit `[FEATURE] Add lead form schemas`.

### Task 3 (BE): Rate limit and client IP

**Files:** Create `lib/leads/rateLimit.ts` (+ test).

**Interfaces:** `checkRateLimit(key: string): Promise<{ ok: boolean }>` — Upstash `Ratelimit.slidingWindow(5, '10 m')` when configured, in-memory fallback otherwise (development and tests only); `clientKey(headers: Headers): string` from `x-forwarded-for` first hop, else `'anonymous'`.

- [x] Tests with the in-memory limiter: 5 allowed, 6th refused, other key unaffected; `clientKey` parsing.
- [x] Implement; commit `[FEATURE] Add submission rate limiting`.

### Task 4 (BE): Lead sink and emails

**Files:** Create `lib/leads/types.ts`, `lib/leads/sink.ts`, `lib/leads/emailSink.ts`, `lib/leads/memorySink.ts`, `lib/leads/templates.ts` (+ tests).

**Interfaces:** `Lead` per spec; `LeadSink { deliver(lead: Lead): Promise<void> }`; `getLeadSink(): LeadSink` (email or memory by `env.LEADS_SINK`); `ownerEmail(lead, product?)` and `customerEmail(lead, product?)` → `{ subject, text }` in Vietnamese; email sink sends the owner email always and the customer email only when `canSendCustomerConfirmation()` and `lead.email` exist; Resend errors throw a `LeadDeliveryError` without lead data.

- [x] Tests (Resend client mocked): owner email contains purpose, product name, phone; confirmation skipped for a `resend.dev` sender or no email; sent for an own-domain sender; delivery error message contains no email/phone.
- [x] Implement; commit `[FEATURE] Add email lead sink`.

### Task 5 (BE): Server functions

**Files:** Create `app/contact/actions.ts`, `app/products/[slug]/actions.ts` (or `lib/leads/actions.ts` if shared), tests.

**Interfaces:** `type FormState = { status: 'idle' | 'success' | 'error' | 'disabled'; fieldErrors?: Record<string, string>; message?: string }`; `submitContact(prev: FormState, formData: FormData): Promise<FormState>`; `submitNotify(prev, formData)`. Order: readiness → honeypot → rate limit → validate → build lead (product resolved via `lib/catalog`) → `sink.deliver` → success.

- [x] Tests (sink and limiter mocked): honeypot → success without delivery; rate limited → error message; invalid → field errors; valid → one delivery with normalised phone; readiness off → `disabled`.
- [x] Implement; commit `[FEATURE] Add contact and notify server functions`.

### Task 6 (FE): Contact page form

**Files:** Create `components/forms/Field.tsx` (label, input/select/textarea, error, hint), `components/forms/ContactForm.tsx` (client), `components/forms/FormStatus.tsx`; modify `app/contact/page.tsx`, `content/copy/vi.ts`, `app/globals.css` (square native controls already reset).

- [x] Tests: prefilled product summary for a known slug; unknown slug ignored; purpose default; required markers; field errors rendered with `aria-invalid` and linked messages; disabled state shows the note and no submit.
- [x] Implement; commit `[FEATURE] Add contact order form`.

### Task 7 (FE): Notify-me on product pages

**Files:** Create `components/forms/NotifyForm.tsx`; modify `components/product/ProductInfo.tsx` (+ test).

- [x] Tests: sold-out shows the form (email, phone, consent), others do not; submitting neither field shows the error.
- [x] Implement; commit `[FEATURE] Add in-page notify-me form`.

### Task 8 (FE): Policy and About content

**Files:** Create `content/policies/privacy.ts`, `content/policies/returns.ts`, `content/about.ts`; modify policy and About pages.

- [x] Structured sections (headings, paragraphs, lists) marked `TODO(owner)`; privacy lists email/phone collection, Resend, consent; About text + `MediaImage` photo placeholder.
- [x] Commit `[TASK] Add policy and about placeholder content`.

### Task 9: E2E, evidence, PR

- [x] Playwright `webServer` env: `E2E_LEADS_SINK=memory`, test-only `RESEND_API_KEY`/`LEADS_TO_EMAIL` dummies (never real), so forms are enabled without sending.
- [x] E2E: contact validation errors and success; prefill from a product link; notify-me error and success; disabled state when config is absent (second server config or unit-level); axe on `/contact`, a sold-out product, both policies, About.
- [x] Evidence scenarios: contact errors → success; product → contact prefill; notify-me; disabled form; policy and About pages.
- [x] Full suite, PR, evidence, CI.

## P3 Acceptance (gate for P4)

- [x] CI green; evidence in the PR.
- [x] Owner receives a real notification email from the Vercel preview (owner confirmed 2026-10-23; HTML formatting moved to P9, Sheet sink to P10).
- [x] Honeypot and rate limit tested; forms show a clear disabled state when configuration is missing.
- [ ] Owner merged the PR; roadmap P3 = `DONE`.

## Implementation notes (2026-10-23)

Deviations from the tasks above, recorded during implementation:

- **Validation before rate limit** (Task 5): invalid submissions are rejected before the limiter runs, so fixing typos never uses up a visitor's five submissions. Nothing is sent for invalid input.
- **Contact form in the static shell** (Task 6): the form is prerendered; only the query-dependent parts (product summary, purpose, size options, hidden product slug) stream in through `use()` inside `<Suspense>`, each with a working fallback.
- **No-JS result pages:** under Cache Components a native (no-JS) form post cannot re-render the page in place, so the server functions answer non-router submissions with a 303 to static `/contact/sent` or `/contact/retry` (noindex, not in the sitemap). Router submissions (with the `next-action` header) keep the in-place state.
- **Notify-me readiness** is evaluated when the static product page is prerendered; the server function re-checks it per request.
- **Upstash outage** fails open (logged by error name only); the honeypot still filters naive bots.
- **E2E:** `E2E_LEADS_SINK=memory` also forces the in-memory limiter, so test runs never touch Upstash.
- **Evidence:** `scripts/evidence/capture.mjs` gained `EVIDENCE_SET`; the disabled state is captured from a second build with blank email variables.
