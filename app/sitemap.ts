import type { MetadataRoute } from 'next';

import { getAllSlugs } from '@/lib/catalog';
import { siteUrl } from '@/lib/seo/metadata';
import { shellPaths } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const productPaths = getAllSlugs().map((slug) => `/products/${slug}`);
  return [...shellPaths, ...productPaths].map((path) => ({ url: siteUrl(path) }));
}
