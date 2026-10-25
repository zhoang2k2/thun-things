import 'server-only';

import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { type Locale, localizedPath } from '@/i18n/routing';
import type { Product, ProductStatus } from '@/lib/catalog/schema';
import { siteUrl } from '@/lib/seo/metadata';

const CONTEXT = 'https://schema.org';
const { site } = getMessagesFor(DEFAULT_LOCALE);

const AVAILABILITY: Record<ProductStatus, string> = {
  available: 'InStock',
  // Orderable while out of stock: the pre-order offer (P9a2).
  sold_out: 'BackOrder',
};

export const organizationJsonLd = (locale: Locale = DEFAULT_LOCALE): object => ({
  '@context': CONTEXT,
  '@type': 'Organization',
  name: site.name,
  url: siteUrl(localizedPath(locale, '/')),
  logo: siteUrl('/apple-icon'),
  ...(siteConfig.contactEmail && { email: siteConfig.contactEmail }),
  ...(siteConfig.socials.length > 0 && { sameAs: siteConfig.socials.map((link) => link.href) }),
});

export const websiteJsonLd = (locale: Locale = DEFAULT_LOCALE): object => ({
  '@context': CONTEXT,
  '@type': 'WebSite',
  name: site.name,
  url: siteUrl(localizedPath(locale, '/')),
  inLanguage: locale,
});

export const productJsonLd = (product: Product, locale: Locale = DEFAULT_LOCALE): object => {
  const path = localizedPath(locale, `/products/${product.slug}`);
  const url = siteUrl(path);
  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: product.name[locale],
    description: product.description[locale],
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
