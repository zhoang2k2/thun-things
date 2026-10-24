import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/seo/metadata';
import { robotsFor } from '@/lib/seo/indexing';

export default function robots(): MetadataRoute.Robots {
  return robotsFor(siteUrl());
}
