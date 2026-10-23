import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
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
export async function generateMetadata({ searchParams }: PageProps<'/'>): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  return homeMetadata(pageParam);
}

// `searchParams` is request data under Cache Components, so the grid streams inside Suspense.
const ProductListing = async ({ searchParams }: Pick<PageProps<'/'>, 'searchParams'>) => {
  const { page: pageParam } = await searchParams;
  const { items, page: current, pageCount } = listProducts(pageParam);

  return (
    <>
      <ProductGrid products={items.map(toCardModel)} />
      <Pagination page={current} pageCount={pageCount} />
    </>
  );
};

export default function HomePage({ searchParams }: PageProps<'/'>) {
  const t = useTranslations();
  return (
    <div className="HomePage">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
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
