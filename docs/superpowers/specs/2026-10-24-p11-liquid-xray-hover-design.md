# P11 Liquid X-ray Hover — Design

**Date:** 2026-10-24
**Builds on:** V-14/V-15 hover card (P2-9), DR-1/DR-2, the P3 removal of the glass layer, P6 events; [`../plans/2026-10-22-roadmap.md`](../plans/2026-10-22-roadmap.md) P11
**Roadmap:** P11, after launch (P9). Planned now, built after P9.

## Goal

A ~200px liquid lens follows the mouse over the product grid. The hovered product still opens its full hover card; anywhere else the lens passes, it "x-rays" the grid, showing each design's back photo with its name and price. Every product effectively has a hidden card that the lens reveals.

## Owner decisions [USER, 2026-10-24]

| ID    | Decision                                                                                                                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P11-1 | The hovered tile opens the **full hover card** as today (clickable); the lens reveals the hidden layer of the **other** tiles it passes over.                                                                                           |
| P11-2 | The lens has a **flat, light colour tint** (no gradient, no blur, no glass: DR-2). The colour is chosen by the owner from 2–3 prototype screenshots (Task 1).                                                                           |
| P11-3 | The lens appears **only inside the product grid**; elsewhere the pointer is normal.                                                                                                                                                     |
| P11-4 | Motion: the edge **wobbles continuously** (also at rest) and the lens **stretches along the direction of travel** when moving fast, then settles; it tracks the pointer with < ~60 ms perceived lag (the old glass layer felt delayed). |
| P11-5 | X-ray content: the **back photo** of the design with its **name and price** printed over it.                                                                                                                                            |
| P11-6 | Roadmap position: **P11, after launch**.                                                                                                                                                                                                |
| P11-7 | Defaults proposed by the agent and accepted with "tiếp tục": no lens on touch, keyboard-only use or reduced motion; back photos load on the first pointer entry; placeholder back images read "MẶT SAU / BACK".                         |

## 1. Experience

- **Lens:** diameter `LENS.diameter = 200` (one constant, for testing other sizes). Shape: a closed blob around the pointer whose radius varies smoothly with angle and time (sum of 2–3 low-frequency sine terms, ±8% of the radius, period 2–4 s). Velocity stretch: the blob elongates along the pointer velocity (up to 1.35× on the long axis, area kept roughly constant) and eases back within ~250 ms of stopping.
- **Tracking:** the centre follows the pointer with critically damped smoothing tuned to settle within 60 ms; no visible trailing.
- **Appear / disappear:** grows from 0 to full size in 150 ms on entering the grid, shrinks to 0 in 150 ms on leaving.
- **Hovered tile:** unchanged behaviour: the full hover card opens with the existing circle reveal and stays clickable. The card sits above the lens layer, and the tint is not drawn over it.
- **Other tiles under the lens:** an x-ray layer matching the grid cell by cell shows each product's back photo (`media.back`, falling back to `media.front` when missing) with the name and price on a flat canvas plate at the bottom-left of the cell. The x-ray layer is decorative (`aria-hidden`, `pointer-events: none`).
- **Tint:** the lens shape is filled with one flat colour at low opacity above the x-ray layer. Candidates for the owner: brand orange ≈ 10%, ink ≈ 5%, and one more from the palette. The chosen colour must keep the revealed name and price at WCAG AA contrast.
- **Placeholders:** until real photos arrive (P9), the back placeholder reads "MẶT SAU / BACK" so the effect is visible.

## 2. When there is no lens

- Coarse pointers (touch) and any device without `(hover: hover) and (pointer: fine)`: no lens; tap behaviour unchanged.
- `prefers-reduced-motion: reduce`: no lens; the hover card works as today.
- Keyboard: focus opens the card as today; the lens never follows focus.
- Pointer outside the grid, or the page hidden (`visibilitychange`): the animation loop stops.

## 3. Architecture

- `components/product/LiquidLens.tsx` (client), rendered inside `ProductGrid`'s wrapper, absolutely covering the list:
  - **X-ray layer:** a second grid with the same columns as `ProductGrid__list`, one `XrayCell` per product (back photo + name + price), clipped by `clip-path: url(#lens-clip)`.
  - **Tint layer:** an SVG with the same lens path filled with the chosen colour.
  - **Shape:** one SVG `<path>` (in a `<clipPath clipPathUnits="userSpaceOnUse">`) whose `d` is written on each `requestAnimationFrame` directly to the DOM (no React state per frame).
- `lib/motion/liquid.ts` (pure): `lensPath({ x, y, vx, vy, t, radius, points }) → string` and `stepFollower(state, target, dt) → state` (smoothing and velocity), unit-tested without the DOM.
- **Loading:** the x-ray layer mounts on the first pointer entry into the grid on a fine-pointer device, so its back photos never compete with LCP. Images use the existing `MediaImage` with the grid's `sizes`.
- **Z-order** inside the wrapper: tiles (base) → x-ray layer → tint → open hover card (`z-30`, existing).
- **Data:** `ProductCardModel` gains `backImage` from `lib/catalog` (`toCardModel`), keeping the data-access rule.
- **Performance budget:** 60 fps while moving on a mid-range laptop (≤ 4 ms scripting per frame); no layout reads inside the frame loop except one cached grid rect refreshed on scroll/resize.

## 4. Events

No new GA4 event: `hover_preview_open` and `select_item` stay as they are. (A lens-reveal event would fire continuously and adds no decision value.)

## 5. Coexistence

- P10 backlog's custom garment-tag cursor (V-23) stays compatible: the lens replaces nothing outside the grid and keeps the system cursor inside it.
- DR-1 (no radius) does not apply to the lens: it is an organic shape, not a UI box. DR-2 holds: flat tint only.

## Testing

- Unit: `lensPath` closes, stays within the stretch bounds, keeps area within ±10% while stretched, changes over time at rest; `stepFollower` settles within 60 ms and reports velocity.
- RTL: lens not rendered under reduced motion or a coarse pointer; x-ray layer mounts only after the first pointer entry; x-ray cells are `aria-hidden`; back image falls back to the front.
- E2E (Chromium, fine pointer): moving across the grid shows the lens and reveals a neighbour's x-ray content; leaving the grid hides it; the hovered card is still clickable through to the product page; `emulateMedia({ reducedMotion: 'reduce' })` and a touch context show no lens; axe with the lens over a tile has no serious violations.
- Performance: a Playwright trace of a scripted 3 s mouse sweep reports ≥ 55 fps; Lighthouse budgets unchanged and LCP unaffected (no back images requested before pointer entry).
- Evidence: GIF of a sweep across the grid (desktop), with the chosen tint; PNG comparison of the tint candidates.

## Out of scope

Lens on pages other than the grid, touch or gyro variants, sound, WebGL/canvas rendering, new analytics events.
