# P2 — Catalog, Hero, Product Grid, Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Home shows the banner slideshow and a paginated image-only product grid with the hover card and glass layer; every product has a detail page; all data is typed mock data and all images are V-26 placeholders.

**Architecture:** Catalog is a Zod-validated in-repo dataset behind `lib/catalog/index.ts`. Pages are Server Components; interactive pieces (`HeroSlideshow`, `ProductGrid` tiles, glass layer) are small Client Components fed serialisable view models. Status → badge/action rules live in one pure module.

**Tech Stack:** Next.js 16.4 (Cache Components, PPR, `proxy.ts`), React 19, Zod 4, `motion`, Tailwind v4, Hugeicons, Vitest + RTL, Playwright, `gifenc` + `pngjs` (evidence only).

**Spec:** [`../specs/2026-10-23-p2-catalog-grid-design.md`](../specs/2026-10-23-p2-catalog-grid-design.md), [`../specs/2026-10-23-ui-direction-v3-design.md`](../specs/2026-10-23-ui-direction-v3-design.md).

**Branch / PR:** `phase/p2-catalog-grid` → one PR into `develop`, evidence per the `git-pr-workflow` skill.

## Global Constraints

- DR-1 / DR-2 and `tests/design-rules.test.ts` stay green; curves only under `components/**/glass/`.
- UI reads catalog data only through `lib/catalog/index.ts`; strings from `content/copy/vi.ts`; images only through `MediaImage`.
- `'use client'` only on `HeroSlideshow`, `ProductGrid` (and its tiles), `GlassLayer`.
- Animate `transform`/`opacity` only (the glass blob's radius morph is the sanctioned exception); honour `prefers-reduced-motion`.
- Read the installed Next docs for `proxy.ts`, `searchParams` under Cache Components, and `generateStaticParams` before writing those files.

## Review Focus

1. **Edge-column card overflow:** hovering a first- or last-column tile must not create horizontal scroll. Pinned by Task 5 e2e `edge tiles do not overflow the viewport`.
2. **Bad `?page=` values:** `0`, `-1`, `abc`, `99` render page 1 or the last page, never an error. Pinned by Task 1 unit tests and Task 4 e2e.
3. **Unknown product slug:** `/products/nope` returns status 404. Pinned by Task 6 e2e.
4. **Touch double-tap:** the first tap must not navigate. Pinned by Task 5 test `first touch tap opens the card without navigating`.
5. **Autoplay respect:** reduced motion starts paused; pause stops advancing. Pinned by Task 3 tests.

---

### Task 0: Docs

- [x] Roadmap: P1 `DONE` (#2, owner decision P2-6), P2 `IN PROGRESS`, P2 section links spec and plan, Vercel preview moved to P2 acceptance. Commit spec + plan + roadmap: `[DOCS] Add P2 spec and plan`.

### Task 1 (BE): Catalog schema, mock data, data access, status rules

**Files:** Create `lib/catalog/schema.ts`, `lib/catalog/data.ts`, `lib/catalog/index.ts`, `lib/catalog/status.ts`, `lib/catalog/format.ts`, tests `lib/catalog/*.test.ts`.

**Interfaces (Produces):**

- Schema (Zod, types inferred): `localeSchema = z.enum(['vi','en'])`; `localizedSchema = z.object({ vi: z.string().min(1), en: z.string().min(1) })`; `productStatusSchema = z.enum(['available','limited','sold_out','coming_soon','preorder'])`; `imageAssetSchema = { src?: string, width: int>0, height: int>0, alt: Localized }`; `productSchema` per spec §9 + `care?`; `catalogSchema = z.array(productSchema)` with refinements "unique id", "unique slug". Types `Product`, `ProductStatus`, `ImageAsset`, `Localized`.
- `data.ts`: `rawProducts: unknown[]` — 24 products, all five statuses (≥ 3 each), prices 290000–450000 step 10000, colours from a shared palette, 4:5 images 1600×2000 without `src`.
- `index.ts`: `PAGE_SIZE = 20`; `listProducts(pageParam?: string | string[]): { items: Product[]; page: number; pageCount: number; total: number }`; `getProductBySlug(slug: string): Product | undefined`; `getAllSlugs(): string[]`; `getRelatedProducts(product: Product, limit = 4): Product[]` (excludes itself; shares a colour id first; then catalog order). Module parses `rawProducts` with `catalogSchema` at load.
- `status.ts`: `type StatusPresentation = { label: string; tone: BadgeTone; action?: { label: string; purpose: 'order' | 'notify' } }`; `presentStatus(status: ProductStatus): StatusPresentation` per the spec table; `contactHref(slug: string, purpose: 'order' | 'notify'): string`.
- `format.ts`: `formatPriceVND(value: number): string` via `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.

- [x] Tests first: schema accepts a valid product and a product without `src`; rejects non-integer/negative price and unknown status; catalog rejects duplicate slug; mock data parses, has 24 items and every status; `listProducts()` → 20 items, page 1, pageCount 2; `listProducts('2')` → 4 items; `'0'`, `'-1'`, `'abc'` → page 1; `'99'` → page 2; `getRelatedProducts` excludes self, returns 4, same-colour first; `presentStatus` matrix for all 5 statuses; `contactHref('a','order') === '/contact?product=a&purpose=order'`; `formatPriceVND(350000)` matches `/^350\.000\s₫$/`.
- [x] Run → FAIL; implement; run → PASS; lint, typecheck.
- [x] Commit `[FEATURE] Add typed catalog with mock data and status rules`.

### Task 2 (FE): Media fill mode, status badge, message action

**Files:** Modify `components/media/MediaImage.tsx` (+ test), `components/media/ImagePlaceholder.tsx`, `config/site.ts`, `content/copy/vi.ts`. Create `components/product/StatusBadge.tsx`, `components/product/ProductAction.tsx` (+ tests).

**Interfaces:**

- `MediaImage` gains `fill?: boolean` → `next/image` `fill` + `object-cover`; placeholder `h-full w-full` (no aspect style).
- `siteConfig.chatChannel?: { label: string; href: string }` (undefined).
- `StatusBadge({ status })` → `Badge` with `presentStatus` label/tone.
- `ProductAction({ slug, status, size? })` → `null` for `sold_out`; else a link styled with `buttonClasses()` to `chatChannel.href` (new tab, `noopener`) or `contactHref(slug, purpose)`.

- [x] Tests: placeholder fills its box in `fill` mode; `StatusBadge` label per status; `ProductAction` renders nothing for `sold_out`, label "Hỏi trước" + `purpose=notify` for `coming_soon`, "Đặt mua" + `purpose=order` for `available`.
- [x] Implement; checks; commit `[FEATURE] Add status badge and product action`.

### Task 3 (FE): Hero slideshow

**Files:** Create `content/banners.ts`, `components/home/HeroSlideshow.tsx` (+ test).

**Interfaces:** `Banner = { id: string; desktop: ImageAsset; mobile: ImageAsset }`; `banners: Banner[]` (4). `HeroSlideshow({ banners, intervalMs = 5000 })` client: state `index`, `playing` (initial `!prefersReducedMotion`); timer advances when playing; progress bars are `<button aria-label="Banner i / n" aria-current>`; active bar fills via CSS keyframe of `scaleX` over `intervalMs` (restarts per slide, paused state freezes it); text toggle "Tạm dừng" / "Tiếp tục"; `section aria-roledescription="carousel" aria-label="Banner"`; inactive slides `aria-hidden` + `inert`; desktop/mobile assets swapped by `md:` visibility; height `h-[70vh]`.

- [x] Tests (fake timers, `matchMedia` stub): renders 4 bars; advances to banner 2 after 5000 ms; pause stops advancing; clicking bar 3 shows banner 3; reduced motion → starts paused.
- [x] Implement; checks; commit `[FEATURE] Add hero banner slideshow`.

### Task 4 (FE): Product grid, pagination, home wiring

**Files:** Create `components/product/ProductGrid.tsx`, `components/product/ProductTile.tsx`, `components/product/Pagination.tsx`, `components/product/ProductGridSkeleton.tsx` (+ tests). Modify `app/page.tsx`.

**Interfaces:** `ProductCardModel = { id; slug; name: string; priceLabel: string; status: ProductStatus; image: ImageAsset }` + `toCardModel(product: Product): ProductCardModel` in `lib/catalog/index.ts`. `ProductGrid({ products: ProductCardModel[] })` client; `ProductTile` renders `<li>` with a `Link` to `/products/<slug>` named by the product name, image only. `Pagination({ page, pageCount })` server: `nav aria-label="Phân trang"`, hidden when `pageCount < 2`. Home: `HeroSlideshow` + `<Suspense fallback={<ProductGridSkeleton />}>` around an async section that awaits `searchParams` and calls `listProducts`.

- [x] Tests: grid renders one link per product with accessible names; pagination marks the current page, page 1 → `/`, page 2 → `/?page=2`, "Trước" absent on page 1, nothing rendered for 1 page.
- [x] Implement; checks; build; commit `[FEATURE] Add paginated image-only product grid`.

### Task 5 (FE): Hover card and glass layer

**Files:** Create `components/product/ProductHoverCard.tsx`, `components/product/glass/GlassLayer.tsx`, `components/product/glass/glass.css` (global stylesheet imported by the component; CSS Modules do not work with the Turbopack Tailwind rule); modify `ProductGrid`, `ProductTile` (+ tests).

**Interfaces:** grid-level state `{ activeId, origin: { x, y }, rect }` in `ProductGrid`; tile handlers `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` (focus leaving the tile), `onKeyDown` (Escape), touch: `onPointerDown` records `pointerType`, `onClick` prevents navigation when the card is closed and the pointer is touch. `ProductHoverCard({ product, origin, align: 'start' | 'center' | 'end' })` renders the print-frame card (image section reuses `MediaImage`, name, price, `StatusBadge`, `ProductAction`). `align` is `start` on the first column, `end` on the last. `GlassLayer({ rect, origin, open })` positions one blob behind the card.

- [x] Tests: hover opens a card containing name, price, badge; `sold_out` card has no action link; focusing the tile link opens the card and `Escape` closes it; `first touch tap opens the card without navigating` (click default prevented on first touch tap, not on the second).
- [x] Implement; checks; visual check of frames; commit `[FEATURE] Add hover card with glass layer`.

### Task 6 (FE + BE): Product detail page and real 404

**Files:** Create `app/products/[slug]/page.tsx`, `components/product/ProductGallery.tsx`, `components/product/ProductInfo.tsx`; modify `proxy.ts` (create), `lib/seo/routes.ts` (sitemap includes product paths), `app/sitemap.test.ts`.

**Interfaces:** `generateStaticParams = () => getAllSlugs().map((slug) => ({ slug }))`; `generateMetadata` via `buildMetadata` (title = product name, path `/products/<slug>`); page renders gallery + sticky info + related grid (`getRelatedProducts`). `proxy.ts`: matcher `/products/:slug`; unknown slug → 404 response before rendering.

- [x] Tests: sitemap includes 24 product URLs; `ProductInfo` shows notify link for `sold_out` and action for others.
- [x] Implement; build lists 24 product routes; commit `[FEATURE] Add product detail page with real 404`.

### Task 7: Evidence tooling, e2e, docs, PR

**Files:** Create `scripts/evidence/capture.mjs`, `scripts/evidence/publish.mjs`, `scripts/evidence/scenarios.mjs`, `e2e/catalog.spec.ts`; modify `package.json` (scripts `evidence`, `evidence:publish`; dev deps `gifenc`, `pngjs`), `.gitignore` (`/evidence-out/`), `.agents/skills/git-pr-workflow/SKILL.md` (use `pnpm evidence`), roadmap, this plan, `docs/architecture/tech-stack.md`.

- [x] E2E: home shows 20 tiles, `/?page=2` shows 4, `/?page=abc` shows 20; hovering a tile shows the card with price; `edge tiles do not overflow the viewport` (hover first and last column tiles → `scrollWidth <= clientWidth`); keyboard Tab to a tile opens the card; product page renders `h1`; `/products/nope` → 404; axe on `/`, `/?page=2`, one product page.
- [x] `pnpm evidence` scenarios: hero autoplay + pause; grid hover card (desktop); keyboard card; mobile tap card; pagination; product page desktop/mobile; 404.
- [x] Full suite; open PR with evidence; wait for CI.

## P2 Acceptance (gate for P3)

- [ ] CI green; evidence table in the PR.
- [x] Hover card works by pointer, keyboard, touch; no horizontal scroll from edge tiles.
- [ ] No CLS from hero or card; reduced motion respected.
- [ ] Vercel preview reachable (carried over from P1, owner task).
- [ ] Owner merged the PR; roadmap P2 = `DONE`.
