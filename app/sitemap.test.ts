import { expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

it('lists every shell page', () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls).toEqual([
    'http://localhost:3000/',
    'http://localhost:3000/about',
    'http://localhost:3000/contact',
    'http://localhost:3000/policy/privacy',
    'http://localhost:3000/policy/returns',
  ]);
});

it('points robots at the sitemap', () => {
  expect(robots().sitemap).toBe('http://localhost:3000/sitemap.xml');
});
