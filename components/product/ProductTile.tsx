'use client';

import { AnimatePresence } from 'motion/react';
import { useLocale } from 'next-intl';
import { useRef } from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import type { ActiveCard, OpenCard } from '@/components/product/ProductGrid';
import { ProductHoverCard } from '@/components/product/ProductHoverCard';
import { Link } from '@/i18n/navigation';
import type { ProductCardModel } from '@/lib/catalog';
import { cn } from '@/lib/cn';

export const GRID_IMAGE_SIZES = '(min-width: 768px) 25vw, 100vw';

interface ProductTileProps {
  product: ProductCardModel;
  active: ActiveCard | null;
  onOpen: OpenCard;
  onClose: (id: string) => void;
}

// V-10: the cell shows only the image; its alt text names the product for the link.
// V-18/V-19: hover, keyboard focus, and a first touch tap open the card.
export const ProductTile = ({ product, active, onOpen, onClose }: ProductTileProps) => {
  const locale = useLocale();
  const cellRef = useRef<HTMLLIElement>(null);
  const pointerTypeRef = useRef('mouse');
  // Captured at pointerdown: the tap also focuses the link, which opens the card before `click`.
  const wasOpenAtPressRef = useRef(false);

  const pointFrom = (event: { clientX: number; clientY: number }) => {
    const box = cellRef.current!.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const handlePointerEnter = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === 'touch') return;
    onOpen(product.id, event.currentTarget, pointFrom(event));
  };

  const handlePointerLeave = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === 'touch') return;
    onClose(product.id);
  };

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    onOpen(product.id, event.currentTarget);
  };

  const handleBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onClose(product.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Escape') onClose(product.id);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pointerTypeRef.current !== 'touch' || wasOpenAtPressRef.current) return;
    event.preventDefault();
    onOpen(product.id, cellRef.current!, pointFrom(event));
  };

  return (
    <li
      ref={cellRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn('ProductTile relative aspect-[4/5]', active && 'z-30')}
    >
      <Link
        href={`/products/${product.slug}`}
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType;
          wasOpenAtPressRef.current = Boolean(active);
        }}
        onClick={handleClick}
        className="ProductTile__link focus-visible:outline-ink block h-full focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <MediaImage
          src={product.image.src}
          alt={product.image.alt[locale]}
          width={product.image.width}
          height={product.image.height}
          sizes={GRID_IMAGE_SIZES}
          fill
        />
      </Link>
      <AnimatePresence>
        {active && <ProductHoverCard key={active.id} product={product} active={active} />}
      </AnimatePresence>
    </li>
  );
};
