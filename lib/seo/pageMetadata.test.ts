import { describe, expect, it } from 'vitest';

import { copy } from '@/content/copy/vi';
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
    const metadata = await productMetadata({
      params: Promise.resolve({ slug }),
    } as unknown as Parameters<typeof productMetadata>[0]);
    expect(metadata.title).toBe(product.name.vi);
    expect(metadata.description).toBe(product.description.vi);
    expect(metadata.alternates?.canonical).toBe(`/products/${slug}`);
  });
});

describe('description length', () => {
  const inRange = (text: string) => {
    expect(text.length).toBeGreaterThanOrEqual(50);
    expect(text.length).toBeLessThanOrEqual(160);
  };

  it('keeps every page description within 50-160 characters and unique', () => {
    const descriptions = Object.values(copy.pages).map((page) => page.description);
    descriptions.forEach(inRange);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('keeps the paginated Home description in range', () => {
    inRange(homeMetadata('2').description as string);
  });

  it('keeps every product description within 50-160 characters', () => {
    for (const slug of getAllSlugs()) {
      const text = getProductBySlug(slug)!.description.vi;
      expect(text.length, slug).toBeGreaterThanOrEqual(50);
      expect(text.length, slug).toBeLessThanOrEqual(160);
    }
  });
});
