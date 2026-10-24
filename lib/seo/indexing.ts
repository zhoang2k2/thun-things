import type { Metadata, MetadataRoute } from 'next';

// P9-5: the temporary `*.vercel.app` host stays out of search results until the `.com` domain is
// live. Switching NEXT_PUBLIC_SITE_URL to the real domain turns indexing on with no code change.

export const isIndexable = (siteUrl: string): boolean => {
  const host = new URL(siteUrl).hostname;
  return host !== 'vercel.app' && !host.endsWith('.vercel.app');
};

export const robotsFor = (siteUrl: string): MetadataRoute.Robots =>
  isIndexable(siteUrl)
    ? {
        rules: { userAgent: '*', allow: '/' },
        sitemap: new URL('/sitemap.xml', siteUrl).href,
      }
    : { rules: { userAgent: '*', disallow: '/' } };

export const robotsMetadataFor = (siteUrl: string): Pick<Metadata, 'robots'> =>
  isIndexable(siteUrl) ? {} : { robots: { index: false, follow: false } };
