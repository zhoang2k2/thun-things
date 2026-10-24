import { describe, expect, it } from 'vitest';

import { checkOutput, MAX_RATIONALE_CHARS } from '@/lib/ai/output';

describe('checkOutput', () => {
  it('accepts one or two sentences and trims them', () => {
    expect(checkOutput('  Màu cam hoàng hôn hợp với gu nghệ thuật của bạn.  ')).toBe(
      'Màu cam hoàng hôn hợp với gu nghệ thuật của bạn.',
    );
    expect(checkOutput('Warm and bold. It suits a street look!')).toBe(
      'Warm and bold. It suits a street look!',
    );
  });

  it('accepts text without a closing full stop', () => {
    expect(checkOutput('A calm shirt for slow evenings')).toBe('A calm shirt for slow evenings');
  });

  it.each([
    ['empty', '   '],
    ['three sentences', 'One. Two. Three.'],
    ['a link', 'See https://example.com for more.'],
    ['a bare domain', 'Shop at thunthings.vn today.'],
    ['an email sign', 'Write to us @thunthings.'],
    ['markdown', '**Bold** pick for you.'],
    ['a heading', '# Your match'],
    ['an emoji', 'A sunny pick for you ☀️'],
    ['too long', `${'a'.repeat(MAX_RATIONALE_CHARS)}.`],
  ])('rejects %s', (_, text) => {
    expect(checkOutput(text)).toBeNull();
  });
});
