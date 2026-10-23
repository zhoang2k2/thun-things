import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { homeMetadata } from '@/lib/seo/pageMetadata';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

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

  it('puts the page number in English word order on /en', () => {
    const metadata = homeMetadata('2', 'en');
    expect(metadata.alternates?.canonical).toBe('/en?page=2');
    expect(metadata.title).toEqual({ absolute: 'Page 2 · Thun Things' });
    expect(metadata.description).toMatch(/ Page 2\.$/);
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

  // Every meta description: the pages, the 404 and the site default, in both locales.
  const descriptionsOf = (messages: typeof vi) => [
    ...Object.values(messages.pages).map((page) => page.description),
    messages.errors.notFound.description,
  ];

  it.each([
    ['vi', vi],
    ['en', en],
  ])('keeps every %s page description within 50-160 characters', (_locale, messages) => {
    descriptionsOf(messages).forEach(inRange);
  });

  it('keeps the English site default description in range', () => {
    inRange(en.site.description);
  });

  it('keeps page descriptions unique across both locales', () => {
    const descriptions = [...descriptionsOf(vi), ...descriptionsOf(en)];
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it.each(['vi', 'en'] as const)('keeps the paginated %s Home description in range', (locale) => {
    inRange(homeMetadata('2', locale).description as string);
  });

  it('keeps every product description within 50-160 characters', () => {
    for (const slug of getAllSlugs()) {
      const text = getProductBySlug(slug)!.description.vi;
      expect(text.length, slug).toBeGreaterThanOrEqual(50);
      expect(text.length, slug).toBeLessThanOrEqual(160);
    }
  });
});
