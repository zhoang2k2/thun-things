import { describe, expect, it } from 'vitest';

import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

type Tree = { [key: string]: string | Tree };

/** Flattens nested messages into `dotted.key → value` pairs. */
const flatten = (tree: Tree, prefix = ''): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`),
  );

describe.each([
  ['vi', vi],
  ['en', en],
])('messages/%s.json', (_locale, messages) => {
  it('has no empty strings', () => {
    for (const [key, value] of flatten(messages)) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('has no emoji (DR-2)', () => {
    for (const [key, value] of flatten(messages)) {
      expect(value, key).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
});

describe('message key parity', () => {
  it('has exactly the same keys in vi and en', () => {
    const keys = (tree: Tree) =>
      flatten(tree)
        .map(([key]) => key)
        .sort();
    expect(keys(en)).toEqual(keys(vi));
  });
});
