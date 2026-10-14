---
name: motion-guidelines
description: Animation and motion design guidelines, CSS-first philosophy, Motion for React usage, GSAP escalation criteria, reduced-motion fallbacks, and 60fps performance guardrails.
---

# Motion Guidelines for Thun Things

## 1. Core Philosophy: CSS-First & Expressive Minimalism

Thun Things pairs a white, minimal canvas with expressive, synchronized motion. Motion is a brand differentiator, but must never compromise performance, usability, or accessibility.

### Hierarchy of Motion Tools

1. **CSS Transitions & Keyframes:** Use for simple state changes (opacity, color, hover transforms, simple clip-paths). Zero JS execution cost.
2. **Motion for React (`motion`):** Use for layout animations, shared-element transitions (product card to PDP), gestures (drag grids), and orchestrated presence transitions.
3. **GSAP:** Escalation only. Do NOT install or use GSAP unless complex multi-timeline scroll choreography cannot be achieved cleanly with Motion or CSS scroll-driven animations.

## 2. Centralized Motion Tokens

All motion must reference centralized tokens defined in `components/motion/tokens.ts`:

- **Durations:** `instant` (100ms), `fast` (200ms), `normal` (350ms), `slow` (600ms), `hero` (800ms–1200ms).
- **Easings:** Cubic-bezier curves (e.g., standard ease-out for entering elements, expressive curves for clip reveals).
- **Stagger:** Predictable intervals (40ms–60ms) between list items.

## 3. Strict Reduced-Motion Support (`prefers-reduced-motion`)

Every animation must have an explicit fallback when `prefers-reduced-motion: reduce` is detected:

- **Pinned Hero (D-16):** Transforms into static, stacked sequential image frames.
- **Draggable Grid (D-18):** Replaces drag requirement with native horizontal scrolling plus accessible previous/next buttons.
- **Card Reveal (D-19):** Instant or simple cross-fade instead of aggressive cut/clip transforms.
- **Quiz Bubble (D-24a):** Disables repeating auto-popup behavior entirely.
- **Shared-Element Transitions (D-20):** Degrades gracefully to an instantaneous cross-fade (O-06).

## 4. Animation Performance Budgets (60fps / 120fps)

- **Composite-Only Properties:** Animate ONLY `transform` and `opacity`. Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- **Will-Change Restraint:** Apply `will-change: transform` only during active interaction, and remove it once the transition ends.
- **Layout Shift Zero:** Reserve dimensions (aspect ratios) for all images, skeletons, and media containers to prevent Cumulative Layout Shift (CLS < 0.1).
- **Interaction to Next Paint (INP):** Keep INP < 200ms. Drag handlers and scroll observers must avoid heavy synchronous recalculations in the main thread.

## 5. Specific Feature Guardrails

- **Scroll Hero:** Use passive scroll listeners or Intersection Observer / CSS Scroll-Driven Animations. Avoid thrashing `window.scrollY`.
- **Product Card Hover:** Pre-fetch lifestyle photos on intent, but never block Initial Page Load or the Largest Contentful Paint (LCP) path.
- **Shared Transitions:** Wrap shared transitions with safety timeouts so if the transition stalls, the user is never stuck between route states.
