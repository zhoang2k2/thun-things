'use client';

import { LazyMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { LiquidLens } from '@/components/product/LiquidLens';
import { ProductHoverCard } from '@/components/product/ProductHoverCard';
import { ProductTile } from '@/components/product/ProductTile';
import type { ProductCardModel } from '@/lib/catalog';

export interface ActiveCard {
  id: string;
  /** Pointer entry point relative to the cell (centre for keyboard focus). */
  origin: { x: number; y: number };
  /** Cell box relative to the grid wrapper. */
  rect: { left: number; top: number; width: number; height: number };
}

// Motion's animation features load after hydration, keeping them off the critical path (P4 perf).
const loadMotionFeatures = () =>
  import('@/components/motion/features').then((module) => module.default);

export type OpenCard = (id: string, cell: HTMLElement, point?: { x: number; y: number }) => void;

interface ProductGridProps {
  products: ProductCardModel[];
}

// V-09: 1 column on mobile, 4 from md, no gaps between cells. The 16px gutters equal the card
// frame, so an edge card fits on screen without moving its image (P2-8).
// Holds the single open card.
export const ProductGrid = ({ products }: ProductGridProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActiveCard | null>(null);

  const open = useCallback<OpenCard>((id, cell, point) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const cellBox = cell.getBoundingClientRect();
    const gridBox = wrapper.getBoundingClientRect();
    setActive((current) => {
      if (current?.id === id) return current;
      return {
        id,
        origin: point ?? { x: cellBox.width / 2, y: cellBox.height / 2 },
        rect: {
          left: cellBox.left - gridBox.left,
          top: cellBox.top - gridBox.top,
          width: cellBox.width,
          height: cellBox.height,
        },
      };
    });
  }, []);

  const close = useCallback((id: string) => {
    setActive((current) => (current?.id === id ? null : current));
  }, []);

  // Touch: a tap outside the grid closes the open card.
  useEffect(() => {
    if (!active) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [active]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div ref={wrapperRef} className="ProductGrid relative overflow-x-clip px-4">
        <ul className="ProductGrid__list grid grid-cols-1 md:grid-cols-4">
          {products.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              active={active?.id === product.id ? active : null}
              onOpen={open}
              onClose={close}
            />
          ))}
        </ul>
        {/* One hover card for the whole grid (P11 rev 3): it sits over the hovered cell, so the card
            and every revealed copy share one geometry. Moving from the cell onto the card keeps it. */}
        {/* No exit animation: a leaving card would overlap the next one for a moment. */}
        {active && (
          <ProductHoverCard
            key={active.id}
            product={products.find((product) => product.id === active.id)!}
            active={active}
            onPointerLeave={(event) => {
              if (event.pointerType === 'touch') return;
              if ((event.relatedTarget as Element | null)?.closest?.('.ProductTile')) return;
              close(active.id);
            }}
          />
        )}
        <LiquidLens products={products} wrapperRef={wrapperRef} />
      </div>
    </LazyMotion>
  );
};
