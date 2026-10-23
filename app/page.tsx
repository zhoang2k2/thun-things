import type { Metadata } from 'next';
import { Suspense } from 'react';

import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { Pagination } from '@/components/product/Pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { banners } from '@/content/banners';
import { copy } from '@/content/copy/vi';
import { listProducts, toCardModel } from '@/lib/catalog';
import { homeMetadata } from '@/lib/seo/pageMetadata';

const page = copy.pages.home;

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
  return (
    <div className="HomePage">
      <h1 className="sr-only">{page.title}</h1>
      <HeroSlideshow banners={banners} />
      <section aria-labelledby="products-heading" className="HomePage__products">
        <h2 id="products-heading" className="sr-only">
          {copy.product.gridHeading}
        </h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductListing searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
