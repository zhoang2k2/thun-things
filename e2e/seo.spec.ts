import { expect, type Page, test } from '@playwright/test';

import { getAllSlugs } from '@/lib/catalog';
import { shellPaths } from '@/lib/seo/routes';

// SEO acceptance criteria (P4 spec section 2). Canonical and sitemap URLs are absolute on
// NEXT_PUBLIC_SITE_URL (localhost:3000 by default) while Playwright serves on :3100, so URLs are
// compared by path and query only.

const slugs = getAllSlugs();
const productPaths = slugs.map((slug) => `/products/${slug}`);
const SITEMAP_PATHS = [...shellPaths, ...productPaths];
const PUBLIC_PAGES = [...shellPaths, '/?page=2', ...productPaths];
const RESULT_PAGES = ['/contact/sent', '/contact/retry'];
const NOT_FOUND = '/does-not-exist';
const ALL_PAGES = [...PUBLIC_PAGES, ...RESULT_PAGES, NOT_FOUND];

const toPath = (url: string) => {
  const { pathname, search } = new URL(url);
  return `${pathname}${search}`;
};

const open = async (page: Page, path: string) => {
  const response = await page.goto(path);
  // Home streams its grid (and metadata) behind Suspense.
  if (path === '/' || path.startsWith('/?')) await page.locator('.ProductTile').first().waitFor();
  return response;
};

const robotsContent = (page: Page) =>
  page
    .locator('meta[name="robots"]')
    .evaluateAll((metas) => metas.map((meta) => meta.getAttribute('content') ?? ''));

const metaContent = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute('content');

test.describe.configure({ timeout: 120_000 });

test('sitemap lists every public page and no result page (1)', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => toPath(match[1]));
  expect(listed.sort()).toEqual([...SITEMAP_PATHS].sort());
  for (const path of RESULT_PAGES) expect(listed).not.toContain(path);
});

test('robots.txt allows every crawler and names the sitemap (2)', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toMatch(/^User-Agent: \*$/im);
  expect(text).toMatch(/^Allow: \/$/im);
  expect(text).not.toMatch(/^Disallow:/im);
  const sitemap = text.match(/^Sitemap: (\S+)$/im)?.[1];
  expect(sitemap && toPath(sitemap)).toBe('/sitemap.xml');
});

test('public pages carry no noindex; result pages do (3)', async ({ page }) => {
  for (const path of PUBLIC_PAGES) {
    await open(page, path);
    const robots = await robotsContent(page);
    expect(robots.join(','), path).not.toMatch(/noindex/i);
  }
  for (const path of RESULT_PAGES) {
    await open(page, path);
    expect((await robotsContent(page)).join(','), path).toMatch(/noindex/i);
  }
});

test('canonical points at the main URL (4)', async ({ page }) => {
  const expected: Record<string, string> = {
    '/?page=2': '/?page=2',
    '/?page=1': '/',
    '/contact?product=hoang-hon-01': '/contact',
    '/contact?product=hoang-hon-01&purpose=order': '/contact',
  };
  for (const path of [...shellPaths, ...productPaths]) expected[path] = path;
  for (const [path, canonical] of Object.entries(expected)) {
    await open(page, path);
    const links = page.locator('link[rel="canonical"]');
    await expect(links, path).toHaveCount(1);
    expect(toPath((await links.getAttribute('href'))!), path).toBe(canonical);
  }
});

test('titles and descriptions are present and unique; descriptions 50-160 chars (5, 6)', async ({
  page,
}) => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const path of [...PUBLIC_PAGES, ...RESULT_PAGES]) {
    await open(page, path);
    const title = await page.title();
    expect(title, path).not.toBe('');
    expect(titles.get(title), `${path} repeats the title "${title}"`).toBeUndefined();
    titles.set(title, path);

    const description = (await metaContent(page, 'meta[name="description"]')) ?? '';
    expect(description.length, `${path} description length`).toBeGreaterThanOrEqual(50);
    expect(description.length, `${path} description length`).toBeLessThanOrEqual(160);
    expect(
      descriptions.get(description),
      `${path} repeats the description of ${descriptions.get(description)}`,
    ).toBeUndefined();
    descriptions.set(description, path);
  }
});

test('every page has exactly one h1 and no skipped heading levels (7, 8)', async ({ page }) => {
  for (const path of ALL_PAGES) {
    await open(page, path);
    await expect(page.locator('h1'), path).toHaveCount(1);
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(levels[0], `${path} starts with h1`).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(
        levels[index] - levels[index - 1],
        `${path} heading order ${levels.join(' ')}`,
      ).toBeLessThanOrEqual(1);
    }
  }
});

test('every internal link on public pages returns 200 (12)', async ({ page, request }) => {
  const targets = new Map<string, string>();
  for (const path of PUBLIC_PAGES) {
    await open(page, path);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== new URL(page.url()).origin) continue;
      const target = `${url.pathname}${url.search}`;
      if (!targets.has(target)) targets.set(target, path);
    }
  }
  expect(targets.size).toBeGreaterThan(PUBLIC_PAGES.length);
  for (const [target, source] of targets) {
    const response = await request.get(target, { maxRedirects: 0 });
    expect(response.status(), `${target} (linked from ${source})`).toBe(200);
  }
});

test('each product page links to Home and to another product (11)', async ({ page }) => {
  for (const path of productPaths) {
    await open(page, path);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs, path).toContain('/');
    const others = hrefs.filter((href) => href.startsWith('/products/') && href !== path);
    expect(others.length, path).toBeGreaterThan(0);
  }
});

for (const width of [360, 390]) {
  test(`no horizontal overflow at ${width}px (15)`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    for (const path of ALL_PAGES) {
      await open(page, path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
    await context.close();
  });
}

test('every slug is lowercase kebab-case (17)', () => {
  expect(slugs.length).toBeGreaterThan(0);
  for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('Home and every product page share a 1200x630 og:image (18)', async ({ page, request }) => {
  for (const path of ['/', ...productPaths]) {
    await open(page, path);
    const image = await metaContent(page, 'meta[property="og:image"]');
    expect(image, path).toBeTruthy();
    expect(await metaContent(page, 'meta[property="og:image:width"]'), path).toBe('1200');
    expect(await metaContent(page, 'meta[property="og:image:height"]'), path).toBe('630');
    const response = await request.get(toPath(image!));
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toBe('image/png');
  }
});

test('/llms.txt is served as plain text (20)', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^text\/plain/);
  const text = await response.text();
  for (const path of productPaths) expect(text).toContain(path);
});
