import type { MetadataRoute } from 'next';

import { DEFAULT_LOCALE } from '@/i18n/messages';
import { localizedPath } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/catalog';
import { siteUrl } from '@/lib/seo/metadata';
import { shellPaths } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const productPaths = getAllSlugs().map((slug) => `/products/${slug}`);
  // Vietnamese pages only until the multilingual sitemap (P5 Task 4).
  return [...shellPaths, ...productPaths].map((path) => ({
    url: siteUrl(localizedPath(DEFAULT_LOCALE, path)),
  }));
}
