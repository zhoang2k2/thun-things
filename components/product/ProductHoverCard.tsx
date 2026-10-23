'use client';

import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import { motionTokens } from '@/components/motion/tokens';
import { ProductAction } from '@/components/product/ProductAction';
import type { ActiveCard, CardAlign } from '@/components/product/ProductGrid';
import { StatusBadge } from '@/components/product/StatusBadge';
import type { ProductCardModel } from '@/lib/catalog';
import { cn } from '@/lib/cn';

// Print frame = 15% of the cell width; margins in % resolve against the cell width.
const FRAME = 0.15;
const ALIGN_CLASSES: Record<CardAlign, string> = {
  start: 'ml-0',
  center: '-ml-[15%]',
  end: '-ml-[30%]',
};
const ALIGN_OFFSET: Record<CardAlign, number> = { start: 0, center: FRAME, end: FRAME * 2 };

interface ProductHoverCardProps {
  product: ProductCardModel;
  active: ActiveCard;
}

// V-14/V-15: ~1.3× the cell, the same image at the same size inside a photo-print frame,
// expanding from the pointer entry point.
export const ProductHoverCard = ({ product, active }: ProductHoverCardProps) => {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const href = `/products/${product.slug}`;
  const cellWidth = active.rect.width;
  const originX = active.origin.x + cellWidth * ALIGN_OFFSET[active.align];
  const originY = active.origin.y + cellWidth * FRAME;
  const hidden = reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 };

  // The whole card opens the product; links inside keep their own behaviour.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) return;
    router.push(href);
  };

  return (
    <motion.div
      data-testid="product-hover-card"
      onClick={handleClick}
      className={cn(
        'ProductHoverCard bg-canvas border-line absolute top-0 left-0 z-30 -mt-[15%] w-[130%] cursor-pointer border px-[15%] pt-[15%] pb-4',
        ALIGN_CLASSES[active.align],
      )}
      style={{ transformOrigin: `${originX}px ${originY}px` }}
      initial={hidden}
      animate={{ opacity: 1, scale: 1 }}
      exit={hidden}
      transition={{ duration: motionTokens.duration.normal, ease: motionTokens.ease.out }}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="ProductHoverCard__image block">
        <div className="relative aspect-[4/5]">
          <MediaImage
            src={product.image.src}
            alt=""
            width={product.image.width}
            height={product.image.height}
            fill
          />
        </div>
      </Link>
      <div className="ProductHoverCard__info flex flex-col gap-2 pt-4">
        <p className="ProductHoverCard__name text-base leading-6 font-bold">{product.name}</p>
        <p className="ProductHoverCard__price text-ink-muted text-sm leading-5">
          {product.priceLabel}
        </p>
        <div className="ProductHoverCard__status flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={product.status} />
          <ProductAction slug={product.slug} status={product.status} />
        </div>
      </div>
    </motion.div>
  );
};
