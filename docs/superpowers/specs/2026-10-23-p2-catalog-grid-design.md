# P2 Catalog, Hero, Product Grid, Product Detail — Design

**Date:** 2026-10-23
**Builds on:** [`2026-10-23-ui-direction-v3-design.md`](./2026-10-23-ui-direction-v3-design.md) (V-07 → V-26, DR-1, DR-2)
**Roadmap:** P2 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Owner decisions for P2 [USER, 2026-10-23]

| ID   | Decision                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------- |
| P2-1 | Use **mock data typed exactly like the catalog schema**; all images render the V-26 placeholder.                    |
| P2-2 | **24 mock products** (2 pages of 20 + 4).                                                                           |
| P2-3 | Mock content **looks real**: Vietnamese names and descriptions with character, real VND prices (290.000–450.000 ₫). |
| P2-4 | Hover card is **about 1.3× the cell**.                                                                              |
| P2-5 | Card button label **depends on status** (table below).                                                              |
| P2-6 | P1 counts as DONE on merge; the Vercel preview check moves to P2 acceptance.                                        |

## Catalog model

Follows `thun-things.md` §9 field for field, as a Zod schema in `lib/catalog/schema.ts`. Two documented deviations:

- `ImageAsset.src` is **optional**: absent means "render the V-26 placeholder". Real images fill it later without touching UI code.
- `Product.care?: Localized` is added (owner listed care instructions as product data).

Localized fields keep both `vi` and `en` now so P5 needs no data migration; P2 renders `vi`.

Validation runs when the catalog module loads: the build fails on any schema error, duplicate `id`, or duplicate `slug`.

## Status presentation

| Status        | Badge (tone)               | Card / PDP action | Contact `purpose` |
| ------------- | -------------------------- | ----------------- | ----------------- |
| `available`   | Còn hàng (neutral)         | **Đặt mua**       | `order`           |
| `limited`     | Số lượng giới hạn (accent) | **Đặt mua**       | `order`           |
| `preorder`    | Đặt trước (accent)         | **Đặt trước**     | `order`           |
| `coming_soon` | Sắp ra mắt (neutral)       | **Hỏi trước**     | `notify`          |
| `sold_out`    | Hết hàng (muted)           | none — badge only | —                 |

The action opens the chat channel from `config/site.ts` when the owner sets one; until then it links to `/contact?product=<slug>&purpose=<purpose>` (V-20). On the product detail page a `sold_out` product shows a **"Báo khi có hàng"** link to `/contact?product=<slug>&purpose=notify` in the notify-me slot; P3 replaces it with the in-page form (V-22).

## Home

- **Hero slideshow (V-08):** 4 mock banners (desktop 2400×1350, mobile 1080×1350, placeholders), 70vh, cross-fade, auto-advance 5 s; square progress bars (one per banner, the active one fills over 5 s) that also jump to a banner; a text pause/play control. `prefers-reduced-motion`: starts paused, no cross-fade. Exposed as a carousel region with labelled slides; inactive slides are hidden from assistive tech.
- **Grid (V-09, V-10):** directly under the hero; 2 columns on mobile, 4 from `md`; no gaps; 4:5 images only. Page from `?page=` (missing, non-numeric, or < 1 → page 1; beyond the last → last page). Read inside `<Suspense>` (Cache Components) with a skeleton of the same size.
- **Pagination:** numbered links plus "Trước" / "Sau" text links, `aria-current="page"`, page 1 links to `/`; hidden when there is one page.

## Hover card (V-14 → V-20, V-25)

- **Geometry:** the card image sits exactly over the cell image (same image, same size); a photo-print white frame grows around it — about 15% of the cell width at the sides and top, a deeper bottom margin with name, price, badge, and action — so the card is ~1.3× the cell. Cards on the first or last column are shifted inward so nothing leaves the viewport (no horizontal scroll).
- **Opening:** scale + fade from the pointer's entry point (`transform-origin` at the pointer); keyboard focus opens from the centre. Uses `components/motion/tokens.ts`.
- **Input:** mouse hover opens and leaving closes; focus within the tile opens and focus leaving closes; `Escape` closes; touch: first tap opens, second tap follows the link.
- **Glass layer:** one shared element per grid, behind the open card and above the other cells; an organic curved blob about 1.8× the card, `backdrop-filter: blur`, spreads from the pointer on open, retracts on close, drifts and morphs continuously while open. Lives in `components/**/glass/` (the only place DR-1 allows curves). Reduced motion: no drift or spread, fade only. No `backdrop-filter`: flat translucent white.

## Product detail page (V-11, V-22)

- Route `/products/[slug]`, one per catalog product (`generateStaticParams`).
- Unknown slugs must return a **real 404**. Under Partial Prerendering a dynamic segment streams `200` before `notFound()` runs (seen in P1), so `proxy.ts` rejects slugs not in the catalog before rendering.
- Desktop: left column of stacked images (front, back, lifestyle), right sticky info column: name (`h1`), price, badge, status note, action or notify-me link, sizes, material, care, description. Mobile: single column, images first.
- Related products: 4 others, same colour first, rendered with the same grid and hover card.

## Evidence tooling

`pnpm evidence` captures scripted Playwright scenarios into GIFs (≤ 15 s) and PNGs (1440 / 390 px) under a git-ignored folder; `pnpm evidence:publish <pr>` commits them to the `evidence` branch (`pr-<n>/`) with git plumbing. GIF encoding uses small pure-JS dev dependencies (`gifenc`, `pngjs`), no system ffmpeg.

## Out of scope

Real images and product data (owner, before P9), contact and notify-me forms (P3), custom cursor (backlog), i18n (P5), analytics (P6).
