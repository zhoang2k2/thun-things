import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { homeMetadata } from '@/lib/seo/pageMetadata';

import { generateMetadata as productMetadata } from '@/app/products/[slug]/page';

describe('homeMetadata', () => {
  it.each([undefined, '1', 'abc', '0', ['1']])('uses the root canonical for %j', (param) => {
    const metadata = homeMetadata(param);
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata).not.toHaveProperty('title');
  });

  it('gives page 2 its own canonical, title and description', () => {
    const metadata = homeMetadata('2');
    expect(metadata.alternates?.canonical).toBe('/?page=2');
    expect(metadata.title).toBe('Trang 2');
    expect(metadata.description).toMatch(/ Trang 2\.$/);
  });

  it('clamps an out-of-range page to the last page', () => {
    expect(homeMetadata('99').alternates?.canonical).toBe('/?page=2');
    expect(homeMetadata('99').title).toBe('Trang 2');
  });
});

describe('product metadata', () => {
  it('uses the product name as title and its description', async () => {
    const slug = getAllSlugs()[0]!;
    const product = getProductBySlug(slug)!;
    const metadata = await productMetadata({ params: Promise.resolve({ slug }) } as never);
    expect(metadata.title).toBe(product.name.vi);
    expect(metadata.description).toBe(product.description.vi);
    expect(metadata.alternates?.canonical).toBe(`/products/${slug}`);
  });
});
