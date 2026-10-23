import 'server-only';

import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { localizedPath } from '@/i18n/routing';
import type { Product, ProductStatus } from '@/lib/catalog/schema';
import { siteUrl } from '@/lib/seo/metadata';

const CONTEXT = 'https://schema.org';
const { site } = getMessagesFor(DEFAULT_LOCALE);

const AVAILABILITY: Record<ProductStatus, string> = {
  available: 'InStock',
  limited: 'InStock',
  sold_out: 'OutOfStock',
  preorder: 'PreOrder',
  coming_soon: 'PreSale',
};

export const organizationJsonLd = (): object => ({
  '@context': CONTEXT,
  '@type': 'Organization',
  name: site.name,
  url: siteUrl('/'),
  logo: siteUrl('/apple-icon'),
  ...(siteConfig.contactEmail && { email: siteConfig.contactEmail }),
  ...(siteConfig.socials.length > 0 && { sameAs: siteConfig.socials.map((link) => link.href) }),
});

export const websiteJsonLd = (): object => ({
  '@context': CONTEXT,
  '@type': 'WebSite',
  name: site.name,
  url: siteUrl('/'),
});

export const productJsonLd = (product: Product): object => {
  // Vietnamese URLs until JSON-LD becomes locale-aware (P5 Task 4).
  const path = localizedPath(DEFAULT_LOCALE, `/products/${product.slug}`);
  const url = siteUrl(path);
  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: product.name.vi,
    description: product.description.vi,
    sku: product.id,
    url,
    image: siteUrl(`${path}/opengraph-image`),
    offers: {
      '@type': 'Offer',
      price: product.priceVND,
      priceCurrency: 'VND',
      availability: `${CONTEXT}/${AVAILABILITY[product.status]}`,
      url,
    },
  };
};

/** JSON for a `<script type="application/ld+json">`; `<` is escaped so text can never close the tag. */
export const serializeJsonLd = (data: object): string =>
  JSON.stringify(data).replaceAll('<', '\\u003c');
