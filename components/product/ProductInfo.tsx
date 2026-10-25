import { useLocale, useTranslations } from 'next-intl';

import { ProductAction } from '@/components/product/ProductAction';
import { StatusBadge } from '@/components/product/StatusBadge';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';

// V-11 right column. P9a2: sold-out designs offer pre-order (with the discount line) instead of
// the former notify-me form.
export const ProductInfo = ({ product }: { product: Product }) => {
  const locale = useLocale();
  const t = useTranslations('product.details');

  return (
    <div className="ProductInfo flex flex-col gap-6">
      <div className="ProductInfo__header flex flex-col gap-2">
        <h1 className="ProductInfo__name text-4xl leading-none font-bold tracking-tight md:text-5xl">
          {product.name[locale]}
        </h1>
        <p className="ProductInfo__price text-lg leading-7">
          {formatPriceVND(product.priceVND, locale)}
        </p>
      </div>

      <div className="ProductInfo__status flex flex-col items-start gap-2">
        <StatusBadge status={product.status} />
        {product.statusNote && (
          <p className="text-ink-muted text-sm leading-5">{product.statusNote[locale]}</p>
        )}
      </div>

      <ProductAction
        slug={product.slug}
        status={product.status}
        size="lg"
        // Mobile uses the sticky order bar for the button; the discount line still shows here.
        className="hidden self-start md:inline-flex"
      />

      <p className="ProductInfo__description max-w-prose leading-6">
        {product.description[locale]}
      </p>

      <dl className="ProductInfo__details border-line grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 border-t pt-6 text-sm leading-5">
        {product.sizes && (
          <>
            <dt className="text-ink-muted tracking-wide uppercase">{t('sizes')}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <li key={size} className="border-line border px-2 py-1">
                    {size}
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {product.material && (
          <>
            <dt className="text-ink-muted tracking-wide uppercase">{t('material')}</dt>
            <dd>{product.material[locale]}</dd>
          </>
        )}
        {product.care && (
          <>
            <dt className="text-ink-muted tracking-wide uppercase">{t('care')}</dt>
            <dd>{product.care[locale]}</dd>
          </>
        )}
      </dl>
    </div>
  );
};
