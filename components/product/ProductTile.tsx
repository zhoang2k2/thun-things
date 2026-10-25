'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import type { ActiveCard, OpenCard } from '@/components/product/ProductGrid';
import { Link } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/events';
import type { ProductCardModel } from '@/lib/catalog';

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
  const previewTrackedRef = useRef(false);
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
    // The hover card is one element above the grid: moving onto it keeps this design open.
    if ((event.relatedTarget as Element | null)?.closest?.('.ProductHoverCard')) return;
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

  // One hover_preview_open per tile per page view (spec section 5).
  useEffect(() => {
    if (!active || previewTrackedRef.current) return;
    previewTrackedRef.current = true;
    trackEvent('hover_preview_open', { product_id: product.slug, status: product.status });
  }, [active, product.slug, product.status]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pointerTypeRef.current !== 'touch' || wasOpenAtPressRef.current) {
      trackEvent('select_item', { product_id: product.slug, status: product.status, locale });
      return;
    }
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
      className="ProductTile relative aspect-[4/5]"
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
    </li>
  );
};
