# P2 Catalog, Hero, Product Grid, Product Detail — Design

**Date:** 2026-10-23
**Builds on:** [`2026-10-23-ui-direction-v3-design.md`](./2026-10-23-ui-direction-v3-design.md) (V-07 → V-26, DR-1, DR-2)
**Roadmap:** P2 in [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Owner decisions for P2 [USER, 2026-10-23]

| ID    | Decision                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-1  | Use **mock data typed exactly like the catalog schema**; all images render the V-26 placeholder.                                                                                                                                                                                            |
| P2-2  | **24 mock products** (2 pages of 20 + 4).                                                                                                                                                                                                                                                   |
| P2-3  | Mock content **looks real**: Vietnamese names and descriptions with character, real VND prices (290.000–450.000 ₫).                                                                                                                                                                         |
| P2-4  | Hover card is **about 1.3× the cell**. _Superseded by P2-9._                                                                                                                                                                                                                                |
| P2-5  | Card button label **depends on status** (table below).                                                                                                                                                                                                                                      |
| P2-6  | P1 counts as DONE on merge; the Vercel preview check moves to P2 acceptance.                                                                                                                                                                                                                |
| P2-7  | Card action button is **large (48px) and spans the card width**.                                                                                                                                                                                                                            |
| P2-8  | **Mobile grid is one column**; cells are narrower than the screen (16px gutters) so the open card spans the full width. Desktop gets the same 16px gutters so edge cards fit without moving their image.                                                                                    |
| P2-9  | **The image never moves or resizes.** The card (16px print frame, 8-point spacing) is revealed around it by a **circle spreading from the pointer entry point**, as if the image were lifted into the card; it never pushes other cells. Replaces P2-4 (1.3× card) and the edge-shift rule. |
| P2-10 | **Mobile product page:** swipeable image carousel with a `01 / 04` counter, info directly below, and an order bar pinned to the bottom of the screen.                                                                                                                                       |

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

- **Hero slideshow (V-08):** 4 mock banners (desktop 2400×1350, mobile 1080×1350, placeholders), 70vh, cross-fade, auto-advance 5 s; square progress bars (one per banner, the active one fills over 5 s) that also jump to a banner; a text pause/play control. `prefers-reduced-motion`: starts paused, no cross-fade. Exposed as a carousel region with labelled slides; inactive slides are hidden from assistive tech. The progress bars and pause control sit in a caption-like row **under** the image (ink on canvas) rather than over it, so they stay legible and pass contrast on any banner.
- **Grid (V-09, V-10):** directly under the hero; 1 column on mobile, 4 from `md`; no gaps between cells; 16px side gutters (P2-8); 4:5 images only. Page from `?page=` (missing, non-numeric, or < 1 → page 1; beyond the last → last page). Read inside `<Suspense>` (Cache Components) with a skeleton of the same size.
- **Pagination:** numbered links plus "Trước" / "Sau" text links, `aria-current="page"`, page 1 links to `/`; hidden when there is one page.

## Hover card (V-14 → V-20)

- **Geometry (P2-9):** the card image sits exactly over the cell image (same image, same size, same position). A 16px photo-print frame surrounds it (1px border + 15px padding) and the info area below holds the name, a price + status row, and a full-width 48px action (P2-7), spaced on the 8-point grid. The card is positioned absolutely, so no other cell moves; the 16px gutters keep edge cards on screen.
- **Opening (P2-9):** the image stays still; the card is revealed by `clip-path: circle()` growing from the pointer entry point (keyboard: the centre) and shrinks back on close. Reduced motion: fade only. Uses `components/motion/tokens.ts`.
- **Input:** mouse hover opens and leaving closes; focus within the tile opens and focus leaving closes; `Escape` closes; touch: first tap opens, second tap follows the link.
- **Glass layer (V-25): removed [USER, 2026-10-23].** Nothing renders behind the open card; see the UI v3 spec for the reason.

## Product detail page (V-11, V-22)

- Route `/products/[slug]`, one per catalog product (`generateStaticParams`).
- Unknown slugs must return a **real 404**. Under Partial Prerendering a dynamic segment streams `200` before `notFound()` runs (seen in P1), so `proxy.ts` rejects slugs not in the catalog before rendering.
- Desktop: left column of stacked images (front, back, lifestyle), right sticky info column: name (`h1`), price, badge, status note, action or notify-me link, sizes, material, care, description. **Mobile (P2-10):** swipeable snap carousel with a `01 / 04` counter, info directly below, and an order bar (price + action, or notify-me for sold-out) fixed to the bottom of the screen; the in-page action is hidden on mobile to avoid duplicates.
- Related products: 4 others, same colour first, rendered with the same grid and hover card.

## Evidence tooling

`pnpm evidence` captures scripted Playwright scenarios into GIFs (≤ 15 s) and PNGs (1440 / 390 px) under a git-ignored folder; `pnpm evidence:publish <pr>` commits them to the `evidence` branch (`pr-<n>/`) with git plumbing. GIF encoding uses small pure-JS dev dependencies (`gifenc`, `pngjs`), no system ffmpeg.

## Out of scope

Real images and product data (owner, before P9), contact and notify-me forms (P3), custom cursor (backlog), i18n (P5), analytics (P6).
