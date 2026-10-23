'use client';

import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GlassLayer } from '@/components/product/glass/GlassLayer';
import { ProductTile } from '@/components/product/ProductTile';
import type { ProductCardModel } from '@/lib/catalog';

export type CardAlign = 'start' | 'center' | 'end';

export interface ActiveCard {
  id: string;
  /** Pointer entry point relative to the cell (centre for keyboard focus). */
  origin: { x: number; y: number };
  /** Cell box relative to the grid wrapper. */
  rect: { left: number; top: number; width: number; height: number };
  /** Edge cells shift the card inward so it never leaves the viewport. */
  align: CardAlign;
}

export type OpenCard = (id: string, cell: HTMLElement, point?: { x: number; y: number }) => void;

const EDGE_TOLERANCE = 1;

const alignFor = (cell: DOMRect, grid: DOMRect): CardAlign => {
  if (cell.left - grid.left <= EDGE_TOLERANCE) return 'start';
  if (grid.right - cell.right <= EDGE_TOLERANCE) return 'end';
  return 'center';
};

interface ProductGridProps {
  products: ProductCardModel[];
}

// V-09: 2 columns on mobile, 4 from md, no gaps. Holds the single open card and glass layer.
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
        align: alignFor(cellBox, gridBox),
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
    <div ref={wrapperRef} className="ProductGrid relative overflow-x-clip">
      <ul className="ProductGrid__list grid grid-cols-2 md:grid-cols-4">
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
      <AnimatePresence>{active && <GlassLayer key={active.id} active={active} />}</AnimatePresence>
    </div>
  );
};
