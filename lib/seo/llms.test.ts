import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { formatPriceVND } from '@/lib/catalog/format';
import { buildLlmsTxt } from '@/lib/seo/llms';
import en from '@/messages/en.json';

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt();
  const lines = text.split('\n');

  it('starts with the heading followed by a summary quote', () => {
    expect(lines[0]).toBe('# Thun Things');
    expect(lines.some((line) => line.startsWith('> '))).toBe(true);
  });

  it('lists every product with absolute url, price and status', () => {
    for (const slug of getAllSlugs()) {
      const product = getProductBySlug(slug)!;
      expect(text).toContain(
        `- [${product.name.vi} (vi)](http://localhost:3000/vi/products/${slug}): ${formatPriceVND(product.priceVND, 'en')}, ${en.product.status[product.status]}`,
      );
    }
  });

  it('links About, Contact and both policies', () => {
    for (const path of ['/about', '/contact', '/policy/privacy', '/policy/returns']) {
      expect(text).toContain(`](http://localhost:3000/vi${path})`);
    }
  });
});

it('indexes both locales with English summary and labels', () => {
  const text = buildLlmsTxt();
  expect(text).toContain('> ' + en.pages.home.description);
  for (const locale of ['vi', 'en']) {
    for (const path of [
      '',
      '/about',
      '/contact',
      '/policy/privacy',
      '/policy/returns',
      ...getAllSlugs().map((slug) => `/products/${slug}`),
    ]) {
      expect(text).toContain(`](http://localhost:3000/${locale}${path})`);
    }
  }
});
