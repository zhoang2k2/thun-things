import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductOrderBar } from '@/components/product/ProductOrderBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { copy } from '@/content/copy/vi';
import { getAllSlugs, getProductBySlug, getRelatedProducts, toCardModel } from '@/lib/catalog';
import { productJsonLd } from '@/lib/seo/jsonLd';
import { buildMetadata } from '@/lib/seo/metadata';

// Every product is prerendered. Unknown slugs never reach this page: proxy.ts rewrites them
// to a real 404 because Partial Prerendering would stream a 200 before notFound() runs.
export const generateStaticParams = () => getAllSlugs().map((slug) => ({ slug }));

export async function generateMetadata({
  params,
}: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name.vi,
    description: product.description.vi,
    path: `/products/${slug}`,
  });
}

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product).map(toCardModel);
  const { front, back, lifestyle = [] } = product.media;
  const images = [front, ...(back ? [back] : []), ...lifestyle];

  return (
    <article className="ProductPage">
      <JsonLd data={productJsonLd(product)} />
      <div className="ProductPage__main grid md:grid-cols-12">
        <div className="ProductPage__gallery md:col-span-7">
          <ProductGallery images={images} />
        </div>
        <div className="ProductPage__info px-4 py-8 md:col-span-5 md:px-12 md:py-12">
          <div className="md:sticky md:top-[calc(var(--header-height)+48px)]">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
      <section aria-labelledby="related-heading" className="ProductPage__related mt-24">
        <h2
          id="related-heading"
          className="px-4 pb-6 text-sm font-medium tracking-wide uppercase md:px-8"
        >
          {copy.product.relatedHeading}
        </h2>
        <ProductGrid products={related} />
      </section>
      <ProductOrderBar product={product} />
    </article>
  );
}
