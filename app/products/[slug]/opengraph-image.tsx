import { notFound } from 'next/navigation';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { OG_SIZE, renderProductImage } from '@/lib/seo/ogImage';

export const size = OG_SIZE;
export const contentType = 'image/png';

export const generateStaticParams = () => getAllSlugs().map((slug) => ({ slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return renderProductImage(product);
}
