import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/seo/metadata';
import { shellPaths } from '@/lib/seo/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return shellPaths.map((path) => ({ url: siteUrl(path) }));
}
