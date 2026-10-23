import { expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

it('lists every shell page and product', () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls.slice(0, 5)).toEqual([
    'http://localhost:3000/vi',
    'http://localhost:3000/vi/about',
    'http://localhost:3000/vi/contact',
    'http://localhost:3000/vi/policy/privacy',
    'http://localhost:3000/vi/policy/returns',
  ]);
  const productUrls = urls.filter((url) => url.includes('/products/'));
  expect(productUrls).toHaveLength(48);
  expect(productUrls[0]).toBe('http://localhost:3000/vi/products/hoang-hon-01');
});

it('points robots at the sitemap', () => {
  expect(robots().sitemap).toBe('http://localhost:3000/sitemap.xml');
});

it('never lists the noindex contact result pages', () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls).not.toContain('http://localhost:3000/vi/contact/sent');
  expect(urls).not.toContain('http://localhost:3000/vi/contact/retry');
  expect(new Set(urls).size).toBe(urls.length);
});

it('lets every crawler fetch every page', () => {
  expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
});

it('lists both locales with reciprocal alternates on every entry', () => {
  const entries = sitemap();
  expect(entries).toHaveLength(58);
  for (const entry of entries) {
    expect(entry.alternates?.languages).toMatchObject({
      vi: expect.stringContaining('/vi'),
      en: expect.stringContaining('/en'),
      'x-default': expect.stringContaining('/vi'),
    });
  }
  expect(entries.some((entry) => entry.url.includes('/en/contact'))).toBe(true);
});
