import { describe, expect, it } from 'vitest';

import { buildPrompt } from '@/lib/ai/prompt';
import { getProductBySlug } from '@/lib/catalog';

const SLUG = 'hoang-hon-01';
const product = getProductBySlug(SLUG)!;
const color = product.colors[0]!;
const vibe = product.vibes[0];

describe('buildPrompt', () => {
  it('describes the product and the answer in Vietnamese', () => {
    const result = buildPrompt({ locale: 'vi', color: color.id, vibe, slug: SLUG })!;
    expect(result.system).toMatch(/Vietnamese/);
    expect(result.prompt).toContain(product.name.vi);
    expect(result.prompt).toContain(product.description.vi);
    expect(result.prompt).toContain(color.label.vi);
  });

  it('describes the product and the answer in English', () => {
    const result = buildPrompt({ locale: 'en', color: color.id, vibe, slug: SLUG })!;
    expect(result.system).toMatch(/English/);
    expect(result.prompt).toContain(product.name.en);
    expect(result.prompt).toContain(color.label.en);
  });

  it('uses the vibe label, not the tag, and omits the style when skipped', () => {
    const withVibe = buildPrompt({ locale: 'en', color: color.id, vibe: 'street', slug: SLUG })!;
    expect(withVibe.prompt).toContain('Street');
    const without = buildPrompt({ locale: 'en', color: color.id, slug: SLUG })!;
    expect(without.prompt).not.toMatch(/style they chose/i);
  });

  it('never includes the price', () => {
    const { prompt, system } = buildPrompt({ locale: 'vi', color: color.id, slug: SLUG })!;
    expect(`${system}\n${prompt}`).not.toContain(String(product.priceVND));
    expect(prompt).not.toMatch(/₫|VND|\d{3}\.\d{3}/);
  });

  it('forbids links, prices, emoji and invented claims in the instruction', () => {
    const { system } = buildPrompt({ locale: 'en', color: color.id, slug: SLUG })!;
    expect(system).toMatch(/two sentences/i);
    expect(system).toMatch(/no prices/i);
    expect(system).toMatch(/no links/i);
    expect(system).toMatch(/emoji/i);
  });

  it('returns null for an unknown product', () => {
    expect(buildPrompt({ locale: 'vi', color: color.id, slug: 'missing' })).toBeNull();
  });
});
