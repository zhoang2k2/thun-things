import { NotifyForm } from '@/components/forms/NotifyForm';
import { ProductAction } from '@/components/product/ProductAction';
import { StatusBadge } from '@/components/product/StatusBadge';
import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';
import { getFormReadiness } from '@/lib/leads/readiness';

const { details } = copy.product;

// V-11 right column; V-22 in-page notify-me form for sold-out products (P3).
// Readiness is read when the page is prerendered; the server function re-checks it per request.
export const ProductInfo = ({ product }: { product: Product }) => {
  const soldOut = product.status === 'sold_out';

  return (
    <div className="ProductInfo flex flex-col gap-6">
      <div className="ProductInfo__header flex flex-col gap-2">
        <h1 className="ProductInfo__name text-4xl leading-none font-bold tracking-tight md:text-5xl">
          {product.name.vi}
        </h1>
        <p className="ProductInfo__price text-lg leading-7">{formatPriceVND(product.priceVND)}</p>
      </div>

      <div className="ProductInfo__status flex flex-col items-start gap-2">
        <StatusBadge status={product.status} />
        {product.statusNote && (
          <p className="text-ink-muted text-sm leading-5">{product.statusNote.vi}</p>
        )}
      </div>

      {soldOut ? (
        <NotifyForm
          productSlug={product.slug}
          enabled={getFormReadiness().enabled}
          contactEmail={siteConfig.contactEmail}
        />
      ) : (
        <ProductAction
          slug={product.slug}
          status={product.status}
          size="lg"
          // Mobile uses the sticky order bar instead.
          className="hidden self-start md:inline-flex"
        />
      )}

      <p className="ProductInfo__description max-w-prose leading-6">{product.description.vi}</p>

      <dl className="ProductInfo__details border-line grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 border-t pt-6 text-sm leading-5">
        {product.sizes && (
          <>
            <dt className="text-ink-muted tracking-wide uppercase">{details.sizes}</dt>
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
            <dt className="text-ink-muted tracking-wide uppercase">{details.material}</dt>
            <dd>{product.material.vi}</dd>
          </>
        )}
        {product.care && (
          <>
            <dt className="text-ink-muted tracking-wide uppercase">{details.care}</dt>
            <dd>{product.care.vi}</dd>
          </>
        )}
      </dl>
    </div>
  );
};
