import 'server-only';

import type { Metadata } from 'next';

import { copy } from '@/content/copy/vi';
import { env } from '@/lib/env';

interface BuildMetadataOptions {
  /** Omit on the home page so the root default title applies. */
  title?: string | { absolute: string };
  description: string;
  path: string;
  /** Share image path and alt; defaults to the root wordmark image. */
  image?: { url: string; alt: string };
}

export const siteUrl = (path = '/'): string => new URL(path, env.NEXT_PUBLIC_SITE_URL).href;

// Per-page `openGraph` replaces the parent's, so the root `app/opengraph-image` is not inherited.
// An explicit `images` entry also wins over a segment `opengraph-image` file, so product pages
// pass their own image here.
const shareImages = (image?: { url: string; alt: string }) => [
  { url: '/opengraph-image', alt: copy.site.name, ...image, width: 1200, height: 630 },
];

export const buildMetadata = ({
  title,
  description,
  path,
  image,
}: BuildMetadataOptions): Metadata => ({
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  // An explicit `title: undefined` would override the root layout's default title.
  ...(title && { title }),
  description,
  alternates: { canonical: path },
  openGraph: {
    title: (typeof title === 'object' ? title.absolute : title) ?? copy.site.name,
    description,
    url: path,
    siteName: copy.site.name,
    locale: 'vi_VN',
    type: 'website',
    images: shareImages(image),
  },
  twitter: { card: 'summary_large_image', images: shareImages(image) },
});
