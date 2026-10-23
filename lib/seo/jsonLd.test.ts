import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import type { Product, ProductStatus } from '@/lib/catalog/schema';
import {
  organizationJsonLd,
  productJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from '@/lib/seo/jsonLd';

const base = getProductBySlug(getAllSlugs()[0]!) as Product;
const withStatus = (status: ProductStatus): Product => ({ ...base, status });

describe('productJsonLd', () => {
  it.each([
    ['available', 'InStock'],
    ['limited', 'InStock'],
    ['sold_out', 'OutOfStock'],
    ['preorder', 'PreOrder'],
    ['coming_soon', 'PreSale'],
  ] as const)('maps %s to %s', (status, schemaValue) => {
    const data = productJsonLd(withStatus(status)) as { offers: { availability: string } };
    expect(data.offers.availability).toBe(`https://schema.org/${schemaValue}`);
  });

  it('uses the catalog number as price and absolute URLs', () => {
    const data = productJsonLd(base) as Record<string, unknown> & {
      offers: Record<string, unknown>;
    };
    expect(data['@type']).toBe('Product');
    expect(data.sku).toBe(base.id);
    expect(data.name).toBe(base.name.vi);
    expect(data.url).toBe(`http://localhost:3000/products/${base.slug}`);
    expect(data.image).toBe(`http://localhost:3000/products/${base.slug}/opengraph-image`);
    expect(data.offers).toMatchObject({
      '@type': 'Offer',
      price: base.priceVND,
      priceCurrency: 'VND',
      url: data.url,
    });
    expect(typeof data.offers.price).toBe('number');
  });
});

describe('site JSON-LD', () => {
  it('describes the organization without unset optional fields', () => {
    const data = organizationJsonLd();
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Thun Things',
      url: 'http://localhost:3000/',
    });
    expect(data).not.toHaveProperty('email');
    expect(data).not.toHaveProperty('sameAs');
  });

  it('describes the website', () => {
    expect(websiteJsonLd()).toMatchObject({
      '@type': 'WebSite',
      name: 'Thun Things',
      url: 'http://localhost:3000/',
    });
  });
});

describe('serializeJsonLd', () => {
  it('never lets catalog text close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>x' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>x' });
  });
});
