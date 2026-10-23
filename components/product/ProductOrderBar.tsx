import Link from 'next/link';

import { ProductAction } from '@/components/product/ProductAction';
import { buttonClasses } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';
import { contactHref } from '@/lib/catalog/status';

// P2-10: mobile-only bar pinned to the bottom so ordering is always one tap away.
export const ProductOrderBar = ({ product }: { product: Product }) => (
  <div className="ProductOrderBar bg-canvas border-line fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t px-4 py-4 md:hidden">
    <p className="ProductOrderBar__price shrink-0 text-sm leading-6 font-medium">
      {formatPriceVND(product.priceVND)}
    </p>
    {product.status === 'sold_out' ? (
      <Link
        href={contactHref(product.slug, 'notify')}
        className={buttonClasses({ variant: 'secondary', size: 'lg', className: 'flex-1' })}
      >
        {copy.product.actions.notify}
      </Link>
    ) : (
      <ProductAction slug={product.slug} status={product.status} size="lg" className="flex-1" />
    )}
  </div>
);
