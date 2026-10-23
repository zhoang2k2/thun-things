# P4 Quality Hardening (MVP) — Design

**Date:** 2026-10-23
**Builds on:** [`2026-10-23-ui-direction-v3-design.md`](./2026-10-23-ui-direction-v3-design.md) (DR-1, DR-2), [`2026-10-23-p2-catalog-grid-design.md`](./2026-10-23-p2-catalog-grid-design.md), [`2026-10-23-p3-contact-forms-design.md`](./2026-10-23-p3-contact-forms-design.md)
**Roadmap:** P4 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Goal

Make the single-locale (Vietnamese) site MVP-ready without new features: mobile performance budgets met, no serious accessibility issues, proper error pages, icons and share images, search-engine basics (the 20 SEO criteria below), security headers, and a smoke test of the buying path.

## Owner decisions [USER, 2026-10-23]

| ID   | Decision                                                                                                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P4-1 | **Favicon and Open Graph images are typographic placeholders** made by the agent (no logo yet): wordmark "THUN THINGS" in Bricolage Grotesque; swapped for real brand assets later by file only. |
| P4-2 | **Add Lighthouse as a devDependency** with a `pnpm perf` script; reports are committed under `docs/reports/`.                                                                                    |
| P4-3 | The 20 SEO criteria below are **P4 acceptance criteria** (except #19).                                                                                                                           |
| P4-4 | **No visible breadcrumb** on product pages, so no `BreadcrumbList` structured data either (structured data must match visible content).                                                          |
| P4-5 | **Google Search Console verification moves to P9** (it needs the real domain); DNS verification is recommended, no code change.                                                                  |
| P4-6 | `llms.txt` is generated from the catalog and copy (confirmed at spec review).                                                                                                                    |

## 1. Icons, manifest, share images

- `app/icon.svg`: black "T" on white with one accent bar, square corners (DR-1). `app/apple-icon.tsx` renders the same mark as a 180×180 PNG through `next/og`.
- `app/manifest.ts`: name, short name, `display: browser`, white background, ink theme colour, the icons above.
- `app/opengraph-image.tsx` (default, 1200×630): white canvas, large "THUN THINGS" wordmark like the footer, the site description in small type.
- `app/products/[slug]/opengraph-image.tsx`: one image per product (generated statically with the product params): name, price, status label, a framed slot that later shows the product photo.
- Font: the Bricolage Grotesque TTF (SIL Open Font License) is committed under `assets/fonts/` so image generation needs no network access at build time.
- `twitter: { card: 'summary_large_image' }` is added to `buildMetadata`; file-convention images attach `og:image` automatically.

## 2. SEO acceptance criteria

Each item lists its meaning (for the owner), what P4 does, and how it is verified.

| #   | Criterion                    | Meaning                                                                                                                                                               | P4 work                                                                                                                               | Verified by                                                                                       |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Build sitemap.xml            | A list of every public URL so search engines find all pages.                                                                                                          | Exists since P1; recheck contents.                                                                                                    | Test: all public pages and every product listed; no `noindex` page listed.                        |
| 2   | Add robots.txt               | Tells crawlers what they may fetch and where the sitemap is.                                                                                                          | Exists; allow all, point to the sitemap.                                                                                              | Test of `/robots.txt` content.                                                                    |
| 3   | Remove noindex tags          | `noindex` keeps a page out of search results; a stray one hides a real page.                                                                                          | No public page carries `noindex`; only `/contact/sent` and `/contact/retry` do, on purpose. Vercel adds `noindex` to previews.        | Test: public pages without `noindex`, the two result pages with it.                               |
| 4   | Add canonical tags           | Declares the main URL so variants (`/?page=1`, query strings) are not treated as duplicates.                                                                          | Present per page; fix pagination (`/?page=n` canonical to itself, page 1 to `/`) and Contact with `?product=` (canonical `/contact`). | Test: canonical for Home, page 2, a product, Contact with a query.                                |
| 5   | Add meta titles              | The title shown in search results and the browser tab.                                                                                                                | Unique title per page, `X · Thun Things`.                                                                                             | Test: every page has a title, all unique.                                                         |
| 6   | Add meta descriptions        | The snippet under the title in search results.                                                                                                                        | Unique description per page; products use their own description.                                                                      | Test: present, unique, 50–160 characters.                                                         |
| 7   | Use one H1 per page          | One main heading per page tells search engines and screen readers the page topic.                                                                                     | Audit and fix.                                                                                                                        | E2E: exactly one `h1` on every page.                                                              |
| 8   | Fix heading order            | Headings do not skip levels (h1 → h3).                                                                                                                                | Audit and fix.                                                                                                                        | E2E: no skipped levels on every page.                                                             |
| 9   | Add alt text to images       | Text alternative for images: screen readers and image search.                                                                                                         | The catalog schema already requires `alt`; audit the rest.                                                                            | axe `image-alt` on every page.                                                                    |
| 10  | Add schema markup            | JSON-LD structured data so search engines understand the shop, products, prices and availability.                                                                     | `Organization` + `WebSite` on Home; `Product` with an `Offer` on product pages (see mapping below).                                   | Unit test of the generated JSON; owner runs Google's Rich Results Test at P9.                     |
| 11  | Add internal links           | Links between pages help crawlers reach every page and signal importance.                                                                                             | Header, footer and related products already link; no breadcrumb (P4-4).                                                               | E2E: every product page links to Home and to at least one other product.                          |
| 12  | Fix broken links             | Links that return 404 hurt users and crawling.                                                                                                                        | Add a crawler test.                                                                                                                   | E2E: every internal link on every sitemap page returns 200.                                       |
| 13  | Compress images              | Heavy images slow pages down.                                                                                                                                         | `next/image` serves resized WebP/AVIF; enable AVIF in `next.config.ts`. Real photos arrive at P9.                                     | Lighthouse shows no image-size or format opportunities.                                           |
| 14  | Optimize Core Web Vitals     | Google's speed signals: LCP (main content loads), INP (response to taps), CLS (layout does not jump).                                                                 | `pnpm perf` baseline, fix what it reports, re-measure.                                                                                | Lighthouse mobile: LCP < 2.5 s, CLS < 0.1, Total Blocking Time < 200 ms (lab stand-in for INP).   |
| 15  | Fix mobile layout            | Search engines rank the mobile version (mobile-first).                                                                                                                | Check at 360 px and 390 px.                                                                                                           | E2E: no horizontal scroll on any page at 360/390 px; owner checks on own phones.                  |
| 16  | Enforce HTTPS                | All traffic encrypted.                                                                                                                                                | Vercel already redirects HTTP to HTTPS; add HSTS.                                                                                     | Test of the HSTS header; verified on the real domain at P9.                                       |
| 17  | Clean up URL slugs           | Short, readable URLs without diacritics, e.g. `/products/hoang-hon-01`.                                                                                               | Already enforced by the catalog schema (kebab-case).                                                                                  | Test: every slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`.                                              |
| 18  | Add an Open Graph image      | The picture shown when a link is shared on Facebook, Zalo, Messenger.                                                                                                 | Section 1 (P4-1).                                                                                                                     | Test: `og:image` present at 1200×630 on Home and products; owner approves the images in evidence. |
| 19  | Verify Google Search Console | Google's free tool to see indexing status and errors and to submit the sitemap.                                                                                       | **Moved to P9** (P4-5).                                                                                                               | Not part of P4 acceptance.                                                                        |
| 20  | Add llms.txt                 | A Markdown summary at `/llms.txt` written for AI assistants (llmstxt.org, a 2024 community proposal, not an official search standard; Google Search does not use it). | Route generated from copy and catalog: shop summary, products with price and status, links to policies and Contact (P4-6).            | Test: `/llms.txt` returns 200 as `text/plain` and lists every product and the key pages.          |

**Product availability mapping (criterion 10):** `available`, `limited` → `InStock`; `sold_out` → `OutOfStock`; `preorder` → `PreOrder`; `coming_soon` → `PreSale`. Each value states the real status (R-01); price in `VND`.

**JSON-LD rendering:** one `JsonLd` server component writes `<script type="application/ld+json">` with `<` escaped as `<` so catalog text can never close the tag.

## 3. Error pages

- `app/not-found.tsx`: site-styled 404 with a heading, one line of copy, links to Home and Contact; real 404 status (already ensured by `proxy.ts` for products and static routes elsewhere).
- `app/error.tsx` (client, required by Next) and `app/global-error.tsx`: short message and a "Thử lại" button calling `reset()`; error details are never shown.
- Copy in `content/copy/vi.ts`.

## 4. Security headers

Set for every route in `next.config.ts` `headers()`:

- **Content-Security-Policy (static, no nonce):** `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data: blob:`; `font-src 'self'`; `connect-src 'self'`; `frame-ancestors 'none'`; `form-action 'self'`; `base-uri 'self'`; `object-src 'none'`; `upgrade-insecure-requests`. Development adds `'unsafe-eval'`. Previews (`VERCEL_ENV=preview`) add `https://vercel.live` (script, connect, frame, img) for the Vercel toolbar.
- **Why no nonce:** nonces require rendering every request dynamically, which would drop the prerendered shells (Cache Components). Inline scripts emitted by Next are the reason `'unsafe-inline'` stays; everything else is locked to the site's origin.
- Also: `Strict-Transport-Security: max-age=63072000; includeSubDomains` (no `preload`, which is hard to undo), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`.
- The CSP is built in `lib/security/csp.ts` (pure, unit-tested). P6 (GA4) extends it with Google's domains.

## 5. Performance

- `pnpm perf`: builds, starts the app on a dedicated port, runs Lighthouse (mobile preset) on Home, a product page, Contact and the privacy policy, writes HTML and JSON reports to `docs/reports/lighthouse-p4-<date>/` and prints a summary table.
- Process: baseline → fix the reported opportunities (LCP element priority, font loading, unused JavaScript, image sizing) → re-measure; the summary table goes into the PR.
- Images are still placeholders, so P4 numbers do not reflect real photos; the roadmap adds a re-measure to P9.

## 6. Accessibility and tests

- axe (WCAG 2.2 AA tags, no serious or critical issues) on every page: Home, page 2, a product of each status group, Contact (empty, prefilled, with errors), `/contact/sent`, `/contact/retry`, both policies, About, 404.
- E2E keyboard-only path: skip link → header → grid tile (card opens on focus) → product page → Contact form filled and submitted.
- E2E reduced motion (`reducedMotion: 'reduce'`): hero does not autoplay; hover card opens without the circle reveal.
- E2E smoke: Home → product page → "Đặt mua" → Contact prefilled → submit → success (memory sink).
- SEO checks from section 2 live in one Playwright spec plus unit tests for JSON-LD, CSP and `llms.txt`.

## Evidence

Favicon and apple icon, default and product OG images (for owner approval), 404 and error pages, Lighthouse summary table; no GIFs (no new interaction).

## Out of scope

i18n and `hreflang` (P5), GA4 and the consent banner (P6), real photos, domain, Search Console (P9), HTML lead emails (P9).
