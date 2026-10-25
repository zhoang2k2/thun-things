'use client';

import { useTranslations } from 'next-intl';

import { MediaImage } from '@/components/media/MediaImage';
import { GRID_IMAGE_SIZES } from '@/components/product/ProductTile';
import type { ProductCardModel } from '@/lib/catalog';

// One x-ray cell (P11-5): the design's back photo with name and price printed over it. The cell
// sits exactly on the grid cell it mirrors; only the lens clip makes it visible.
export const XrayCell = ({ product }: { product: ProductCardModel }) => {
  const t = useTranslations('product');
  const { backImage } = product;

  return (
    <li className="XrayCell relative aspect-[4/5]">
      {backImage.src ? (
        <MediaImage
          src={backImage.src}
          alt=""
          width={backImage.width}
          height={backImage.height}
          sizes={GRID_IMAGE_SIZES}
          fill
        />
      ) : (
        <div className="XrayCell__placeholder bg-placeholder text-ink flex h-full items-center justify-center text-sm font-bold tracking-wide">
          {t('lensBackPlaceholder')}
        </div>
      )}
      <p className="XrayCell__label bg-canvas text-ink absolute bottom-0 left-0 flex flex-col px-3 py-2 text-sm leading-5">
        <span className="font-bold">{product.name}</span>
        <span>{product.priceLabel}</span>
      </p>
    </li>
  );
};
