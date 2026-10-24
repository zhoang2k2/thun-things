import { describe, expect, it } from 'vitest';

import { isIndexable, robotsFor, robotsMetadataFor } from '@/lib/seo/indexing';

const TEMPORARY = 'https://thun-things.vercel.app';
const LAUNCH = 'https://thunthings.com';

describe('isIndexable', () => {
  it('keeps the temporary Vercel host out of search results', () => {
    expect(isIndexable(TEMPORARY)).toBe(false);
    expect(isIndexable('https://thun-things-git-x.vercel.app/')).toBe(false);
  });

  it('indexes the real domain and local test hosts', () => {
    expect(isIndexable(LAUNCH)).toBe(true);
    expect(isIndexable('http://localhost:3000')).toBe(true);
  });

  it('does not treat a lookalike domain as Vercel', () => {
    expect(isIndexable('https://vercel.app.example.com')).toBe(true);
  });
});

describe('robotsFor', () => {
  it('disallows everything and omits the sitemap on the temporary host', () => {
    expect(robotsFor(TEMPORARY)).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });

  it('allows everything and names the sitemap on the real domain', () => {
    expect(robotsFor(LAUNCH)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${LAUNCH}/sitemap.xml`,
    });
  });
});

describe('robotsMetadataFor', () => {
  it('adds noindex, nofollow on the temporary host only', () => {
    expect(robotsMetadataFor(TEMPORARY)).toEqual({ robots: { index: false, follow: false } });
    expect(robotsMetadataFor(LAUNCH)).toEqual({});
  });
});
