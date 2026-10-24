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

// Latin letters with diacritics (Vietnamese uses Latin-1 Supplement, Latin Extended and
// Latin Extended Additional) plus combining marks, so decomposed (NFD) Vietnamese is caught too.
// English copy must not leak Vietnamese.
const DIACRITICS = /[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/u;
// Language names may stay in their own language.
const ALLOWED_VIETNAMESE = new Set(['localeSwitcher.vi']);

describe('English copy', () => {
  it('has no Vietnamese diacritics outside the allow-list', () => {
    for (const [key, value] of flatten(en)) {
      if (ALLOWED_VIETNAMESE.has(key)) continue;
      expect(value, key).not.toMatch(DIACRITICS);
    }
  });

  it('rewrites every sentence instead of reusing the Vietnamese', () => {
    const viValues = new Map(flatten(vi));
    // Brand, field names and loanwords that read the same in both languages.
    const shared = new Set([
      'site.name',
      'pages.home.title',
      'localeSwitcher.vi',
      'localeSwitcher.en',
      'media.placeholderLabel',
      'footer.emailLabel',
      'forms.fields.email',
      'forms.fields.size',
    ]);
    for (const [key, value] of flatten(en)) {
      if (shared.has(key)) continue;
      expect(value, key).not.toBe(viValues.get(key));
    }
  });
});
