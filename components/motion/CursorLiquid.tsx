'use client';

import { useEffect, useId, useRef } from 'react';

import { FILM_GRAIN, LIQUID_TINT } from '@/components/product/lensTextures';
import { buttonClasses } from '@/components/ui/Button';
import { useFinePointer } from '@/lib/hooks/useFinePointer';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { LENS, lensOutline } from '@/lib/motion/liquid';

// P11 revision 4: a site-wide liquid follows the pointer with no lag. It has two states: outer, a
// near-circle (80px, faint wobble) everywhere outside the product grid; inner, over the grid, where it
// spreads to 280px and morphs deeply. The change between the two animates both ways. Two fixed layers share one clip path: the colour layer multiplies the
// orange–purple tint and grain onto the page (also over the hover card), and the button layer shows a
// copy of the hover card's button where the liquid overlaps it (purple, orange while hovered).
// Above page content and the hover card, below the header, consent bar, quiz and dialogs.

const GRID = '.ProductGrid';
const CARD_BUTTON = '.ProductHoverCard .ProductAction';
const FADE_MS = 180;
const STATE_MS = 350;
const MAX_FRAME_MS = 50;

interface LiquidState {
  x: number;
  y: number;
  /** Pointer inside the window. */
  visible: boolean;
  /** Pointer over the product grid: the liquid heads for the inner state. */
  inside: boolean;
  /** 0 hidden … 1 shown. */
  fade: number;
  /** Progress between the states: 0 outer … 1 inner. */
  inner: number;
  seed: number;
  frame: number;
  last: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const CursorLiquid = () => {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = finePointer && !reducedMotion;
  const clipId = useId();
  const clipRef = useRef<SVGPathElement>(null);
  const colourRef = useRef<HTMLDivElement>(null);
  const buttonLayerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const liquid = useRef<LiquidState>({
    x: 0,
    y: 0,
    visible: false,
    inside: false,
    fade: 0,
    inner: 0,
    seed: 1,
    frame: 0,
    last: 0,
  });

  useEffect(() => {
    if (!enabled) return;
    const state = liquid.current;
    // Each page view gets its own liquid shape.
    state.seed = 1 + Math.floor(Math.random() * 2_147_483_646);

    const syncButton = () => {
      const copy = buttonRef.current;
      if (!copy) return;
      const button = document.querySelector<HTMLElement>(CARD_BUTTON);
      if (!button) {
        copy.style.display = 'none';
        return;
      }
      const box = button.getBoundingClientRect();
      copy.style.display = 'flex';
      copy.style.transform = `translate(${box.left}px, ${box.top}px)`;
      copy.style.width = `${box.width}px`;
      copy.style.height = `${box.height}px`;
      const label = button.textContent ?? '';
      if (copy.textContent !== label) copy.textContent = label;
      copy.dataset.hover = button.matches(':hover') ? 'true' : 'false';
    };

    const draw = (now: number) => {
      const dt = state.last ? Math.min(MAX_FRAME_MS, now - state.last) : 16;
      state.last = now;
      state.fade = clamp(state.fade + ((state.visible ? 1 : -1) * dt) / FADE_MS);
      state.inner = clamp(state.inner + ((state.inside ? 1 : -1) * dt) / STATE_MS);

      const shown = state.fade > 0 ? 'visible' : 'hidden';
      if (colourRef.current) colourRef.current.style.visibility = shown;
      if (buttonLayerRef.current) buttonLayerRef.current.style.visibility = shown;
      if (state.fade <= 0) return;

      const grow = easeInOut(state.inner);
      const diameter = lerp(LENS.outerDiameter, LENS.innerDiameter, grow);
      clipRef.current?.setAttribute(
        'd',
        lensOutline({
          cx: state.x,
          cy: state.y,
          radius: (diameter / 2) * easeOut(state.fade),
          tMs: now,
          seed: state.seed,
          depth: lerp(LENS.outerDepth, LENS.innerDepth, grow),
        }),
      );
      syncButton();
    };

    const loop = (now: number) => {
      draw(now);
      const settled =
        !state.visible && state.fade <= 0 && (state.inside ? state.inner >= 1 : state.inner <= 0);
      if (settled) {
        state.frame = 0;
        state.last = 0;
      } else {
        state.frame = window.requestAnimationFrame(loop);
      }
    };
    const start = () => {
      if (state.frame) return;
      state.last = 0;
      state.frame = window.requestAnimationFrame(loop);
    };

    // The centre is the pointer itself, written on every move: no follower, so no lag.
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      state.x = event.clientX;
      state.y = event.clientY;
      state.visible = true;
      state.inside = Boolean((event.target as Element | null)?.closest?.(GRID));
      start();
    };
    const handleLeave = () => {
      state.visible = false;
      start();
    };
    const handleHidden = () => {
      if (document.hidden) handleLeave();
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    document.addEventListener('visibilitychange', handleHidden);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('visibilitychange', handleHidden);
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.visible = false;
      state.fade = 0;
    };
  }, [enabled]);

  if (!enabled) return null;

  const clip = { clipPath: `url(#${clipId})`, visibility: 'hidden' as const };

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        className="CursorLiquid__clip fixed"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={clipRef} />
          </clipPath>
        </defs>
      </svg>
      {/* Colour: multiplied onto whatever is underneath, so photos keep their detail. */}
      <div
        ref={colourRef}
        aria-hidden="true"
        className="CursorLiquid CursorLiquid__colour pointer-events-none fixed inset-0 z-[35]"
        style={clip}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: LIQUID_TINT, backgroundSize: '256px 256px' }}
        />
        <div
          className="CursorLiquid__grain absolute inset-0"
          style={{ backgroundImage: FILM_GRAIN }}
        />
      </div>
      {/* Button overlap: a copy of the hover card's button, visible only inside the liquid. */}
      <div
        ref={buttonLayerRef}
        aria-hidden="true"
        className="CursorLiquid pointer-events-none fixed inset-0 z-[35]"
        style={clip}
      >
        <div
          ref={buttonRef}
          className={buttonClasses({
            size: 'lg',
            className: 'CursorLiquid__button absolute top-0 left-0',
          })}
          style={{ display: 'none' }}
          data-hover="false"
        />
      </div>
    </>
  );
};
