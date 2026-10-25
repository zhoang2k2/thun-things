# Architecture Decision Records (ADR)

> **Source of Truth:** For overarching business and product decisions, refer to [`thun-things.md`](../../thun-things.md).

This directory tracks significant technical and architectural choices made during the development of Thun Things.

---

## Index of Decisions

| ADR         | Title                                                        | Status       | Date       |
| ----------- | ------------------------------------------------------------ | ------------ | ---------- |
| **ADR-001** | Next.js 16 and React 19 Version Baseline                     | **Accepted** | 2026-10-15 |
| **ADR-002** | Root-Based Project Structure (No `src/` Directory)           | **Accepted** | 2026-10-15 |
| **ADR-003** | Vitest and React Testing Library for Testing Baseline        | **Accepted** | 2026-10-15 |
| **ADR-004** | In-Repository TypeScript Catalog Data with Data-Access Layer | **Accepted** | 2026-10-15 |
| **ADR-005** | Lean Bootstrap Dependency Policy                             | Superseded   | 2026-10-15 |
| **ADR-006** | UI Direction v3 Shell                                        | **Accepted** | 2026-10-23 |
| **ADR-007** | P4 Quality Hardening Decisions                               | **Accepted** | 2026-10-23 |
| **ADR-008** | Bilingual routing with next-intl and root parameters         | **Accepted** | 2026-10-24 |
| **ADR-009** | Cookie consent and GA4 (Consent Mode Basic)                  | **Accepted** | 2026-10-24 |
| **ADR-010** | Deterministic quiz bot: server scoring and bubble guardrails | **Accepted** | 2026-10-24 |
| **ADR-011** | Quiz AI rationale: Gemini first, Anthropic fallback          | **Accepted** | 2026-10-24 |
| **ADR-012** | Launch preparation on a temporary host                       | **Accepted** | 2026-10-24 |
| **ADR-013** | Two product statuses and the pre-order purpose               | **Accepted** | 2026-10-25 |

---

### ADR-001: Next.js 16 and React 19 Version Baseline

- **Context:** `thun-things.md` noted an open version decision (R-07): current Next.js stable releases require React 19, whereas older baseline assumptions referenced React 18.
- **Decision:** Use **Next.js 16.4.0** (App Router with Turbopack) paired with **React 19.3.0**.
- **Rationale:** Next.js 16 provides official stability, enhanced server caching, Partial Prerendering capabilities, and native Turbopack support. Modern ecosystem libraries (`next-intl`, `@testing-library/react`, `zod`) have complete React 19 compatibility.
- **Consequences:** All components and testing infrastructure use React 19 types (`@types/react@^19`).

---

### ADR-002: Root-Based Project Structure (No `src/` Directory)

- **Context:** Framework initializers often prompt for a `src/` directory.
- **Decision:** Place `app/`, `components/`, `lib/`, `config/`, `styles/`, and `types/` directly at the project root.
- **Rationale:** A root-based layout is the standard modern Next.js convention. It shortens file paths, reduces nesting depth, and simplifies mental models for both the solo developer and AI coding agents.
- **Consequences:** Import alias `@/*` is configured in `tsconfig.json` to resolve to `./*`.

---

### ADR-003: Vitest and React Testing Library for Testing Baseline

- **Context:** Fast feedback is essential for maintaining code quality in an AI-agent-assisted project.
- **Decision:** Adopt **Vitest 5.x** with **React Testing Library** and `jsdom`.
- **Rationale:** Vitest natively supports ESM and TypeScript without cumbersome Babel or Jest configuration. It executes in milliseconds, integrates seamlessly with Turbopack/Vite conventions, and runs in GitHub Actions CI with minimal resource consumption.
- **Consequences:** Tests use `.test.ts` and `.test.tsx` extensions. A centralized setup file (`vitest.setup.ts`) configures jest-dom matchers.

---

### ADR-004: In-Repository TypeScript Catalog Data with Data-Access Layer

- **Context:** Thun Things has fewer than 10 products in its initial launch catalog. Provisioning and maintaining Supabase/Prisma at bootstrap adds cost and configuration complexity.
- **Decision:** Store catalog items as statically typed TypeScript objects validated by Zod schemas in `lib/catalog/data.ts`. Require all application reads to pass through `lib/catalog/index.ts`.
- **Rationale:** Build-time static generation delivers instant page loads, zero hosting cost, and eliminates database connection pooling issues on serverless functions. The strict data-access layer ensures that migrating to a database in Phase 7 requires zero changes to UI components or recommendation algorithms.
- **Consequences:** All catalog edits are version-controlled via Git commits until an administrative CMS is warranted.

---

### ADR-005: Lean Bootstrap Dependency Policy

> **Superseded (2026-10-22):** the owner chose to install every roadmap library in P0 (roadmap v2, P0 plan). Libraries are installed but only wired in their phase.

- **Context:** Greenfield projects frequently accumulate dependencies that are not needed until later phases.
- **Decision:** Defer installation of future libraries (Motion, GSAP, Radix UI, Resend, Anthropic SDK, GA4, Upstash) until their designated phases (P1–P5).
- **Rationale:** Minimizes security vulnerability surface area, keeps `pnpm install` fast, prevents peer dependency conflicts, and enforces focus on foundational infrastructure.
- **Consequences:** Future phases install libraries incrementally with clear acceptance tests.

---

### ADR-006: UI Direction v3 Shell

- **Context:** The owner replaced UI Direction v2 with v3 and added binding design rules DR-1 (no radius) and DR-2 (art/photography/fashion, no "AI slop") — see `docs/superpowers/specs/2026-10-23-ui-direction-v3-design.md`.
- **Decision:**
  - Typeface **Bricolage Grotesque** via `next/font/google` (`latin` + `vietnamese`); accent `#FF5A1F` as a swappable token with ink text on it.
  - The shell is Server Components only; owner-editable values (email, socials, nav) live in `config/site.ts`; strings in `content/copy/vi.ts`.
  - DR-1/DR-2 are enforced by `tests/design-rules.test.ts` (no `rounded-*`, no non-zero `border-radius`, no gradients, no `lucide-react`); the Tailwind radius scale is cleared.
  - Icons come from Hugeicons only; `lucide-react` was removed.
  - Every image goes through `MediaImage`, which renders the V-26 placeholder when no source exists.
  - Policy pages are two static routes: a dynamic `/policy/[slug]` returned `200` for unknown slugs under Partial Prerendering.
- **Consequences:** Swapping accent, typeface, or contact details touches one token or config entry. New UI that curves or uses gradients fails CI. The glass-layer exemption was removed with the V-25 glass layer (2026-10-23).

---

### ADR-007: P4 Quality Hardening Decisions

- **Context:** P4 adds security headers, performance budgets and SEO/a11y checks on the single-locale MVP, on Next.js 16.4 with Cache Components.
- **Decision:**
  - **Static CSP, no nonce.** `lib/security/csp.ts` builds one fixed `Content-Security-Policy` (plus HSTS, `nosniff`, referrer, permissions and frame headers). A nonce would force per-request rendering and drop the prerendered shells Cache Components produces. `script-src` therefore keeps `'unsafe-inline'` because Next emits inline scripts; `'unsafe-eval'` is added in dev only and `https://vercel.live` on Vercel previews only. GA4 in P6 extends `lib/security/csp.ts`.
  - **Lighthouse as a devDependency.** `lighthouse@13.5.0` is pinned and wired as `pnpm perf` (builds, then reports the median of 3 mobile runs per page against budgets LCP 2500 ms, CLS 0.1, TBT 200 ms). The report is committed under `docs/reports/`. P9 re-measures with real photos.
  - **Zod stays out of client bundles.** Client components import lead purposes from `lib/leads/purposes.ts` (no Zod); the schema in `lib/leads/schema.ts` is server-only. It also calls `z.config({ jitless: true })` so Zod never probes `Function("")`, which the CSP without `'unsafe-eval'` would report as a violation, if the schema ever returns to the browser.
  - **Motion features load lazily.** `ProductGrid` wraps its tree in `LazyMotion` with `strict` and a dynamic `features` loader (`components/motion/features.ts`, `domAnimation`), so pages paint before Motion's animation engine downloads; components use the `m` component and a plain `motion` import fails in strict mode.
- **Consequences:** Pages stay prerendered. The CSP is weaker on inline scripts than a nonce-based one; revisit if Next gains static hash support. Any new third-party origin needs a `lib/security/csp.ts` change and a test.

---

### ADR-008: Bilingual routing with next-intl and root parameters

- **Context:** P5 adds Vietnamese and English on Next.js 16.4.2 with Cache Components and next-intl 4.14.9. The owner requires a deterministic Vietnamese default and unchanged catalog content.
- **Decision:**
  - Every page lives under `app/[locale]`; `generateStaticParams` supplies `vi` and `en`. `i18n/request.ts` reads the locale from `next/root-params` rather than request headers to preserve prerendering. Unprefixed metadata endpoints remain at the app root.
  - `i18n/routing.ts` is the locale authority: always-prefixed paths, default `vi`, no browser detection or locale cookie. `/` and supported legacy page URLs redirect permanently to `/vi`, retaining queries.
  - `messages/vi.json` defines the typed message keys. `messages/en.json` has key parity. Server Components translate on the server; client providers receive only the namespaces their subtree needs.
  - Catalog content is selected from existing `Localized` fields. P5 does not translate or edit catalog entries. VND formatting uses the page locale.
  - Metadata declares a localized canonical and reciprocal `vi`, `en`, and `x-default` (Vietnamese) links. Sitemap entries cover both locales; contact result pages remain excluded and noindex. JSON-LD fields and URLs and product OG images use the same page locale. `inLanguage` is used on `WebSite`; Organization and Product do not support that schema property. Short product meta descriptions append existing material facts without changing catalog copy. The shared root OG wordmark remains unprefixed, served by a route handler (`app/opengraph-image/route.ts`) rather than the `opengraph-image` file convention: the convention sat above the `[locale]` root layout, outside every `metadataBase`, and made the build warn and fall back to `localhost:3000`. Pages already name `/opengraph-image` explicitly, so served URLs are unchanged.
  - Unknown URLs: `proxy.ts` allow-lists the page paths and known product slugs and rewrites every other path to `/{locale}/not-found-page` (Vietnamese when the first segment is not a locale). That page is prerendered per locale with the 404 body in the HTML and calls `notFound()` inside a Suspense boundary, which sets the prerendered status to 404; a page-level `notFound()` would bubble past the root layout and prerender an empty client-only error shell. The switcher on the 404 links to each Home. `app/global-not-found.tsx` remains the Vietnamese fallback for misses the proxy never sees (Next internals).
  - Server Actions cannot use root parameters. Each form posts a hidden locale; actions validate it against routing locales, default invalid/missing values to `vi`, store the validated locale and use it for native result redirects. Validation errors remain message keys translated by the form. Owner notifications stay Vietnamese and identify the customer locale.
- **Accepted exception [USER, 2026-10-24]:** Without JavaScript the language switch keeps the path but drops the query. The prerendered links carry the path; with JavaScript the browser fills in the query. Query-aware links in the HTML would force per-request rendering of the layout and lose the prerendered shells.
- **Consequences:** Render modes are unchanged from P4: Home and Contact are partially prerendered (◐), every other page and the 404 are static (○/●). After a client-side locale switch, Next keeps the previous locale's tree hidden (`display: none`) for back/forward navigation, so DOM queries that should only see the visible page need `:visible` or a role-based locator.
- **References:** [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [multilingual sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap); version-specific root-parameter restrictions were checked in the installed `node_modules/next/dist/docs/`.

---

### ADR-009: Cookie consent and GA4 (Consent Mode Basic)

- **Context:** D-14 requires GA4 to load only after consent. P6 owner decisions: bottom consent bar, Necessary + Analytics categories only, GA collects in production only (previews with `?ga_debug=1`), one measurement ID.
- **Decision:**
  - **Consent Mode Basic.** Nothing from Google is requested before the visitor accepts analytics. After Accept, an inline init sets `consent default` (`analytics_storage` granted; `ad_storage`, `ad_user_data`, `ad_personalization` always denied) before `config`, then `gtag.js` loads. A small own loader (`components/consent/Analytics.tsx`) is used instead of `@next/third-parties` `GoogleAnalytics` so that order is guaranteed.
  - **Storage.** The decision is `localStorage['thun-things.consent'] = { version: 1, analytics, decidedAt }`; no cookie of our own. A newer `version` re-asks everyone. An in-memory copy (`lib/analytics/consentStore.ts`) keeps a choice made where storage throws.
  - **Prerendered bar.** The bar is in the static HTML so it paints with the page (rendered only after hydration it became the LCP element at ~3 s while images are placeholders). An inline boot script hides it before paint for visitors who already decided; `<html>` carries `suppressHydrationWarning` for that attribute.
  - **When GA runs.** `analyticsMode` = production when `VERCEL_ENV === 'production'`, debug (`debug_mode: true`) anywhere with `?ga_debug=1` (kept for the tab in `sessionStorage`), otherwise off; always off without `NEXT_PUBLIC_GA_ID`.
  - **Revoking** denies `analytics_storage`, deletes `_ga`/`_ga_*` cookies, and stops events; the loaded tag stays until the next full load.
  - **Events** go through the typed `trackEvent` (`lib/analytics/events.ts`): `select_item`, `hover_preview_open`, `contact_start`, `contact_submit`, `locale_switch`. Params are enums and the product slug (`product_id`) only.
  - **CSP** adds `https://www.googletagmanager.com` (script), `https://*.google-analytics.com`, `https://*.analytics.google.com`, `https://*.googletagmanager.com` (connect; img for the first and last).
- **Consequences:** No Google traffic for visitors who reject or never decide. E2E builds with a dummy id (`G-TEST000000`) and intercepts all Google traffic; most specs start with a stored decision so the bar stays out of their way. Legal review of the consent and privacy text (Decree 13/2023/ND-CP, GDPR) is an owner task before launch (P9).

---

### ADR-010: Deterministic quiz bot: server scoring and bubble guardrails

- **Context:** D-23/D-24 ask for a corner quiz that recommends designs, plus a speech bubble inviting visitors to it (D-24a/O-04 guardrails). P7 owner decisions: two questions (colour, vibe), "see more" expands inside the card (no `/shop` page), five placeholder vibes (art, graphic, minimal, street, retro), scoring on the server.
- **Decision:**
  - **Scoring** (`lib/recommend/score.ts`) is pure and deterministic: colour match 3, vibe match 2; status bonus available/limited +2, preorder +1, coming_soon 0, sold_out −3. Ties break by status rank, then `releasedAt` descending (missing last), then slug ascending. The answer is labelled `exact`, `color`, `vibe` or `none`; with `none` the best purchasable designs still show, with a link to Contact.
  - **Endpoint.** `POST /api/quiz/recommend` takes `{ locale, color, vibe? }` validated by a strict Zod schema built from the catalog (unknown colours, vibes or keys → 400). Bodies over 1 KB → 400. Rate limited at 30 requests per 10 minutes per client through a shared limiter factory (`lib/security/rateLimit.ts`, also used by leads; Upstash in production, in-memory otherwise). Answers are `no-store`. `proxy.ts` excludes `api/` from locale routing.
  - **Client.** The launcher is a small client component; the card (steps, fetch, results) loads with `next/dynamic` only when opened. The card is a non-modal dialog: focus moves to each step heading, Escape and close return focus to the launcher.
  - **Bubble guardrails.** First after 20 s, then every 45 s, at most 3 per session (`sessionStorage`), each visible for 10 s. Silent after dismissal, while the quiz is open, on Contact and Policy pages, and under reduced motion. Announced through an `aria-live="polite"` region (no `status` role, so page status messages stay unambiguous) and never takes focus.
  - **Layout.** Launcher, bubble and card stack above the consent bar and, on mobile product pages, above the order bar (`--quiz-bottom` in `globals.css`). While the consent bar shows, the launcher stays hidden until the bar has been measured (`data-consent-bar-measured`), so it never jumps into place (CLS).
  - **Events** (`quiz_open`, `quiz_step`, `quiz_complete`, `quiz_result_click`, `quiz_bubble_shown`, `quiz_bubble_dismiss`) carry catalog colour ids, vibe tags, match kind, product slug, positions and counts only.
- **Consequences:** Recommendations are explainable and testable without an AI dependency; P8 adds AI rationale on top of the same ranking. Vibe labels are placeholders until the owner tags the real catalog.

---

### ADR-011: Quiz AI rationale: Gemini first, Anthropic fallback

- **Context:** D-15 planned a Claude-written "why this fits you" line under the quiz result. P8 owner decisions: Gemini first with Anthropic as fallback when the Gemini key is missing or Gemini fails (P8-1); cheapest models by default (P8-2).
- **Decision:**
  - **Chain.** `lib/ai/explain.ts` tries providers in order Gemini (`@google/genai`) → Anthropic (`@anthropic-ai/sdk`), skipping any without a key, inside one 3,500 ms deadline. A provider with a fallback behind it gets at most 2,000 ms, so a hanging Gemini still leaves Anthropic time. SDK retries are off; the fallback replaces the roadmap's "one retry". The client gives up after 4 s.
  - **Models from configuration**: `GEMINI_MODEL` (default `gemini-3.1-flash-lite`, the cheapest model a new key can use; earliest shutdown 2027-05-07, replacement `gemini-3.5-flash-lite`) and `ANTHROPIC_MODEL` (default `claude-haiku-5-5`). Gemini thinking is minimised so it does not eat the 120-token output cap.
  - **Input and output.** The prompt is built on the server from catalog facts and the visitor's enum answers only (no price, no free text). Output must be at most 2 sentences and 280 characters, with no link, `@`, markdown or emoji; anything else counts as a provider failure.
  - **Endpoint.** `POST /api/quiz/explain` with strict catalog enums (`locale`, `color`, `vibe?`, `slug`), 10 requests per 10 minutes per client, `200 { text, provider }` or `204` for "no rationale" (AI off, no key, every provider failed, or the chain threw).
  - **Cache** of successful answers for 7 days per locale, colour, vibe, product and models (Upstash when configured, in-memory otherwise).
  - **Tests and tooling never call a provider**: Playwright, evidence and Lighthouse servers force `AI_ENABLED=false`; the UI is tested with a stubbed endpoint; a check keeps key names and SDKs out of browser bundles.
- **Consequences:** The quiz works unchanged without AI. A rationale costs about US$0.00025 with the default Gemini model. Claude is now the fallback, which is weaker evidence for a Claude for Startups application (`thun-things.md` §12); leaving `GEMINI_API_KEY` unset makes Claude the only provider. Production should use a billing-enabled Gemini key, since free-tier requests may be used to improve Google products.

---

### ADR-012: Launch preparation on a temporary host

- **Context:** The site goes public on `thun-things.vercel.app` before the `.com` domain exists (P9-1). Without a verified domain, Resend only delivers to the account owner. P9 is split into P9a (code) and P9b (content, photos, domain) [USER].
- **Decision:**
  - **HTML lead emails** (`lib/leads/emailHtml.ts`) are built as strings with inline styles and tables, no new dependency; every visitor value is escaped and links are only `https:`, `mailto:`, `tel:` and Zalo. The owner notification stays Vietnamese; the customer confirmation (HTML and text) follows the page language and never echoes contact data or the message. Plain-text versions are still sent.
  - **Indexing by host** (`lib/seo/indexing.ts`): `*.vercel.app` answers `noindex, nofollow` and a disallow-all `robots.txt` without the sitemap; any other host (the `.com`, localhost) is indexable. Switching `NEXT_PUBLIC_SITE_URL` is the only step to open the site to search engines.
  - **Production configuration check** (`scripts/check-production-config.mjs`) runs before `next build` and only enforces when `VERCEL_ENV=production`; it lists missing variable names and stops the build, so a broken deploy never replaces a working one.
  - **CSP review:** `blob:` removed from `img-src` (unused); `data:` kept for future blur placeholders; GA entries unchanged; AI providers are server-side and need none.
- **Consequences:** Customers get no confirmation email until the domain is verified (accepted, the success page promises none). Merging to production requires the Vercel production variables listed in `docs/launch-checklist.md`.

---

### ADR-013: Two product statuses and the pre-order purpose

- **Context:** Five statuses (available, limited, preorder, coming soon, sold out) with different buttons and a separate notify-me form were more than the shop needs. The owner wants in stock → "Liên hệ đặt hàng" and sold out → "Liên hệ đặt trước" with up to 10% off (P9a2) before go-live.
- **Decision:**
  - `ProductStatus = 'available' | 'sold_out'`; the two existing ids are kept so analytics values and links stay valid. Migration: limited → available; preorder and coming soon → sold out (14 / 10 in the mock catalog). Notes written for removed statuses were dropped.
  - Every design has a button. Sold out shows "Giảm đến 10% khi đặt trước" under it (hover card, product page); the mobile order bar keeps its fixed height and shows the button only.
  - Lead purposes are `order`, `preorder`, `other`. The notify-me form, its server function, lead kind and copy were removed; `?purpose=notify` links prefill `preorder`, and a sold-out product without a purpose defaults to `preorder`. Owner emails name pre-orders and their discount.
  - Quiz status bonus: in stock +1, sold out 0 (+1 stays below the vibe weight, so an exact sold-out match still leads). JSON-LD: `InStock` / `BackOrder`. The AI prompt says a sold-out design can be pre-ordered with up to 10% off.
- **Consequences:** Simpler pages and one lead path. Without JavaScript, Contact cannot apply the prefilled purpose (streamed inside Suspense); the form still submits. The discount is a public promise the owner must honour (R-01).
