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
    ['sold_out', 'BackOrder'],
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
    expect(data.url).toBe(`http://localhost:3000/vi/products/${base.slug}`);
    expect(data.image).toBe(`http://localhost:3000/vi/products/${base.slug}/opengraph-image`);
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
      url: 'http://localhost:3000/vi',
      logo: 'http://localhost:3000/apple-icon',
    });
    expect(data).not.toHaveProperty('email');
    expect(data).not.toHaveProperty('sameAs');
  });

  it('describes the website', () => {
    expect(websiteJsonLd()).toMatchObject({
      '@type': 'WebSite',
      name: 'Thun Things',
      url: 'http://localhost:3000/vi',
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

it('uses English catalog fields and localized structured data URLs', () => {
  expect(
    productJsonLd({ ...base, name: { ...base.name, en: 'English product' } }, 'en'),
  ).toMatchObject({
    name: 'English product',
    url: `http://localhost:3000/en/products/${base.slug}`,
  });
  expect(websiteJsonLd('en')).toMatchObject({ inLanguage: 'en', url: 'http://localhost:3000/en' });
});

it('only uses inLanguage on schema types that support it', () => {
  expect(organizationJsonLd('en')).not.toHaveProperty('inLanguage');
  expect(productJsonLd(base, 'en')).not.toHaveProperty('inLanguage');
  expect(websiteJsonLd('en')).toHaveProperty('inLanguage', 'en');
});
