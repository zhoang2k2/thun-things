import type { MetadataRoute } from 'next';

import { routing, localizedPath } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/catalog';
import { siteUrl } from '@/lib/seo/metadata';
import { shellPaths } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const productPaths = getAllSlugs().map((slug) => `/products/${slug}`);
  return routing.locales.flatMap((locale) =>
    [...shellPaths, ...productPaths].map((path) => ({
      url: siteUrl(localizedPath(locale, path)),
      alternates: {
        languages: {
          vi: siteUrl(localizedPath('vi', path)),
          en: siteUrl(localizedPath('en', path)),
          'x-default': siteUrl(localizedPath('vi', path)),
        },
      },
    })),
  );
}
