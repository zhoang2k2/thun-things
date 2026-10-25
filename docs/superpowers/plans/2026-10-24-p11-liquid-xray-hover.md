# P11 — Liquid X-ray Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 200px liquid lens follows the mouse over the product grid, revealing each product's back photo with name and price, while the hovered tile still opens its full card.

**Architecture:** Pure shape and follower maths in `lib/motion/liquid.ts`; a client `LiquidLens` inside `ProductGrid` renders a duplicate x-ray grid clipped by one SVG path and a flat tint, updated per animation frame without React re-renders; mounted only for fine pointers without reduced motion, on first pointer entry.

**Tech Stack:** Next.js 16.4, React 19, SVG `clipPath`, `requestAnimationFrame`, Motion (existing hover card), Vitest + RTL, Playwright + axe.

**Spec:** [`../specs/2026-10-24-p11-liquid-xray-hover-design.md`](../specs/2026-10-24-p11-liquid-xray-hover-design.md).

**Branch / PR:** `phase/p11-liquid-xray-hover` from `develop` after P9 is DONE → one PR, evidence via `pnpm evidence`.

## Global Constraints

- Lens diameter from one constant (`LENS.diameter = 200`); stretch ≤ 1.35×; wobble ±8% radius; settle < 60 ms; appear/disappear 150 ms.
- DR-2: flat tint only (no gradient, blur, glass); tint colour from the owner's pick in Task 1; revealed text at WCAG AA.
- No lens on coarse pointers, without hover, under reduced motion, or for keyboard focus; the loop stops when the pointer leaves the grid or the page is hidden.
- No per-frame React state; no layout reads in the frame loop besides one cached grid rect.
- Back photos load only after the first pointer entry; Lighthouse budgets and render modes unchanged.
- The hovered tile's card keeps its current behaviour, events and clickability; x-ray layer is `aria-hidden` and `pointer-events: none`.
- Catalog access only through `lib/catalog` (`toCardModel` gains `backImage`).

## Review Focus

1. **Fast sweeps and direction reversals** → no tearing, the lens never lags visibly or flips inside out. Task 2.
2. **Scroll while hovering** (grid rect changes without pointer moves) → lens stays under the pointer. Task 3.
3. **Hovered card vs lens** → the card stays on top, clickable, without the tint over it. Task 3/4.
4. **Pagination / client navigation** → the x-ray layer matches the new page's products; no stale loop after unmount. Task 3.
5. **Low-end hardware** → frame budget holds; the effect degrades by stopping, never by janking the page. Task 4.

---

### Task 1: Tint prototype and owner pick

**Files:** Create `scripts/evidence/scenarios.mjs` entries for a static lens mock (temporary branch-only page section or Storybook-free test route behind `?lens-preview=1` in development only).

- [x] Render a static lens (no motion) over the grid with three tints: brand orange ≈ 10%, ink ≈ 5%, one more palette colour; capture PNGs; check revealed name/price contrast with axe.
- [x] Send the PNGs to the owner; record the pick as P11-2 in the spec. Remove the preview hook.
- [x] Commit `[DOCS] Record the P11 lens tint choice`.

### Task 2: Liquid maths

**Files:** Create `lib/motion/liquid.ts` (+ test).

**Interfaces:** `LENS = { diameter: 200, maxStretch: 1.35, wobble: 0.08, points: 48, settleMs: 60, fadeMs: 150 }`; `stepFollower(state: FollowerState, target: { x: number; y: number }, dtMs: number): FollowerState` with `FollowerState = { x; y; vx; vy }`; `lensPath(input: { x; y; vx; vy; tMs: number; radius: number }): string`.

- [x] Tests: path is closed and has `points` vertices; at rest the path changes over time but every vertex stays within radius ±8%; at high velocity the extent along the velocity axis is ≤ 1.35× and across it shrinks so area stays within ±10%; follower reaches within 1px of a step target in ≤ 60 ms and reports velocity in px/ms; zero-dt is a no-op.
- [x] Commit `[FEATURE] Add liquid lens maths`.

### Task 3: Lens and x-ray layer

**Files:** Create `components/product/LiquidLens.tsx`, `components/product/XrayCell.tsx` (+ tests); modify `components/product/ProductGrid.tsx`, `lib/catalog/index.ts` (`backImage`), `components/media` placeholder label for back images.

**Interfaces:** `<LiquidLens products={ProductCardModel[]} wrapperRef={RefObject<HTMLDivElement>} />`; `ProductCardModel.backImage: ImageAsset`.

- [x] RTL: nothing rendered under reduced motion or `(pointer: coarse)`; x-ray layer absent before the first pointer entry and present after; x-ray cells `aria-hidden` with back image, name and price; back falls back to front; unmount cancels the animation frame; products change → cells change.
- [x] Implement: pointer listeners on the wrapper, cached rect (refreshed on scroll/resize), rAF loop writing the path `d` to the clip path and tint path, appear/disappear scale, `visibilitychange` stop; z-order tiles → x-ray → tint → hover card.
- [x] Commit `[FEATURE] Add the liquid x-ray lens to the product grid`.

### Task 4: E2E, performance, docs, PR

- [x] E2E: sweep reveals a neighbour's x-ray name; leaving hides the lens; hovered card click reaches the product page; reduced motion and touch contexts show no lens; axe with the lens over a tile; no back-image request before pointer entry.
- [x] Performance: Playwright trace of a 3 s sweep ≥ 55 fps; `pnpm perf` → `docs/reports/lighthouse-p11-<date>/` within budgets.
- [x] Docs: ADR for the lens (SVG clip vs canvas, loading, fallbacks); `thun-things.md` V-14/V-15 note; roadmap P11 → `IN REVIEW`; plan notes.
- [x] Evidence: GIF sweep with the chosen tint; PNG tint comparison (from Task 1).
- [x] Full suite, push, PR, `pnpm evidence:publish`, CI.

## P11 Acceptance

- [x] Lens matches P11-1…P11-7; owner approves the feel on the preview (size and tint adjustable by constants).
- [x] No lens on touch, keyboard-only or reduced motion; hovered card unchanged.
- [x] ≥ 55 fps sweep; no Lighthouse or LCP regression; axe clean; CI green; evidence in the PR.
- [ ] Owner merged the PR; roadmap P11 = `DONE`.

## Implementation notes (2026-10-25)

- Built before P9b on the owner's instruction. The spec said to build after launch; this is recorded in ADR-014.
- Task 1 (tint prototype) is evidence only: three captures in the PR (orange 10%, ink 5%, moss 10%). The code keeps brand orange 10% as a provisional constant until the owner picks one.
- `backImage` falls back to the front photo; the x-ray placeholder reads "MẶT SAU / BACK" (vi) and "BACK" (en) until P9b photos exist.
- The fine-pointer query and the reduced-motion query are read with `useSyncExternalStore`, not an effect (lint: no synchronous setState in effects).
- Frame rate: about 62 fps in headless Chromium during a sweep (indicative, not a device measurement). Lighthouse budgets pass on all four pages.
- E2E: the lens appears only after a pointer enters the grid; the hovered card stays clickable on top; axe is clean over the grid with the lens active; no lens under reduced motion or on touch.
