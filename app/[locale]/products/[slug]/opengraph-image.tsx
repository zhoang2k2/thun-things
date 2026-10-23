import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { OG_SIZE, renderProductImage } from '@/lib/seo/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';

// Route handlers do not inherit the layout's params, so both segments are listed here.
export const generateStaticParams = () =>
  routing.locales.flatMap((locale) => getAllSlugs().map((slug) => ({ locale, slug })));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return renderProductImage(product);
}
