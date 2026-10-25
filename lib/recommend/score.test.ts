import { describe, expect, it } from 'vitest';

import type { Product, ProductStatus } from '@/lib/catalog/schema';
import { rankProducts, scoreProduct } from '@/lib/recommend/score';

const product = (
  slug: string,
  {
    colors = ['black'],
    vibes = ['art'],
    status = 'available',
    releasedAt,
  }: {
    colors?: string[];
    vibes?: string[];
    status?: ProductStatus;
    releasedAt?: string;
  } = {},
): Product => ({
  id: slug,
  slug,
  name: { vi: slug, en: slug },
  description: { vi: 'mô tả', en: 'description' },
  priceVND: 390000,
  status,
  colors: colors.map((id) => ({ id, label: { vi: id, en: id }, hex: '#111111' })),
  vibes,
  media: { front: { width: 4, height: 5, alt: { vi: slug, en: slug } } },
  ...(releasedAt ? { releasedAt } : {}),
});

const slugs = (ranked: Product[]) => ranked.map((item) => item.slug);

describe('scoreProduct', () => {
  it('weighs colour 3, vibe 2 and the status bonus', () => {
    const answer = { color: 'black', vibe: 'art' };
    expect(scoreProduct(product('a'), answer)).toBe(3 + 2 + 1);
    expect(scoreProduct(product('e', { status: 'sold_out' }), answer)).toBe(5);
    expect(scoreProduct(product('f', { colors: ['white'], vibes: ['retro'] }), answer)).toBe(1);
  });
});

describe('rankProducts', () => {
  const catalog = [
    product('vibe-only', { colors: ['white'], vibes: ['art'] }),
    product('colour-only', { colors: ['black'], vibes: ['retro'] }),
    product('exact', { colors: ['black'], vibes: ['art'] }),
    product('neither', { colors: ['white'], vibes: ['retro'] }),
  ];

  it('ranks exact, then colour-only, then vibe-only', () => {
    const { match, ranked } = rankProducts(catalog, { color: 'black', vibe: 'art' });
    expect(match).toBe('exact');
    expect(slugs(ranked)).toEqual(['exact', 'colour-only', 'vibe-only', 'neither']);
  });

  it('reports the kind of match of the featured product', () => {
    expect(rankProducts(catalog.slice(0, 2), { color: 'black', vibe: 'art' }).match).toBe('color');
    expect(rankProducts([catalog[0]], { color: 'black', vibe: 'art' }).match).toBe('vibe');
    expect(rankProducts([catalog[3]], { color: 'black', vibe: 'art' }).match).toBe('none');
  });

  it('works without a vibe (vibe step skipped)', () => {
    const { match, ranked } = rankProducts(catalog, { color: 'black' });
    expect(match).toBe('color');
    expect(slugs(ranked).slice(0, 2)).toEqual(['colour-only', 'exact']);
  });

  it('ranks sold-out after in-stock among equal matches', () => {
    const { ranked } = rankProducts(
      [product('gone', { status: 'sold_out' }), product('here', { status: 'available' })],
      { color: 'black', vibe: 'art' },
    );
    expect(slugs(ranked)).toEqual(['here', 'gone']);
  });

  it('still puts an exact sold-out match before an in-stock colour-only match', () => {
    const { match, ranked } = rankProducts(
      [
        product('colour-only', { vibes: ['retro'] }),
        product('exact-sold-out', { status: 'sold_out' }),
      ],
      { color: 'black', vibe: 'art' },
    );
    expect(match).toBe('exact');
    expect(slugs(ranked)).toEqual(['exact-sold-out', 'colour-only']);
  });

  it('breaks ties by status, then newest release, then slug', () => {
    const { ranked } = rankProducts(
      [
        product('b-old', { releasedAt: '2026-01-01' }),
        product('sold', { status: 'sold_out' }),
        product('a-undated'),
        product('c-new', { releasedAt: '2026-09-01' }),
        product('a-old', { releasedAt: '2026-01-01' }),
      ],
      { color: 'black', vibe: 'art' },
    );
    expect(slugs(ranked)).toEqual(['c-new', 'a-old', 'b-old', 'a-undated', 'sold']);
  });

  it('is deterministic for the same input', () => {
    const answer = { color: 'black', vibe: 'art' };
    expect(slugs(rankProducts(catalog, answer).ranked)).toEqual(
      slugs(rankProducts([...catalog].reverse(), answer).ranked),
    );
  });
});
