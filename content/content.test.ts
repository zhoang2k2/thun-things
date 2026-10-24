import { describe, expect, it } from 'vitest';

import { about } from '@/content/about';
import { banners } from '@/content/banners';
import { privacyPolicy } from '@/content/policies/privacy';
import { returnsPolicy } from '@/content/policies/returns';
import type { PolicyDocument } from '@/content/policies/types';

// Latin letters with diacritics plus combining marks, so decomposed (NFD) Vietnamese is caught.
const DIACRITICS = /[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/u;

// Controller ruling (P5-3): collection names stay Vietnamese proper nouns in English alt text,
// like the product names. Only these exact names may carry diacritics.
const COLLECTION_NAMES = ['Hoàng Hôn', 'Phố Cũ', 'Âm Bản', 'Mùa Nắng'];
const withoutCollectionNames = (text: string) =>
  COLLECTION_NAMES.reduce((rest, name) => rest.replaceAll(name, ''), text.normalize('NFC'));
const VI_PLACEHOLDER = '[Chủ shop cập nhật:';
const EN_PLACEHOLDER = '[Owner to update:';

const policyText = (policy: PolicyDocument, locale: 'vi' | 'en') =>
  policy.sections[locale].flatMap((section) => [
    section.heading,
    ...(section.paragraphs ?? []),
    ...(section.items ?? []),
  ]);

const count = (texts: string[], needle: string) =>
  texts.filter((text) => text.includes(needle)).length;

describe.each([
  ['privacy', privacyPolicy],
  ['returns', returnsPolicy],
])('%s policy', (_name, policy) => {
  it('has the same section shape in both locales', () => {
    const shape = (locale: 'vi' | 'en') =>
      policy.sections[locale].map((section) => [
        section.paragraphs?.length ?? 0,
        section.items?.length ?? 0,
      ]);
    expect(shape('en')).toEqual(shape('vi'));
  });

  it('writes English without Vietnamese and keeps every owner placeholder', () => {
    const en = policyText(policy, 'en');
    for (const text of en) expect(text).not.toMatch(DIACRITICS);
    expect(count(en, EN_PLACEHOLDER)).toBe(count(policyText(policy, 'vi'), VI_PLACEHOLDER));
  });
});

describe('about', () => {
  it('has English paragraphs matching the Vietnamese, placeholder included', () => {
    expect(about.paragraphs.en).toHaveLength(about.paragraphs.vi.length);
    for (const text of about.paragraphs.en) expect(text).not.toMatch(DIACRITICS);
    expect(count(about.paragraphs.en, EN_PLACEHOLDER)).toBe(
      count(about.paragraphs.vi, VI_PLACEHOLDER),
    );
    expect(about.photo.alt.en).not.toMatch(DIACRITICS);
  });
});

describe('banners', () => {
  it('has English alt text for every image', () => {
    for (const banner of banners) {
      for (const image of [banner.desktop, banner.mobile]) {
        expect(withoutCollectionNames(image.alt.en), banner.id).not.toMatch(DIACRITICS);
        expect(image.alt.en, banner.id).not.toBe(image.alt.vi);
      }
    }
  });
});

describe('privacy policy and analytics (P6)', () => {
  it.each(['vi', 'en'] as const)(
    'lists Google Analytics, its cookies and how to opt out (%s)',
    (locale) => {
      const text = policyText(privacyPolicy, locale).join('\n');
      expect(text).toContain('Google Analytics');
      expect(text).toContain('_ga');
      expect(text).not.toMatch(
        /không dùng cookie quảng cáo hay phân tích|does not currently use advertising or analytics cookies/,
      );
    },
  );

  it('names Google as a processor in both locales', () => {
    expect(policyText(privacyPolicy, 'vi').some((text) => text.startsWith('Google'))).toBe(true);
    expect(policyText(privacyPolicy, 'en').some((text) => text.startsWith('Google'))).toBe(true);
  });
});
