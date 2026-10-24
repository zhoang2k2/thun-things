import { expect, test } from '@playwright/test';

import { localizedPath, routing } from '@/i18n/routing';
import { getAllSlugs, getProductBySlug } from '@/lib/catalog';
import { shellPaths } from '@/lib/seo/routes';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

const publicPaths = [...shellPaths, ...getAllSlugs().map((slug) => `/products/${slug}`)];
const pathOf = (url: string) => new URL(url).pathname;

for (const locale of routing.locales) {
  test(`${locale}: public pages have the right language and reciprocal hreflang`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    for (const path of [...publicPaths, '/?page=2', '/contact?product=am-ban&purpose=notify']) {
      await page.goto(localizedPath(locale, path));
      if (path === '/' || path.startsWith('/?'))
        await page.locator('.ProductTile').first().waitFor();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      const canonicalPath = path.startsWith('/contact?') ? '/contact' : path;
      for (const language of ['vi', 'en', 'x-default'] as const) {
        const link = page.locator(`link[rel="alternate"][hreflang="${language}"]`);
        await expect(link).toHaveCount(1);
        const href = new URL((await link.getAttribute('href'))!);
        expect(`${href.pathname}${href.search}`).toBe(
          localizedPath(language === 'x-default' ? 'vi' : language, canonicalPath),
        );
      }
    }
  });

  test(`${locale}: switcher preserves a product path and Contact query`, async ({ page }) => {
    const other = locale === 'vi' ? 'en' : 'vi';
    for (const path of ['/', '/products/hoang-hon-01', '/contact?product=am-ban&purpose=notify']) {
      await page.goto(localizedPath(locale, path));
      const link = page.locator(`.LocaleSwitcher a[lang="${other}"]`);
      await expect(link).toHaveAttribute('href', localizedPath(other, path));
      await link.click();
      await expect(page).toHaveURL(new URL(localizedPath(other, path), page.url()).href);
    }
  });

  test(`${locale}: 404 stays localized and offers a working language switch`, async ({
    page,
    request,
  }) => {
    const response = await page.goto(`/${locale}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveText((locale === 'vi' ? vi : en).errors.notFound.title);
    for (const link of await page.locator('.LocaleSwitcher a').all()) {
      const response = await request.get((await link.getAttribute('href'))!);
      expect(response.status()).toBe(200);
    }
  });
}

test('unprefixed metadata routes remain accessible', async ({ request }) => {
  for (const path of [
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/icon.svg',
    '/apple-icon',
    '/opengraph-image',
    '/manifest.webmanifest',
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

const stringsOf = (value: object): string[] =>
  Object.values(value).flatMap((child) =>
    typeof child === 'string'
      ? [child]
      : typeof child === 'object' && child
        ? stringsOf(child)
        : [],
  );
const vietnameseLabels = stringsOf(vi).filter(
  (label) =>
    label !== vi.localeSwitcher.vi &&
    label.length > 4 &&
    /[^\u0000-\u007f]/.test(label) &&
    !label.includes('{') &&
    !stringsOf(en).includes(label),
);
const catalogText = getAllSlugs()
  .flatMap((slug) => stringsOf(getProductBySlug(slug)!))
  .sort((left, right) => right.length - left.length);

test('English public pages do not leak Vietnamese UI messages', async ({ page }) => {
  test.setTimeout(120_000);
  for (const path of publicPaths) {
    await page.goto(localizedPath('en', path));
    if (path === '/') await page.locator('.ProductTile').first().waitFor();
    let text = await page.locator('body').innerText();
    // Existing catalog fields and proper names are explicitly outside P5 translation scope.
    for (const content of catalogText) if (content.length > 4) text = text.replaceAll(content, '');
    for (const label of vietnameseLabels) expect(text, `${path}: ${label}`).not.toContain(label);
    expect(pathOf(page.url())).toBe(localizedPath('en', path));
  }
});

// Accepted exception (spec section 3, ADR-008): without JavaScript the prerendered links keep
// the path but drop the query; with JavaScript the query is kept (tested above).
for (const locale of routing.locales) {
  test(`${locale}: language switch keeps the path without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const other = locale === 'vi' ? 'en' : 'vi';
    await page.goto(`/${locale}/contact?product=am-ban&purpose=notify`);
    await page.locator(`.LocaleSwitcher a[lang="${other}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${other}/contact$`));
    await expect(page.locator('html')).toHaveAttribute('lang', other);
    await context.close();
  });
}
