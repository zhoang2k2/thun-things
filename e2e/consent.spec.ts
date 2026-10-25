import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P6: no Google request before consent (Consent Mode Basic). The Playwright build uses the dummy
// id G-TEST000000 and every Google request is intercepted here; gtag.js is replaced by a stub, so
// nothing leaves the machine.

test.use({ storageState: { cookies: [], origins: [] } });

const GOOGLE = /(^|\.)(google\.com|googletagmanager\.com|google-analytics\.com)$/;

interface GoogleTraffic {
  urls: string[];
}

const watchGoogle = async (page: Page): Promise<GoogleTraffic> => {
  const traffic: GoogleTraffic = { urls: [] };
  await page.route(
    (url) => GOOGLE.test(url.hostname),
    async (route) => {
      traffic.urls.push(route.request().url());
      if (route.request().url().includes('/gtag/js')) {
        await route.fulfill({
          contentType: 'application/javascript',
          body: 'window.__gtagStubLoaded = true;',
        });
        return;
      }
      await route.fulfill({ status: 204, body: '' });
    },
  );
  return traffic;
};

const dataLayer = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>)),
  );

const banner = (page: Page) => page.getByRole('region', { name: 'Đồng ý cookie' });

const browseALittle = async (page: Page) => {
  await page.mouse.wheel(0, 600);
  await page.locator('.ProductTile').first().hover();
  await page.waitForTimeout(800);
};

test('no Google request before a decision', async ({ page }) => {
  const traffic = await watchGoogle(page);
  await page.goto('/vi?ga_debug=1');
  await expect(banner(page)).toBeVisible();
  await browseALittle(page);
  expect(traffic.urls).toEqual([]);
});

test('no Google request after Reject, also after reload', async ({ page }) => {
  const traffic = await watchGoogle(page);
  await page.goto('/vi?ga_debug=1');
  await banner(page).getByRole('button', { name: 'Từ chối' }).click();
  await expect(banner(page)).toHaveCount(0);
  await browseALittle(page);
  await page.reload();
  await expect(banner(page)).toHaveCount(0);
  await browseALittle(page);
  expect(traffic.urls).toEqual([]);
});

test('Accept loads gtag with ad signals denied and debug mode on', async ({ page }) => {
  const traffic = await watchGoogle(page);
  await page.goto('/en?ga_debug=1');
  await page
    .getByRole('region', { name: 'Cookie consent' })
    .getByRole('button', { name: 'Accept' })
    .click();
  await expect
    .poll(() => traffic.urls.some((url) => url.includes('/gtag/js?id=G-TEST000000')))
    .toBe(true);
  const layer = await dataLayer(page);
  expect(layer).toContainEqual([
    'consent',
    'default',
    {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ]);
  expect(layer).toContainEqual(['config', 'G-TEST000000', { debug_mode: true }]);

  // The decision persists; GA loads again on the next visit without the bar.
  await page.reload();
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => Boolean(window.dataLayer?.length))).toBe(true);
});

test('without ?ga_debug=1 a non-production build loads nothing, even after Accept', async ({
  page,
}) => {
  const traffic = await watchGoogle(page);
  await page.goto('/vi');
  await banner(page).getByRole('button', { name: 'Đồng ý' }).click();
  await browseALittle(page);
  expect(traffic.urls).toEqual([]);
});

test('revoking from the footer denies storage and clears _ga cookies', async ({
  page,
  context,
}) => {
  await watchGoogle(page);
  await page.goto('/vi?ga_debug=1');
  await banner(page).getByRole('button', { name: 'Đồng ý' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(window.dataLayer?.length))).toBe(true);
  await context.addCookies([
    { name: '_ga', value: 'GA1.1.123.456', domain: 'localhost', path: '/' },
    { name: '_ga_TEST000000', value: 'GS1.1.1', domain: 'localhost', path: '/' },
  ]);

  await page.getByRole('button', { name: 'Cài đặt cookie' }).click();
  const dialog = page.getByRole('dialog', { name: 'Cài đặt cookie' });
  await dialog.getByRole('checkbox', { name: 'Phân tích (Google Analytics)' }).uncheck();
  await dialog.getByRole('button', { name: 'Lưu lựa chọn' }).click();
  await expect(dialog).toHaveCount(0);

  const names = (await context.cookies()).map((cookie) => cookie.name);
  expect(names.filter((name) => name.startsWith('_ga'))).toEqual([]);
  expect(await dataLayer(page)).toContainEqual([
    'consent',
    'update',
    { analytics_storage: 'denied' },
  ]);
});

test('the settings dialog is keyboard operable', async ({ page }) => {
  await page.goto('/vi');
  await banner(page).getByRole('button', { name: 'Tuỳ chỉnh' }).click();
  const dialog = page.getByRole('dialog', { name: 'Cài đặt cookie' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(banner(page)).toBeVisible();
});

test('on mobile product pages the bar sits above the order bar', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/vi/products/hoang-hon-01');
  await expect(banner(page)).toBeVisible();
  const orderTop = async () => (await page.locator('.ProductOrderBar').boundingBox())!.y;
  const barBottom = async () => {
    const box = (await banner(page).boundingBox())!;
    return box.y + box.height;
  };
  await expect.poll(async () => Math.round(await barBottom())).toBe(Math.round(await orderTop()));
  await expect(
    page.locator('.ProductOrderBar').getByRole('link', { name: 'Liên hệ đặt hàng' }),
  ).toBeVisible();
  await context.close();
});

test('no CSP violation with GA loaded', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __violations: string[] }).__violations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { __violations: string[] }).__violations.push(event.violatedDirective);
    });
  });
  await watchGoogle(page);
  await page.goto('/vi?ga_debug=1');
  await banner(page).getByRole('button', { name: 'Đồng ý' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(window.dataLayer?.length))).toBe(true);
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(() => (window as unknown as { __violations: string[] }).__violations),
  ).toEqual([]);
});

test.describe('events after consent', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    // Own rate-limit bucket for the contact submission below.
    extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.71' },
  });

  const events = async (page: Page, name: string) =>
    (await dataLayer(page))
      .filter((entry) => entry[0] === 'event' && entry[1] === name)
      .map((entry) => entry[2]);

  test('the five events carry the expected params and no personal data', async ({ page }) => {
    const traffic = await watchGoogle(page);
    await page.goto('/vi?ga_debug=1');
    await banner(page).getByRole('button', { name: 'Đồng ý' }).click();
    await expect.poll(() => page.evaluate(() => Boolean(window.dataLayer?.length))).toBe(true);

    const tile = page.locator('.ProductTile').first();
    const slug = (await tile.getByRole('link').first().getAttribute('href'))!.split('/').pop()!;
    await tile.hover();
    await page.mouse.move(720, 10);
    await tile.hover();
    // Once per tile per page view, even after hovering it twice. (Other tiles the pointer
    // crosses send their own event.)
    const previews = async () =>
      (await events(page, 'hover_preview_open')).filter(
        (params) => (params as { product_id: string }).product_id === slug,
      );
    await expect.poll(previews).toEqual([{ product_id: slug, status: expect.any(String) }]);

    // The open hover card covers the tile; a click on the card opens the product and sends
    // select_item. Wait for the card to finish opening first.
    await tile.hover();
    const card = page.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    await page.waitForTimeout(400);
    await card.locator('.ProductHoverCard__name').click();
    await page.waitForURL(`**/vi/products/${slug}`);
    expect(await events(page, 'select_item')).toEqual([
      { product_id: slug, status: expect.any(String), locale: 'vi' },
    ]);

    await page
      .getByRole('navigation', { name: /ngôn ngữ|language/i })
      .getByRole('link', { name: /English/ })
      .click();
    await page.waitForURL(`**/en/products/${slug}`);
    expect(await events(page, 'locale_switch')).toEqual([{ from: 'vi', to: 'en' }]);

    await page.goto('/en/contact?product=hoang-hon-01');
    await expect.poll(() => page.evaluate(() => Boolean(window.dataLayer?.length))).toBe(true);
    // The product prefill streams in; a visitor sees it before typing.
    await expect(page.getByRole('region', { name: 'Product' })).toBeVisible();
    await page.getByLabel('Email').fill('lan.test@example.com');
    await page.getByLabel(/Phone/).fill('0912 345 678');
    await page.getByRole('checkbox', { name: /privacy policy/i }).check();
    await page.locator('form.ContactForm').getByRole('button', { name: 'Send' }).click();
    await expect(page.getByRole('status')).toBeVisible();

    expect(await events(page, 'contact_start')).toEqual([
      { purpose: 'order', form: 'contact', product_id: 'hoang-hon-01' },
    ]);
    expect(await events(page, 'contact_submit')).toEqual([
      { purpose: 'order', form: 'contact', product_id: 'hoang-hon-01', locale: 'en' },
    ]);

    const everything = JSON.stringify(await dataLayer(page)) + traffic.urls.join(' ');
    for (const secret of ['lan.test@example.com', '0912', '912345678']) {
      expect(everything).not.toContain(secret);
    }
  });
});

const seriousViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.help}`);
};

for (const [locale, region, customize, dialog] of [
  ['vi', 'Đồng ý cookie', 'Tuỳ chỉnh', 'Cài đặt cookie'],
  ['en', 'Cookie consent', 'Customize', 'Cookie settings'],
] as const) {
  test(`${locale}: no serious axe issue with the bar and the settings dialog open`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole('region', { name: region })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
    await page
      .getByRole('region', { name: region })
      .getByRole('button', { name: customize })
      .click();
    await expect(page.getByRole('dialog', { name: dialog })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
}
