# UI Direction v3 — Design

**Date:** 2026-10-23
**Status:** Approved by owner in chat (2026-10-23) [USER]
**Supersedes:** "UI Direction v2" (D-16 to D-26, O-01 to O-08) in [`thun-things.md`](../../../thun-things.md) wherever they conflict.
**Roadmap:** [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md)

## Intent

The owner found v2 too generic and its page flow wrong. v3 keeps a white canvas but makes the product grid the center of the site, removes the separate shop page, and puts the "experimental" character into unexpected interactions (the hover card and, later, a custom cursor) rather than scroll choreography.

## Decisions [USER]

Every row was stated or chosen by the owner on 2026-10-23 unless tagged otherwise.

### Identity

| ID   | Decision                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| V-01 | Personality: experimental art, expressed through unexpected interactions.                                       |
| V-02 | Canvas pure white, ink black, one sunset-toned accent (orange / red / yellow family). Exact hex not chosen yet. |
| V-03 | Typeface family: sans grotesk. Exact face not chosen yet.                                                       |
| V-04 | References: Vietnamese local brands and international minimal brands.                                           |

### Layout and pages

| ID   | Decision                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-05 | Header: classic horizontal bar, sticky at the top, white background. Items: logo, About, Contact, VI/EN.                                                                          |
| V-06 | Footer: Policy links, contact email, social links, oversized brand wordmark.                                                                                                      |
| V-07 | Home = hero then product grid directly below. **No separate shop page.**                                                                                                          |
| V-08 | Hero: slideshow of owner-designed banners, about 70% of the viewport height, image only (not clickable), auto-advance every 5 s, 3–5 banners, dot navigation and a pause control. |
| V-09 | Grid: 4 columns × 5 rows = 20 products per page on desktop; numbered pagination (`?page=2`); no filters or sorting; 4:5 portrait images; no gap between cells.                    |
| V-10 | Grid cells show **only the image** by default — no name, no price.                                                                                                                |
| V-11 | Product detail page: image column on the left (stacked, scrolls), info column on the right (sticky). Contains multiple images, size and material, related products.               |
| V-12 | About: one text block + one photo.                                                                                                                                                |
| V-13 | Contact: a separate page with a form. It temporarily handles orders until a chat channel exists.                                                                                  |

### Hover card

| ID   | Decision                                                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-14 | On hover, a card appears over the hovered cell. It **expands from the pointer's entry point**, is **larger than the cell, and overlaps neighbouring cells**.                    |
| V-15 | The cell's image becomes the card's image section: **same image, same size**; the card frame and info grow around and below it.                                                 |
| V-16 | Card content: name, price, status badge, and a "message" button. Statuses `available`, `limited`, `preorder`, `coming_soon` show the button; `sold_out` shows the badge only.   |
| V-17 | Clicking the card opens the product detail page.                                                                                                                                |
| V-18 | Keyboard focus opens the card exactly like hover; Enter opens the product detail page.                                                                                          |
| V-19 | Touch (mobile, 2 columns): first tap opens the card, second tap opens the product detail page.                                                                                  |
| V-20 | The "message" button opens a direct chat channel (Zalo / Messenger / Instagram). No channel exists yet, so it temporarily links to the Contact page with the product prefilled. |

### Status and waitlist

| ID   | Decision                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------- |
| V-21 | Keep all five statuses: `available`, `limited`, `sold_out`, `coming_soon`, `preorder`.         |
| V-22 | "Notify me when back in stock" lives **inside the product detail page** of a sold-out product. |

### Deferred

| ID   | Decision                                                                                      |
| ---- | --------------------------------------------------------------------------------------------- |
| V-23 | Custom cursor: an owner-drawn SVG garment tag attached to the pointer. Low priority; backlog. |
| V-24 | Quiz bot stays as planned (P7–P8). i18n stays at P5; the VI/EN control is hidden until then.  |

### Removed from v2

Pinned scroll-driven hero (D-16, D-17), horizontally draggable grid (D-18), lifestyle clip reveal on hover (D-19, D-19a), card → PDP shared-element transition (D-20, O-06), transparent-to-fixed header (D-25), separate `/shop` page (D-26, O-02).

## Defaults while owner input is pending [PROPOSED]

Agents use these until the owner supplies a value; each lives in one token or config entry so swapping it touches no component code.

| Input            | Default                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Accent colour    | `#FF5A1F` (sunset orange). Text on accent is black (white fails WCAG AA on all three candidates). Alternatives: `#F2361D`, `#FFA51F`. |
| Typeface         | Inter via `next/font/google`, subsets `latin` + `vietnamese`. Alternatives: Space Grotesk, Be Vietnam Pro.                            |
| Logo             | Text wordmark "Thun Things" in the typeface.                                                                                          |
| Contact email    | Unset → hidden in footer.                                                                                                             |
| Social links     | Unset → hidden in footer.                                                                                                             |
| Related products | 4 other products, same colour first.                                                                                                  |

## Spacing and sizing

8-point grid (project skill `8-point-grid`): spacing in multiples of 8 px with a 4 px half-step for icon/text gaps; line-heights in multiples of 4 px. Control heights: 32 / 40 / 48 px; touch targets at least 44 px (mobile controls use 48 px).

## Phase mapping

| Phase   | v3 scope                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1      | Tokens, typeface, motion tokens, sticky header, footer, Button/Badge primitives, `cn()`, copy module, site config, page shells (Home, About, Contact, Policy), metadata, robots, sitemap. |
| P2      | Catalog data layer, hero slideshow, product grid with pagination, hover card, product detail page.                                                                                        |
| P3      | Contact form (order fallback), in-page notify-me form, policy and About content, email sink, rate limit.                                                                                  |
| Backlog | Custom cursor (V-23).                                                                                                                                                                     |
