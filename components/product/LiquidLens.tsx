'use client';

import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { XrayCell } from '@/components/product/XrayCell';
import type { ProductCardModel } from '@/lib/catalog';
import { LENS, lensOutline } from '@/lib/motion/liquid';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// P11 (revision 2): a liquid lens opens where the pointer enters the product grid and stays there.
// Its edge morphs on its own clock (lensOutline), not with the pointer. Inside it the grid shows each
// neighbour's card with the back photo, plus a film-grain layer; it sits above the hovered card too.
// Fine pointers only, never under reduced motion; nothing renders on touch.

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const FADE_MS = 180;
const MAX_FRAME_MS = 50;

const subscribeFinePointer = (onChange: () => void) => {
  const media = window.matchMedia(FINE_POINTER);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const useFinePointer = () =>
  useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );

interface LiquidLensProps {
  products: ProductCardModel[];
  wrapperRef: RefObject<HTMLDivElement | null>;
}

interface LensState {
  visible: boolean;
  /** 0 hidden … 1 full size. */
  progress: number;
  /** Lens centre, in the grid's own coordinates. */
  origin: { x: number; y: number };
  seed: number;
  frame: number;
  last: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const LiquidLens = ({ products, wrapperRef }: LiquidLensProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = finePointer && !reducedMotion;
  const [armed, setArmed] = useState(false);
  const placeholderLabel = useTranslations('product')('lensBackPlaceholder');
  const clipId = useId();
  const clipRef = useRef<SVGPathElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const lens = useRef<LensState>({
    visible: false,
    progress: 0,
    origin: { x: 0, y: 0 },
    seed: 1,
    frame: 0,
    last: 0,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!enabled || !wrapper) return;
    const state = lens.current;

    const draw = (now: number) => {
      const dt = state.last ? Math.min(MAX_FRAME_MS, now - state.last) : 16;
      state.last = now;
      state.progress = clamp(state.progress + ((state.visible ? 1 : -1) * dt) / FADE_MS);

      const layer = layerRef.current;
      if (layer) layer.style.visibility = state.progress > 0 ? 'visible' : 'hidden';
      if (state.progress > 0) {
        const eased = 1 - (1 - state.progress) ** 3;
        clipRef.current?.setAttribute(
          'd',
          lensOutline({
            cx: state.origin.x,
            cy: state.origin.y,
            radius: (LENS.diameter / 2) * eased,
            tMs: now,
            seed: state.seed,
          }),
        );
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (state.visible || state.progress > 0) {
        state.frame = window.requestAnimationFrame(loop);
      } else {
        state.frame = 0;
        state.last = 0;
      }
    };

    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      // Measured once, at entry: the lens lives in grid coordinates, so scrolling keeps it in place.
      const rect = wrapper.getBoundingClientRect();
      state.origin = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      state.seed = 1 + Math.floor(Math.random() * 2_147_483_646);
      state.visible = true;
      setArmed(true);
      if (!state.frame) {
        state.last = 0;
        state.frame = window.requestAnimationFrame(loop);
      }
    };
    const handleLeave = () => {
      state.visible = false;
    };
    const handleHidden = () => {
      if (document.hidden) handleLeave();
    };

    wrapper.addEventListener('pointerenter', handleEnter);
    wrapper.addEventListener('pointerleave', handleLeave);
    document.addEventListener('visibilitychange', handleHidden);

    return () => {
      wrapper.removeEventListener('pointerenter', handleEnter);
      wrapper.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('visibilitychange', handleHidden);
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.visible = false;
      state.progress = 0;
    };
  }, [enabled, wrapperRef]);

  if (!enabled) return null;

  return (
    <>
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={clipRef} />
          </clipPath>
        </defs>
      </svg>
      {armed && (
        <div
          ref={layerRef}
          aria-hidden="true"
          className="LiquidLens LiquidLens__xray pointer-events-none absolute inset-0 z-40 px-4"
          style={{ clipPath: `url(#${clipId})`, visibility: 'hidden' }}
        >
          <ul className="grid grid-cols-1 md:grid-cols-4">
            {products.map((product) => (
              <XrayCell key={product.id} product={product} placeholderLabel={placeholderLabel} />
            ))}
          </ul>
          <div className="LiquidLens__grain pointer-events-none absolute inset-0" />
        </div>
      )}
    </>
  );
};
