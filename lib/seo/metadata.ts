import 'server-only';

import type { Metadata } from 'next';

import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { type Locale, localizedPath } from '@/i18n/routing';
import { env } from '@/lib/env';

interface BuildMetadataOptions {
  /** Omit to use the root layout's default title (the site name). */
  title?: string | { absolute: string };
  description: string;
  /** Page locale: canonical and share URLs are `/{locale}{path}`. */
  locale: Locale;
  /** App path without the locale (`/`, `/about`, `/?page=2`). */
  path: string;
  /** Share image path and alt; defaults to the root wordmark image. */
  image?: { url: string; alt: string };
}

const { site } = getMessagesFor(DEFAULT_LOCALE);

export const siteUrl = (path = '/'): string => new URL(path, env.NEXT_PUBLIC_SITE_URL).href;

// Per-page `openGraph` replaces the parent's, so the root `app/opengraph-image` is not inherited.
// An explicit `images` entry also wins over a segment `opengraph-image` file, so product pages
// pass their own image here.
const shareImages = (image?: { url: string; alt: string }) => [
  { url: '/opengraph-image', alt: site.name, ...image, width: 1200, height: 630 },
];

export const buildMetadata = ({
  title,
  description,
  locale,
  path,
  image,
}: BuildMetadataOptions): Metadata => ({
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  // An explicit `title: undefined` would override the root layout's default title.
  ...(title && { title }),
  description,
  alternates: {
    canonical: localizedPath(locale, path),
    languages: {
      vi: localizedPath('vi', path),
      en: localizedPath('en', path),
      'x-default': localizedPath('vi', path),
    },
  },
  openGraph: {
    title: (typeof title === 'object' ? title.absolute : title) ?? site.name,
    description,
    url: localizedPath(locale, path),
    siteName: site.name,
    locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    alternateLocale: [locale === 'vi' ? 'en_US' : 'vi_VN'],
    type: 'website',
    images: shareImages(image),
  },
  twitter: { card: 'summary_large_image', images: shareImages(image) },
});
