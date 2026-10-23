import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { homeMetadata } from '@/lib/seo/pageMetadata';
import messages from '@/messages/vi.json';

import { generateMetadata as productMetadata } from '@/app/[locale]/products/[slug]/page';

describe('homeMetadata', () => {
  it.each([undefined, '1', 'abc', '0', ['1']])('uses the root canonical for %j', (param) => {
    const metadata = homeMetadata(param, 'vi');
    expect(metadata.alternates?.canonical).toBe('/vi');
    expect(metadata).not.toHaveProperty('title');
  });

  it('gives page 2 its own canonical, title and description', () => {
    const metadata = homeMetadata('2', 'vi');
    expect(metadata.alternates?.canonical).toBe('/vi?page=2');
    expect(metadata.title).toEqual({ absolute: 'Trang 2 · Thun Things' });
    expect(metadata.description).toMatch(/ Trang 2\.$/);
  });

  it('clamps an out-of-range page to the last page', () => {
    expect(homeMetadata('99', 'vi').alternates?.canonical).toBe('/vi?page=2');
    expect(homeMetadata('99', 'vi').title).toEqual({ absolute: 'Trang 2 · Thun Things' });
  });
});

describe('product metadata', () => {
  it.each(['vi', 'en'])(
    'uses the product name, description and %s share image next to the page',
    async (locale) => {
      const slug = getAllSlugs()[0]!;
      const product = getProductBySlug(slug)!;
      const metadata = await productMetadata({
        params: Promise.resolve({ locale, slug }),
      } as unknown as Parameters<typeof productMetadata>[0]);
      expect(metadata.title).toBe(product.name.vi);
      expect(metadata.description).toBe(product.description.vi);
      expect(metadata.alternates?.canonical).toBe(`/${locale}/products/${slug}`);
      expect(metadata.openGraph).toMatchObject({
        images: [{ url: `/${locale}/products/${slug}/opengraph-image`, alt: product.name.vi }],
      });
    },
  );
});

describe('description length', () => {
  const inRange = (text: string) => {
    expect(text.length).toBeGreaterThanOrEqual(50);
    expect(text.length).toBeLessThanOrEqual(160);
  };

  it('keeps every page description within 50-160 characters and unique', () => {
    const descriptions = Object.values(messages.pages).map((page) => page.description);
    descriptions.forEach(inRange);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('keeps the paginated Home description in range', () => {
    inRange(homeMetadata('2', 'vi').description as string);
  });

  it('keeps every product description within 50-160 characters', () => {
    for (const slug of getAllSlugs()) {
      const text = getProductBySlug(slug)!.description.vi;
      expect(text.length, slug).toBeGreaterThanOrEqual(50);
      expect(text.length, slug).toBeLessThanOrEqual(160);
    }
  });
});
