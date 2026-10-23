'use client';

import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import { motionTokens } from '@/components/motion/tokens';
import { ProductAction } from '@/components/product/ProductAction';
import type { ActiveCard } from '@/components/product/ProductGrid';
import { StatusBadge } from '@/components/product/StatusBadge';
import type { ProductCardModel } from '@/lib/catalog';

// 16px photo-print frame (8-point grid): the card sits 16px outside the cell on every side but the
// bottom, so its image lands exactly on the cell image. 1px border + 15px padding = 16px.
const FRAME_PX = 16;

interface ProductHoverCardProps {
  product: ProductCardModel;
  active: ActiveCard;
}

// V-14/V-15 (P2-9): the image never moves or resizes; the card is revealed around it by a circle
// spreading from the pointer entry point, as if the image were lifted into the card.
export const ProductHoverCard = ({ product, active }: ProductHoverCardProps) => {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const href = `/products/${product.slug}`;

  const originX = active.origin.x + FRAME_PX;
  const originY = active.origin.y + FRAME_PX;
  // Large enough to cover the card from any entry point (card is at most ~2× the cell height).
  const radius = Math.hypot(active.rect.width + FRAME_PX * 2, active.rect.height * 2);
  const closed = reducedMotion
    ? { opacity: 0 }
    : { clipPath: `circle(0px at ${originX}px ${originY}px)` };
  const open = reducedMotion
    ? { opacity: 1 }
    : { clipPath: `circle(${radius}px at ${originX}px ${originY}px)` };

  // The whole card opens the product; links inside keep their own behaviour.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) return;
    router.push(href);
  };

  return (
    <m.div
      data-testid="product-hover-card"
      onClick={handleClick}
      className="ProductHoverCard bg-canvas border-line absolute -top-4 -left-4 z-30 w-[calc(100%+32px)] cursor-pointer border p-[15px]"
      initial={closed}
      animate={open}
      exit={closed}
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
      <div className="ProductHoverCard__info flex flex-col pt-4">
        <p className="ProductHoverCard__name text-base leading-6 font-bold">{product.name}</p>
        <div className="ProductHoverCard__meta mt-2 flex items-center justify-between gap-2">
          <p className="ProductHoverCard__price text-sm leading-6">{product.priceLabel}</p>
          <StatusBadge status={product.status} />
        </div>
        <ProductAction
          slug={product.slug}
          status={product.status}
          size="lg"
          className="mt-4 w-full"
        />
      </div>
    </m.div>
  );
};
