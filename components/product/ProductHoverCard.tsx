'use client';

import { useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useLocale } from 'next-intl';
import type { MouseEvent, PointerEvent } from 'react';

import { motionTokens } from '@/components/motion/tokens';
import { CARD_CLASSES, FRAME_PX, ProductCardFace } from '@/components/product/ProductCardFace';
import { cn } from '@/lib/cn';
import type { ActiveCard } from '@/components/product/ProductGrid';
import { useRouter } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/events';
import type { ProductCardModel } from '@/lib/catalog';

interface ProductHoverCardProps {
  product: ProductCardModel;
  active: ActiveCard;
  /** Keeps the card open while the pointer is on it; leaving it closes the card. */
  onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void;
}

// V-14/V-15 (P2-9): the image never moves or resizes; the card frame and info grow out of it, as if
// the image were lifted into the card (P11-R4-6).
export const ProductHoverCard = ({ product, active, onPointerLeave }: ProductHoverCardProps) => {
  const router = useRouter();
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const href = `/products/${product.slug}`;

  // P11-R4-6: the card grows out of its photo. Closed, the clip is exactly the photo box (16px in
  // from the top and sides, ending at the photo's bottom); open, it is the whole card. The photo
  // itself never moves. Both values share one shape so the clip can be interpolated.
  const photoBottom = FRAME_PX + active.rect.height;
  const closed = reducedMotion
    ? { opacity: 0 }
    : {
        clipPath: `inset(${FRAME_PX}px ${FRAME_PX}px calc(100% - ${photoBottom}px) ${FRAME_PX}px)`,
      };
  const open = reducedMotion ? { opacity: 1 } : { clipPath: 'inset(0px 0px calc(0% - 0px) 0px)' };

  // The whole card opens the product; links inside keep their own behaviour.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) return;
    trackEvent('select_item', { product_id: product.slug, status: product.status, locale });
    router.push(href);
  };

  // Placed by the grid over the hovered cell (wrapper coordinates), 16px outside it on each side.
  const geometry = {
    left: active.rect.left - FRAME_PX,
    top: active.rect.top - FRAME_PX,
    width: active.rect.width + FRAME_PX * 2,
  };

  return (
    <m.div
      data-testid="product-hover-card"
      onClick={handleClick}
      onPointerLeave={onPointerLeave}
      className={cn(CARD_CLASSES, 'ProductHoverCard absolute z-30 cursor-pointer')}
      style={geometry}
      initial={closed}
      animate={open}
      exit={closed}
      transition={{ duration: 0.28, ease: motionTokens.ease.out }}
    >
      <ProductCardFace product={product} image={product.image} href={href} />
    </m.div>
  );
};
