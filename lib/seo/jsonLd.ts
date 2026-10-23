import 'server-only';

import { siteConfig } from '@/config/site';
import { copy } from '@/content/copy/vi';
import type { Product, ProductStatus } from '@/lib/catalog/schema';
import { siteUrl } from '@/lib/seo/metadata';

const CONTEXT = 'https://schema.org';

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
  name: copy.site.name,
  url: siteUrl('/'),
  logo: siteUrl('/apple-icon'),
  ...(siteConfig.contactEmail && { email: siteConfig.contactEmail }),
  ...(siteConfig.socials.length > 0 && { sameAs: siteConfig.socials.map((link) => link.href) }),
});

export const websiteJsonLd = (): object => ({
  '@context': CONTEXT,
  '@type': 'WebSite',
  name: copy.site.name,
  url: siteUrl('/'),
});

export const productJsonLd = (product: Product): object => {
  const url = siteUrl(`/products/${product.slug}`);
  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: product.name.vi,
    description: product.description.vi,
    sku: product.id,
    url,
    image: siteUrl(`/products/${product.slug}/opengraph-image`),
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
