import { Suspense } from 'react';

import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { Pagination } from '@/components/product/Pagination';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { banners } from '@/content/banners';
import { copy } from '@/content/copy/vi';
import { listProducts, toCardModel } from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.home;

export const metadata = buildMetadata({ description: page.description, path: '/' });

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
