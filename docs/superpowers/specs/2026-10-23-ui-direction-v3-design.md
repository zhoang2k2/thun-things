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

| ID   | Decision                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| V-01 | Personality: experimental art, expressed through unexpected interactions.                                                          |
| V-02 | Canvas pure white, ink black, one sunset-toned accent (orange / red / yellow family). Exact hex not chosen yet.                    |
| V-03 | Typeface: **Bricolage Grotesque** (sans grotesk, Vietnamese subset), chosen 2026-10-23. Inter is rejected as an "AI default" face. |
| V-04 | References: Vietnamese local brands and international minimal brands.                                                              |

### Layout and pages

| ID   | Decision                                                                                                                                                                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-05 | Header: classic horizontal bar, sticky at the top, white background. Items: logo, About, Contact, VI/EN.                                                                                                                                                                                 |
| V-06 | Footer: Policy links, contact email, social links, oversized brand wordmark.                                                                                                                                                                                                             |
| V-07 | Home = hero then product grid directly below. **No separate shop page.**                                                                                                                                                                                                                 |
| V-08 | Hero: slideshow of owner-designed banners, about 70% of the viewport height, image only (not clickable), auto-advance every 5 s, 3–5 banners, a pause control, and **horizontal progress bars** as navigation (one square-ended bar per banner; the active bar fills over 5 s; no dots). |
| V-09 | Grid: 4 columns × 5 rows = 20 products per page on desktop; numbered pagination (`?page=2`); no filters or sorting; 4:5 portrait images; no gap between cells. Mobile: **1 column**; 16px side gutters on all sizes (P2-8).                                                              |
| V-10 | Grid cells show **only the image** by default — no name, no price.                                                                                                                                                                                                                       |
| V-11 | Product detail page: image column on the left (stacked, scrolls), info column on the right (sticky). Contains multiple images, size and material, related products. Mobile: swipeable image carousel with a `01 / 04` counter, info below, sticky order bar (P2-10).                     |
| V-12 | About: one text block + one photo.                                                                                                                                                                                                                                                       |
| V-13 | Contact: a separate page with a form. It temporarily handles orders until a chat channel exists.                                                                                                                                                                                         |

### Hover card

| ID   | Decision                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V-14 | On hover, a card appears over the hovered cell. It **expands from the pointer's entry point**, is **larger than the cell, and overlaps neighbouring cells**. **The hovered image never moves or resizes and no other cell moves**; the card is revealed around the image by a circle from the pointer (P2-9).                                                |
| V-15 | The cell's image becomes the card's image section: **same image, same size**; the card frame and info grow around and below it. The frame is a **photo-print border**: a white margin around the image with a deeper bottom margin that holds name, price, and status (square corners). Frame: **16px** (8-point grid); full-width 48px action (P2-7, P2-9). |
| V-25 | ~~Glass layer behind the open card~~ **Removed [USER, 2026-10-23]:** the blur blob opened late (shape first, blur after) and felt too large; no layer sits behind the card for now. A pointer-following liquid lens limited to the product grid was discussed and parked.                                                                                    |
| V-16 | Card content: name, price, status badge, and a "message" button. Statuses `available`, `limited`, `preorder`, `coming_soon` show the button; `sold_out` shows the badge only.                                                                                                                                                                                |
| V-17 | Clicking the card opens the product detail page.                                                                                                                                                                                                                                                                                                             |
| V-18 | Keyboard focus opens the card exactly like hover; Enter opens the product detail page.                                                                                                                                                                                                                                                                       |
| V-19 | Touch (mobile, 1 column): first tap opens the card, second tap opens the product detail page. The open card spans the full screen width (P2-8).                                                                                                                                                                                                              |
| V-20 | The "message" button opens a direct chat channel (Zalo / Messenger / Instagram). No channel exists yet, so it temporarily links to the Contact page with the product prefilled.                                                                                                                                                                              |

### Image fallback

| ID   | Decision [USER, 2026-10-23]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-26 | Every image and banner renders through one media component that shows a **dummy placeholder** when no image is supplied: **light grey fill**, a **bold "Image" text label**, and an **image icon in dark grey (near-black)**, at the image's real aspect ratio. Development of P1–P3 must never be blocked by missing photos; the owner supplies real images later. This placeholder is an explicit, temporary exception to DR-2 ("no placeholder imagery in shipped UI"); real images are required before launch (P9). |

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

## Design rules (binding) [USER, 2026-10-23]

### DR-1 — No radius

No rounded corners anywhere in UI: buttons, badges, inputs, cards, images, menus, focus rings, progress bars, pagination. Native controls that the browser rounds (inputs, selects, radios, checkboxes on iOS/Safari) are reset to square.

- **No exceptions.** The V-25 glass layer, the former sole exception, was removed [USER, 2026-10-23]. A future curved element needs an explicit owner decision and a matching test exemption.
- **Not covered:** icon stroke caps. Hugeicons free set (rounded strokes) is accepted.
- **Enforcement:** Tailwind radius theme values are removed and a test fails if `rounded-` utilities or non-zero `border-radius` appear anywhere in `app/`, `components/`, or `lib/`.

### DR-2 — Art, photography, fashion; no "AI slop"

The site should read as a photographer's or fashion label's work, not a generated template.

**Do:** let photographs carry the page; flat colour; hard edges; typographic hierarchy from size and weight; references to print and photography (print borders, plate numbers like `01 / 05`, captions); deliberate asymmetry where it serves the image.

**Do not** (unless a numbered decision above makes an explicit exception):

- gradients (including "sunset" gradients of the accent colour), mesh or noise-gradient backgrounds;
- soft or blurred drop shadows, glow, neumorphism; glassmorphism panels or blur layers;
- rounded cards, pill buttons, pill badges;
- decorative icons, icon-in-circle feature rows, emoji in UI, sparkle/AI symbols;
- default "AI" typefaces (Inter, Space Grotesk as defaults) and centred hero + headline + two-button templates;
- three-column feature grids, testimonial carousels, stock illustrations, generic placeholder imagery in shipped UI (the V-26 dummy placeholder is the one temporary exception until launch).

**Icons:** minimal and functional only (arrows, close, play/pause); library **Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`); `lucide-react` is removed. Prefer a text label where it reads naturally.

### Removed from v2

Pinned scroll-driven hero (D-16, D-17), horizontally draggable grid (D-18), lifestyle clip reveal on hover (D-19, D-19a), card → PDP shared-element transition (D-20, O-06), transparent-to-fixed header (D-25), separate `/shop` page (D-26, O-02).

## Defaults while owner input is pending [PROPOSED]

Agents use these until the owner supplies a value; each lives in one token or config entry so swapping it touches no component code.

| Input            | Default                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Accent colour    | `#FF5A1F` (sunset orange). Text on accent is black (white fails WCAG AA on all three candidates). Alternatives: `#F2361D`, `#FFA51F`. |
| Logo             | Text wordmark "Thun Things" in the typeface.                                                                                          |
| Contact email    | Unset → hidden in footer.                                                                                                             |
| Social links     | Unset → hidden in footer.                                                                                                             |
| Related products | 4 other products, same colour first.                                                                                                  |

## Spacing and sizing

8-point grid (project skill `8-point-grid`): spacing in multiples of 8 px with a 4 px half-step for icon/text gaps; line-heights in multiples of 4 px. Control heights: 32 / 40 / 48 px; touch targets at least 44 px (mobile controls use 48 px).

## Glass layer (removed)

V-25 was built in P2 and removed on 2026-10-23 at the owner's request. Root cause of the reported lag, for whoever revisits it: the blur sat inside a parent whose `opacity` was animated, and an ancestor with `opacity < 1` isolates `backdrop-filter`, so the blur only appeared once the fade finished. Animate `transform` (and the fill colour) on the blurred element itself instead.

## Phase mapping

| Phase   | v3 scope                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1      | Tokens, typeface, motion tokens, sticky header, footer, Button/Badge primitives, `cn()`, copy module, site config, page shells (Home, About, Contact, Policy), metadata, robots, sitemap. |
| P2      | Catalog data layer, hero slideshow, product grid with pagination, hover card, product detail page.                                                                                        |
| P3      | Contact form (order fallback), in-page notify-me form, policy and About content, email sink, rate limit.                                                                                  |
| Backlog | Custom cursor (V-23).                                                                                                                                                                     |
