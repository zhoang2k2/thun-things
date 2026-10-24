import type { Metadata } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { Pagination } from '@/components/product/Pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { JsonLd } from '@/components/seo/JsonLd';
import { banners } from '@/content/banners';
import { listProducts, toCardModel } from '@/lib/catalog';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonLd';
import { homeMetadata } from '@/lib/seo/pageMetadata';

// Metadata reads `searchParams` (request data). The grid already streams inside Suspense below,
// so the shell stays prerendered and metadata streams in with it.
export async function generateMetadata({
  searchParams,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const [{ page: pageParam }, locale] = await Promise.all([searchParams, getLocale()]);
  return homeMetadata(pageParam, locale);
}

// `searchParams` is request data under Cache Components, so the grid streams inside Suspense.
const ProductListing = async ({ searchParams }: Pick<PageProps<'/[locale]'>, 'searchParams'>) => {
  const [{ page: pageParam }, locale] = await Promise.all([searchParams, getLocale()]);
  const { items, page: current, pageCount } = listProducts(pageParam);

  const products = items.map((product) => toCardModel(product, locale));

  return (
    <>
      <ProductGrid products={products} />
      <Pagination page={current} pageCount={pageCount} />
    </>
  );
};

export default function HomePage({ searchParams }: PageProps<'/[locale]'>) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="HomePage">
      <JsonLd data={organizationJsonLd(locale)} />
      <JsonLd data={websiteJsonLd(locale)} />
      <h1 className="sr-only">{t('pages.home.title')}</h1>
      <HeroSlideshow banners={banners} />
      <section aria-labelledby="products-heading" className="HomePage__products">
        <h2 id="products-heading" className="sr-only">
          {t('product.gridHeading')}
        </h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductListing searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
