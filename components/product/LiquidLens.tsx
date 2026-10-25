'use client';

import { type RefObject, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { ProductCardModel } from '@/lib/catalog';
import { type FollowerState, LENS, lensPath, stepFollower } from '@/lib/motion/liquid';
import { XrayCell } from '@/components/product/XrayCell';

// P11: a liquid lens follows the pointer over the product grid and x-rays the grid beneath it. The
// hovered tile keeps its own card (it sits above this layer); every other cell reveals its back.
// Fine pointers only, never under reduced motion; nothing renders on touch, so no lens there.

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
// Provisional tint (P11-2): brand orange at 10%. The owner picks the final colour from screenshots.
const TINT = '#E8662E';
const TINT_OPACITY = 0.1;
const FADE_MS = 150;
const MAX_FRAME_MS = 50;

interface LiquidLensProps {
  products: ProductCardModel[];
  wrapperRef: RefObject<HTMLDivElement | null>;
}

interface LensState {
  visible: boolean;
  /** 0 hidden … 1 full size; eases over FADE_MS. */
  progress: number;
  follower: FollowerState | null;
  target: { x: number; y: number };
  /** Last pointer position in viewport coordinates, so scrolling keeps the lens under the pointer. */
  client: { x: number; y: number } | null;
  /** Grid box in viewport coordinates, refreshed on scroll and resize. */
  rect: DOMRect | null;
  frame: number;
  last: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

// Fine pointer (a mouse or trackpad that hovers): not touch, not a coarse pointer.
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

export const LiquidLens = ({ products, wrapperRef }: LiquidLensProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const enabled = finePointer && !reducedMotion;
  const [armed, setArmed] = useState(false);
  const clipId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const outlineRef = useRef<SVGPathElement>(null);
  const tintRef = useRef<SVGPathElement>(null);
  const lens = useRef<LensState>({
    visible: false,
    progress: 0,
    follower: null,
    target: { x: 0, y: 0 },
    client: null,
    rect: null,
    frame: 0,
    last: 0,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!enabled || !wrapper) return;
    const state = lens.current;

    const measure = () => {
      state.rect = wrapper.getBoundingClientRect();
    };
    const localPoint = (event: { clientX: number; clientY: number }) => {
      const rect = state.rect ?? wrapper.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const draw = (now: number) => {
      const dt = state.last ? Math.min(MAX_FRAME_MS, now - state.last) : 16;
      state.last = now;
      if (state.client && state.rect) {
        state.target = {
          x: state.client.x - state.rect.left,
          y: state.client.y - state.rect.top,
        };
      }
      if (state.visible && state.follower) {
        state.follower = stepFollower(state.follower, state.target, dt);
      }
      state.progress = clamp(state.progress + ((state.visible ? 1 : -1) * dt) / FADE_MS);

      const svg = svgRef.current;
      if (svg) svg.style.visibility = state.progress > 0 ? 'visible' : 'hidden';
      if (state.follower && state.progress > 0) {
        const eased = 1 - (1 - state.progress) ** 3;
        const d = lensPath({
          ...state.follower,
          tMs: now,
          radius: (LENS.diameter / 2) * eased,
        });
        outlineRef.current?.setAttribute('d', d);
        tintRef.current?.setAttribute('d', d);
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

    const start = () => {
      if (state.frame) return;
      state.last = 0;
      state.frame = window.requestAnimationFrame(loop);
    };

    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      setArmed(true);
      measure();
      const point = localPoint(event);
      state.client = { x: event.clientX, y: event.clientY };
      state.target = point;
      state.follower = { x: point.x, y: point.y, vx: 0, vy: 0 };
      state.visible = true;
      start();
    };
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      state.client = { x: event.clientX, y: event.clientY };
      if (!state.visible) handleEnter(event);
    };
    const handleLeave = () => {
      state.visible = false;
      state.client = null;
    };
    const handleViewport = () => {
      measure();
    };
    const handleHidden = () => {
      if (document.hidden) handleLeave();
    };

    measure();
    wrapper.addEventListener('pointerenter', handleEnter);
    wrapper.addEventListener('pointermove', handleMove);
    wrapper.addEventListener('pointerleave', handleLeave);
    window.addEventListener('scroll', handleViewport, { passive: true });
    window.addEventListener('resize', handleViewport);
    document.addEventListener('visibilitychange', handleHidden);

    return () => {
      wrapper.removeEventListener('pointerenter', handleEnter);
      wrapper.removeEventListener('pointermove', handleMove);
      wrapper.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('scroll', handleViewport);
      window.removeEventListener('resize', handleViewport);
      document.removeEventListener('visibilitychange', handleHidden);
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.visible = false;
      state.progress = 0;
      state.follower = null;
      state.client = null;
    };
  }, [enabled, wrapperRef]);

  if (!enabled) return null;

  return (
    <>
      <svg
        ref={svgRef}
        aria-hidden="true"
        focusable="false"
        className="LiquidLens pointer-events-none absolute inset-0 z-20 size-full"
        style={{ visibility: 'hidden' }}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={outlineRef} />
          </clipPath>
        </defs>
        <path ref={tintRef} fill={TINT} fillOpacity={TINT_OPACITY} />
      </svg>
      {armed && (
        <div
          aria-hidden="true"
          className="LiquidLens__xray pointer-events-none absolute inset-0 z-10 px-4"
          style={{ clipPath: `url(#${clipId})` }}
        >
          <ul className="grid grid-cols-1 md:grid-cols-4">
            {products.map((product) => (
              <XrayCell key={product.id} product={product} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
