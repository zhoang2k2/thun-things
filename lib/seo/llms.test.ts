import { describe, expect, it } from 'vitest';

import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { formatPriceVND } from '@/lib/catalog/format';
import { buildLlmsTxt } from '@/lib/seo/llms';
import messages from '@/messages/vi.json';

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
        `- [${product.name.vi}](http://localhost:3000/products/${slug}): ${formatPriceVND(product.priceVND)}, ${messages.product.status[product.status]}`,
      );
    }
  });

  it('links About, Contact and both policies', () => {
    for (const path of ['/about', '/contact', '/policy/privacy', '/policy/returns']) {
      expect(text).toContain(`](http://localhost:3000${path})`);
    }
  });
});
