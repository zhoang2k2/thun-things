import 'server-only';

import type { Metadata } from 'next';

import { copy } from '@/content/copy/vi';
import { env } from '@/lib/env';

interface BuildMetadataOptions {
  /** Omit on the home page so the root default title applies. */
  title?: string;
  description: string;
  path: string;
}

export const siteUrl = (path = '/'): string => new URL(path, env.NEXT_PUBLIC_SITE_URL).href;

export const buildMetadata = ({ title, description, path }: BuildMetadataOptions): Metadata => ({
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title: title ?? copy.site.name,
    description,
    url: path,
    siteName: copy.site.name,
    locale: 'vi_VN',
    type: 'website',
  },
});
