import { type APIRequestContext, expect, test } from '@playwright/test';

// Locale routing (P5 spec section 1 and 3): `/` and pre-P5 links redirect to `/vi` in one hop,
// unknown locales are a 404, metadata routes stay unprefixed.

const NOT_FOUND_HEADING = 'Không tìm thấy trang';

/** Status and same-origin path of the first response, without following redirects. */
const firstHop = async (request: APIRequestContext, path: string) => {
  const response = await request.get(path, { maxRedirects: 0 });
  const location = response.headers().location;
  const target = location && new URL(location, 'http://localhost');
  return { status: response.status(), target: target && `${target.pathname}${target.search}` };
};

test('/ redirects permanently to /vi, keeping the query', async ({ request }) => {
  expect(await firstHop(request, '/')).toEqual({ status: 308, target: '/vi' });
  expect(await firstHop(request, '/?page=2')).toEqual({ status: 308, target: '/vi?page=2' });
});

const LEGACY_LINKS = [
  '/about',
  '/products/hoang-hon-01',
  '/contact?product=am-ban&purpose=notify',
  '/policy/privacy',
  '/policy/returns',
  '/contact',
  '/contact/sent',
  '/contact/retry',
];

for (const path of LEGACY_LINKS) {
  test(`legacy ${path} redirects permanently to /vi${path} in one hop`, async ({ request }) => {
    expect(await firstHop(request, path)).toEqual({ status: 308, target: `/vi${path}` });
    const response = await request.get(`/vi${path}`, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });
}

const NOT_FOUND_PATHS = [
  '/fr',
  '/vi-VN',
  '/EN',
  '/fr/about',
  '/en/products/nope',
  '/products/nope',
  // Dotted paths still go through proxy.ts (unknown product, unknown locale).
  '/vi/products/nope.html',
  '/en/products/a.b',
  '/fr.x',
  '/fr.x/about',
];

for (const path of NOT_FOUND_PATHS) {
  test(`${path} is a 404 with the not-found page`, async ({ page, request }) => {
    expect((await firstHop(request, path)).status).toBe(404);
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: path.startsWith('/en/') ? 'Page not found' : NOT_FOUND_HEADING,
      }),
    ).toBeVisible();
  });
}

for (const [path, lang] of [
  ['/vi', 'vi'],
  ['/en', 'en'],
  ['/en/about', 'en'],
  ['/en/contact?product=hoang-hon-01', 'en'],
  ['/en/products/hoang-hon-01', 'en'],
  ['/en/policy/privacy', 'en'],
] as const) {
  test(`${path} renders with lang="${lang}"`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  });
}

test('the switch keeps path and query between /vi and /en', async ({ page }) => {
  await page.goto('/vi/contact?product=x');
  const switcher = page.getByRole('banner').getByRole('navigation', { name: 'Ngôn ngữ' });
  const english = switcher.getByRole('link', { name: 'English' });
  await expect(switcher.getByRole('link', { name: 'Tiếng Việt' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(english).toHaveAttribute('href', '/en/contact?product=x');

  await english.click();
  await expect(page).toHaveURL(/\/en\/contact\?product=x$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const vietnamese = page.getByRole('banner').getByRole('link', { name: 'Tiếng Việt' });
  await expect(vietnamese).toHaveAttribute('href', '/vi/contact?product=x');

  await vietnamese.click();
  await expect(page).toHaveURL(/\/vi\/contact\?product=x$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('the switch works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/vi/about');
  await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await context.close();
});

test('the switch on the 404 page offers each Home', async ({ page, request }) => {
  await page.goto('/fr/missing');
  const switcher = page.getByRole('banner').getByRole('navigation', { name: 'Ngôn ngữ' });
  for (const [name, href] of [
    ['Tiếng Việt', '/vi'],
    ['English', '/en'],
  ]) {
    await expect(switcher.getByRole('link', { name })).toHaveAttribute('href', href);
    expect((await request.get(href, { maxRedirects: 0 })).status()).toBe(200);
  }
});

for (const path of [
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/icon.svg',
  '/apple-icon',
  '/opengraph-image',
  '/manifest.webmanifest',
]) {
  test(`metadata route ${path} stays unprefixed`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });
}
