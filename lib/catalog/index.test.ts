import { describe, expect, it } from 'vitest';

import {
  getAllSlugs,
  getProductBySlug,
  getQuizOptions,
  getRelatedProducts,
  listProducts,
  PAGE_SIZE,
  toCardModel,
} from '@/lib/catalog';
import { productStatusSchema } from '@/lib/catalog/schema';

describe('mock catalog', () => {
  it('has 24 products, 14 in stock and 10 sold out (P9a2 migration)', () => {
    const slugs = getAllSlugs();
    expect(slugs).toHaveLength(24);
    const statuses = slugs.map((slug) => getProductBySlug(slug)!.status);
    expect(statuses.filter((status) => status === 'available')).toHaveLength(14);
    expect(statuses.filter((status) => status === 'sold_out')).toHaveLength(10);
    expect([...new Set(statuses)].sort()).toEqual([...productStatusSchema.options].sort());
  });

  it('keeps no note written for a removed status', () => {
    for (const slug of getAllSlugs())
      expect(getProductBySlug(slug)!.statusNote, slug).toBeUndefined();
  });
});

describe('listProducts', () => {
  it('returns the first page by default', () => {
    const result = listProducts();
    expect(PAGE_SIZE).toBe(20);
    expect(result).toMatchObject({ page: 1, pageCount: 2, total: 24 });
    expect(result.items).toHaveLength(20);
  });

  it('returns the remainder on page 2', () => {
    expect(listProducts('2').items).toHaveLength(4);
  });

  it.each(['0', '-1', 'abc', '1.5', ''])('treats %j as page 1', (value) => {
    expect(listProducts(value).page).toBe(1);
  });

  it('clamps pages beyond the last one', () => {
    expect(listProducts('99').page).toBe(2);
  });

  it('uses the first value of a repeated param', () => {
    expect(listProducts(['2', '1']).page).toBe(2);
  });
});

describe('getRelatedProducts', () => {
  it('excludes the product and prefers a shared colour', () => {
    const product = getProductBySlug(getAllSlugs()[0])!;
    const related = getRelatedProducts(product);
    expect(related).toHaveLength(4);
    expect(related.map((item) => item.id)).not.toContain(product.id);
    const colourIds = new Set(product.colors.map((colour) => colour.id));
    expect(related[0].colors.some((colour) => colourIds.has(colour.id))).toBe(true);
  });
});

describe('toCardModel', () => {
  it('offers the back photo for the x-ray lens, falling back to the front (P11)', () => {
    const product = getProductBySlug(getAllSlugs()[0])!;
    expect(toCardModel(product).backImage).toEqual(product.media.back ?? product.media.front);
    const noBack = { ...product, media: { front: product.media.front } };
    expect(toCardModel(noBack).backImage).toEqual(product.media.front);
  });

  it('flattens a product for the grid', () => {
    const product = getProductBySlug(getAllSlugs()[0])!;
    const model = toCardModel(product);
    expect(model).toMatchObject({ id: product.id, slug: product.slug, name: product.name.vi });
    expect(model.priceLabel).toMatch(/₫$/);
    expect(model.image).toEqual(product.media.front);
  });
});

it('builds English card labels from the existing catalog without modifying it', () => {
  const product = getProductBySlug('hoang-hon-01')!;
  const before = structuredClone(product);
  expect(toCardModel(product, 'en')).toMatchObject({
    name: product.name.en,
    priceLabel: '₫390,000',
  });
  expect(product).toEqual(before);
});

describe('getQuizOptions', () => {
  it('lists only colours used by a product, once each, in catalog order', () => {
    const { colors } = getQuizOptions();
    const used = new Set(
      getAllSlugs().flatMap((slug) => getProductBySlug(slug)!.colors.map((color) => color.id)),
    );
    expect(colors.map((color) => color.id).sort()).toEqual([...used].sort());
    expect(new Set(colors.map((color) => color.id)).size).toBe(colors.length);
  });

  it('lists the distinct vibes sorted', () => {
    const { vibes } = getQuizOptions();
    expect(vibes).toEqual(['art', 'graphic', 'minimal', 'retro', 'street']);
  });
});
