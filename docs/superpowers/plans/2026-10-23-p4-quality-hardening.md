# P4 — Quality Hardening (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Vietnamese site meets the mobile performance budgets, has no serious accessibility issues, ships error pages, icons, share images, structured data, `llms.txt` and security headers, and passes the owner's 20 SEO criteria (except Search Console, moved to P9).

**Architecture:** File-convention routes (`icon`, `apple-icon`, `opengraph-image`, `manifest`, `not-found`, `error`, `llms.txt`) built at build time; pure helpers in `lib/seo/` and `lib/security/` with unit tests; headers from `next.config.ts`; Lighthouse via a `pnpm perf` script; SEO, a11y, keyboard, reduced-motion and smoke checks in Playwright.

**Tech Stack:** Next.js 16.4 (Cache Components, `next/og`), React 19, Zod 4, Vitest + RTL, Playwright + axe, `lighthouse@13.5.0` (new devDependency, P4-2).

**Spec:** [`../specs/2026-10-23-p4-quality-hardening-design.md`](../specs/2026-10-23-p4-quality-hardening-design.md).

**Branch / PR:** `phase/p4-quality-hardening` from `develop` → one PR, evidence via `pnpm evidence`.

## Global Constraints

- DR-1 (no radius) and DR-2 (no gradients, soft shadows, glass) apply to icons and OG images too.
- All user-facing strings in `content/copy/vi.ts`; code, comments and docs in English.
- No new environment variable; agents never read real env files (R4).
- Read the installed Next docs before writing: `opengraph-image`, `icon`/`apple-icon`, `manifest`, `not-found`, `error`, route handlers, `headers` in `next.config`, and `generateMetadata` under Cache Components.
- Structured data must match visible content (no `BreadcrumbList`, P4-4). Availability mapping: `available`, `limited` → `InStock`; `sold_out` → `OutOfStock`; `preorder` → `PreOrder`; `coming_soon` → `PreSale`.
- Budgets (Lighthouse mobile): LCP < 2.5 s, CLS < 0.1, Total Blocking Time < 200 ms.

## Review Focus

1. **Catalog text breaking JSON-LD:** a product name or description containing `</script>` must not close the tag → `<` escaped as `<`. Pinned by Task 3.
2. **CSP blocking the site itself:** hydration, motion inline styles, server-function posts, `next/image` and fonts must keep working → no CSP violation in the console on any page. Pinned by Task 5.
3. **Pagination metadata:** `/?page=2` must not reuse Home's canonical or title; `/?page=abc` and `/?page=99` must not emit invalid canonicals → canonical follows the clamped page. Pinned by Task 2.
4. **Error page leaking details:** `error.tsx` must never render `error.message` or a stack. Pinned by Task 4.
5. **`llms.txt` and catalog drift:** adding a product must update `llms.txt` without code changes → generated from `lib/catalog`. Pinned by Task 3.

---

### Task 1 (FE): Icons, manifest, Open Graph images

**Files:** Create `app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts`, `app/opengraph-image.tsx`, `app/products/[slug]/opengraph-image.tsx`, `lib/seo/ogImage.tsx` (shared layout + font loader), `assets/fonts/BricolageGrotesque-Bold.ttf` (OFL, plus `assets/fonts/OFL.txt`); modify `lib/seo/metadata.ts` (+ test).

**Interfaces:** Produces `OG_SIZE = { width: 1200, height: 630 }`, `loadOgFont(): Promise<ArrayBuffer>` (reads the committed TTF with `fs`), `renderWordmarkImage(): ImageResponse`, `renderProductImage(product: Product): ImageResponse`. `buildMetadata` adds `twitter: { card: 'summary_large_image' }`.

- [x] Test (`lib/seo/metadata.test.ts`): `buildMetadata` returns `twitter.card === 'summary_large_image'`.
- [x] Implement icon (black "T", one accent bar, square), apple icon 180×180, manifest (`name: 'Thun Things'`, `short_name: 'Thun Things'`, `display: 'browser'`, `background_color: '#ffffff'`, `theme_color: '#111111'`, icons), default OG (white, large "THUN THINGS" wordmark, site description), product OG (name, price via `formatPriceVND`, status label from `presentStatus`, empty framed photo slot). Product OG uses `generateStaticParams` from the catalog so every image is static.
- [x] Verify: `pnpm build` lists `/opengraph-image`, `/icon.svg`, `/apple-icon`, `/manifest.webmanifest`, and a product `opengraph-image` as static; open two images locally and check them by eye.
- [x] Commit `[FEATURE] Add favicon, manifest, and Open Graph images`.

### Task 2 (BE): Page metadata completeness

**Files:** Modify `app/page.tsx` (`generateMetadata`), `app/products/[slug]/page.tsx`, `content/copy/vi.ts`, `next.config.ts` (`images.formats: ['image/avif', 'image/webp']`); create `lib/seo/pageMetadata.ts` (+ test).

**Interfaces:** Produces `homeMetadata(pageParam: string | string[] | undefined): Metadata`: page 1 → canonical `/`, Home title; page n > 1 (clamped like `listProducts`) → canonical `/?page=n`, title `Trang n`, description suffixed `Trang n.`

- [x] Tests: `homeMetadata(undefined)`, `('1')`, `('abc')` → canonical `/`; `('2')` → `/?page=2` and title `Trang 2`; `('99')` → `/?page=2` (clamped). Product metadata title is the product name and description the product description.
- [x] Implement; Home's `generateMetadata` awaits `searchParams` (request-time under Cache Components; the page already streams the grid).
- [x] Commit `[FIX] Give paginated pages their own canonical and title`.

### Task 3 (BE): Structured data and llms.txt

**Files:** Create `lib/seo/jsonLd.ts` (+ test), `components/seo/JsonLd.tsx`, `app/llms.txt/route.ts`, `lib/seo/llms.ts` (+ test); modify `app/page.tsx`, `app/products/[slug]/page.tsx`.

**Interfaces:** Produces `organizationJsonLd(): object`, `websiteJsonLd(): object`, `productJsonLd(product: Product): object` (`@type: Product`, `name`, `description`, `sku: product.id`, `url`, `image` (OG image URL), `offers: { @type: Offer, price, priceCurrency: 'VND', availability: 'https://schema.org/<value>', url }`), `serializeJsonLd(data: object): string` (JSON with `<` → `<`), `<JsonLd data={…} />`, `buildLlmsTxt(): string`.

- [x] Tests: availability for all five statuses; price is the number from the catalog; `serializeJsonLd({ name: '</script><script>x' })` contains no `</script>`; `buildLlmsTxt()` starts with `# Thun Things`, has a `> ` summary line, lists every product as `- [Name](absolute url): price, status`, and links About, Contact, both policies.
- [x] Implement; route returns `text/plain; charset=utf-8`, statically generated.
- [x] Commit `[FEATURE] Add structured data and llms.txt`.

### Task 4 (FE): Not-found and error pages

**Files:** Create `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `components/layout/ErrorState.tsx` (+ test); modify `content/copy/vi.ts`.

**Interfaces:** `ErrorState({ title, body, children })` presentational (h1, text, action slot); copy `copy.errors.notFound = { title, body, home, contact }`, `copy.errors.generic = { title, body, retry }`.

- [x] Tests: not-found renders one h1 and links to `/` and `/contact`; error page renders the retry button calling `reset` and never the error message (render with `new Error('secret detail')`, assert the text is absent).
- [x] Implement (`global-error.tsx` renders its own `<html lang="vi"><body>` and imports `globals.css`).
- [x] E2E (in Task 6 spec): `/does-not-exist` returns 404 with the not-found heading.
- [x] Commit `[FEATURE] Add not-found and error pages`.

### Task 5 (BE): Security headers

**Files:** Create `lib/security/csp.ts` (+ test), `e2e/security.spec.ts`; modify `next.config.ts`.

**Interfaces:** Produces `buildCsp({ dev: boolean, preview: boolean }): string` and `securityHeaders(options): { key: string; value: string }[]` (CSP, HSTS `max-age=63072000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`). `next.config.ts` `headers()` applies them to `/:path*` with `dev = NODE_ENV === 'development'`, `preview = VERCEL_ENV === 'preview'`. Directives exactly as spec section 4.

- [x] Unit tests: production CSP has every directive from the spec and no `unsafe-eval` or `vercel.live`; dev adds `'unsafe-eval'`; preview adds `https://vercel.live` to `script-src`, `connect-src`, `frame-src`, `img-src`; HSTS has no `preload`.
- [x] E2E: on Home, a product page and Contact, every header is present; collect `console` messages and `securitypolicyviolation` events while loading the page, opening a hover card and submitting the contact form → none.
- [x] Commit `[FEATURE] Add security headers and CSP`.

### Task 6: SEO, accessibility, keyboard, reduced motion, smoke

**Files:** Create `e2e/seo.spec.ts`, `e2e/journeys.spec.ts`; modify `e2e/accessibility.spec.ts` (page list), `app/sitemap.test.ts`; fix whatever the new checks find.

**Interfaces:** Consumes `getAllSlugs` and `shellPaths`. Public page list for checks: `/`, `/?page=2`, `/about`, `/contact`, `/policy/privacy`, `/policy/returns`, every `/products/<slug>`; result pages `/contact/sent`, `/contact/retry`; 404 `/does-not-exist`.

- [x] `seo.spec.ts` (SEO criteria 1–9, 11, 12, 15, 17, 18, 20): sitemap lists every public page and no result page; robots allows all and names the sitemap; public pages have no `noindex`, result pages do; canonical per Task 2 and `/contact?product=hoang-hon-01` → `/contact`; unique titles and descriptions (50–160 chars); exactly one `h1` and no skipped heading levels; every internal `<a href>` found on public pages returns 200; each product page links to `/` and to another product; no horizontal overflow at 360 and 390 px; every slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`; `og:image` present with width 1200 and height 630; `/llms.txt` returns 200 `text/plain`.
- [x] `accessibility.spec.ts`: axe (serious/critical = 0) on all pages above plus Contact with errors, a product of each status group, and 404.
- [x] `journeys.spec.ts`: keyboard-only path (skip link → header → grid tile focus opens card → Enter → product page → Contact link → fill → submit → success, all with `keyboard`); reduced motion (`reducedMotion: 'reduce'`: hero shows no progress animation and does not advance after 6 s; hover card opens without `clip-path` animation); smoke Home → product → "Đặt mua" → prefilled Contact → submit → success.
- [x] Fix every failure found; commit fixes separately with their own `[FIX]` messages.
- [x] Commit `[TASK] Add SEO, journey, and full-site accessibility checks`.

### Task 7: Performance pass

**Files:** Add devDependency `lighthouse@13.5.0`; create `scripts/perf/run.mjs`; modify `package.json` (`"perf": "pnpm build && node scripts/perf/run.mjs"`), `.gitignore` if needed; output `docs/reports/lighthouse-p4-2026-10-<dd>/`.

**Interfaces:** `run.mjs` starts `pnpm start --port 3102` (own process group, like `scripts/evidence/capture.mjs`), launches Playwright's Chromium via `chrome-launcher` with `chromePath`, runs Lighthouse mobile (`formFactor: 'mobile'`, default throttling) on `/`, `/products/hoang-hon-01`, `/contact`, `/policy/privacy`, writes `<page>.report.html` and `summary.json`, prints a table (Performance, LCP, CLS, TBT, Accessibility, Best Practices, SEO) and exits non-zero when a budget fails.

- [x] Baseline run; record the table.
- [x] Fix reported opportunities that apply (LCP element `preload`, font loading, unused JS, image sizing); one `[ENHANCE]` commit per fix.
- [x] Final run meets all budgets on all four pages; commit the report folder `[DOCS] Add P4 Lighthouse report`.
- [x] Commit tooling `[CHORE] Add pnpm perf with Lighthouse`.

### Task 8: Docs, evidence, PR

- [x] Docs: `docs/decisions/README.md` ADR-007 (static CSP without nonce; Lighthouse devDependency); `docs/architecture/tech-stack.md` lists Lighthouse; roadmap P4 → `IN REVIEW`.
- [ ] Evidence scenarios (PNG, opened directly by URL): `/icon.svg`, `/apple-icon`, `/opengraph-image`, two product OG images, 404 desktop and mobile; Lighthouse summary table in the PR body. The error page has no screenshot (no test-only route is added to trigger it); its component test is listed under Known gaps.
- [ ] Full suite (`typecheck`, `lint`, `format:check`, `test`, `build`, `test:e2e`, `perf`), push, PR, `pnpm evidence:publish`, CI.

## P4 Acceptance (gate for P5)

- [ ] Lighthouse mobile budgets met on the four pages (report committed).
- [ ] Zero serious/critical axe issues on every page listed in Task 6.
- [ ] SEO criteria 1–18 and 20 pass their checks; 19 moved to P9.
- [ ] Smoke, keyboard and reduced-motion journeys green; CI green; evidence in the PR.
- [ ] Owner: checks the preview on own iOS and Android phones; approves the OG images.
- [ ] Owner merged the PR; roadmap P4 = `DONE`.

## Implementation notes (2026-10-23)

Deviations from the plan:

- Next 16.4 error components receive `retry`, not `reset`; the error pages and their tests use `retry`.
- Lighthouse reports the median of 3 runs per page (the plan assumed one run), because single mobile runs varied by several hundred ms of LCP.
- Home Lighthouse SEO is 91, a known gap: Home's `generateMetadata` reads `searchParams`, so Next streams metadata for non-bot user agents. HTML-limited bots and Googlebot get it in `<head>`. Changing `htmlLimitedBots` could change this site-wide.
- Zod moved out of the client bundle (`lib/leads/purposes.ts`, plus `z.config({ jitless: true })`).
- Motion animation features load lazily (`LazyMotion` strict, `components/motion/features.ts`).
- Journeys use distinct `x-forwarded-for` values to get separate in-memory rate-limit buckets.
- No `BreadcrumbList` structured data (P4-4).
