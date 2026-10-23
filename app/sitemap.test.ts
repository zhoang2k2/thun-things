import { expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

it('lists every shell page and product', () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls.slice(0, 5)).toEqual([
    'http://localhost:3000/',
    'http://localhost:3000/about',
    'http://localhost:3000/contact',
    'http://localhost:3000/policy/privacy',
    'http://localhost:3000/policy/returns',
  ]);
  const productUrls = urls.filter((url) => url.includes('/products/'));
  expect(productUrls).toHaveLength(24);
  expect(productUrls[0]).toBe('http://localhost:3000/products/hoang-hon-01');
});

it('points robots at the sitemap', () => {
  expect(robots().sitemap).toBe('http://localhost:3000/sitemap.xml');
});

it('never lists the noindex contact result pages', () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls).not.toContain('http://localhost:3000/contact/sent');
  expect(urls).not.toContain('http://localhost:3000/contact/retry');
  expect(new Set(urls).size).toBe(urls.length);
});

it('lets every crawler fetch every page', () => {
  expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
});
