import { describe, expect, it } from 'vitest';

import {
  getAllSlugs,
  getProductBySlug,
  getRelatedProducts,
  listProducts,
  PAGE_SIZE,
  toCardModel,
} from '@/lib/catalog';
import { productStatusSchema } from '@/lib/catalog/schema';

describe('mock catalog', () => {
  it('has 24 products covering every status', () => {
    const slugs = getAllSlugs();
    expect(slugs).toHaveLength(24);
    const statuses = new Set(slugs.map((slug) => getProductBySlug(slug)?.status));
    expect([...statuses].sort()).toEqual([...productStatusSchema.options].sort());
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
  it('flattens a product for the grid', () => {
    const product = getProductBySlug(getAllSlugs()[0])!;
    const model = toCardModel(product);
    expect(model).toMatchObject({ id: product.id, slug: product.slug, name: product.name.vi });
    expect(model.priceLabel).toMatch(/₫$/);
    expect(model.image).toEqual(product.media.front);
  });
});
