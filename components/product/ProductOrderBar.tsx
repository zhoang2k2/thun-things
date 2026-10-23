import { useTranslations } from 'next-intl';

import { ProductAction } from '@/components/product/ProductAction';
import { buttonClasses } from '@/components/ui/Button';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';

// P2-10: mobile-only bar pinned to the bottom so ordering is always one tap away.
export const ProductOrderBar = ({ product }: { product: Product }) => {
  const t = useTranslations('product.actions');
  return (
    <div className="ProductOrderBar bg-canvas border-line fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t px-4 py-4 md:hidden">
      <p className="ProductOrderBar__price shrink-0 text-sm leading-6 font-medium">
        {formatPriceVND(product.priceVND)}
      </p>
      {product.status === 'sold_out' ? (
        // Jumps to the in-page notify-me form (V-22).
        <a
          href="#notify"
          className={buttonClasses({ variant: 'secondary', size: 'lg', className: 'flex-1' })}
        >
          {t('notify')}
        </a>
      ) : (
        <ProductAction slug={product.slug} status={product.status} size="lg" className="flex-1" />
      )}
    </div>
  );
};
