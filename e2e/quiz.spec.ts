import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P7 quiz bot. Default storage has a consent decision (analytics off), so the consent bar is out of
// the way unless a test clears it.

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.81' } });

const COPY = {
  vi: {
    launcher: 'Tìm áo hợp bạn',
    stepColor: 'Bạn thích màu nào?',
    continue: 'Tiếp tục',
    showResult: 'Xem gợi ý',
    resultTitle: 'Gợi ý cho bạn',
    seeMore: 'Xem thêm',
    bubble: 'Chưa biết chọn mẫu nào? Để mình gợi ý.',
  },
  en: {
    launcher: 'Find your shirt',
    stepColor: 'Which colour do you like?',
    continue: 'Continue',
    showResult: 'Show my match',
    resultTitle: 'Your match',
    seeMore: 'See more',
    bubble: 'Not sure which design? Let me help.',
  },
} as const;

const seriousViolations = async (page: Page, include?: string) => {
  const builder = new AxeBuilder({ page });
  if (include) builder.include(include);
  const { violations } = await builder
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => `${node.target} ${node.failureSummary}`).join(' | ')}`,
    );
};

const card = (page: Page) => page.getByRole('dialog');

for (const locale of ['vi', 'en'] as const) {
  const copy = COPY[locale];

  test(`${locale}: keyboard-only quiz to a result and a product page`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const launcher = page.getByRole('button', { name: copy.launcher });
    await launcher.focus();
    await page.keyboard.press('Enter');
    await expect(card(page).getByRole('heading', { name: copy.stepColor })).toBeFocused();

    // Tab from the step heading reaches the first colour; Space selects it.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await card(page).getByRole('button', { name: copy.continue }).focus();
    await page.keyboard.press('Enter');
    await card(page).getByRole('button', { name: copy.showResult }).focus();
    await page.keyboard.press('Enter');

    await expect(card(page).getByRole('heading', { name: copy.resultTitle })).toBeFocused();
    expect(await seriousViolations(page)).toEqual([]);

    const productLink = card(page).locator('a[href*="/products/"]').first();
    const href = await productLink.getAttribute('href');
    await productLink.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(`**${href}`);
    await expect(card(page)).toHaveCount(0);
  });

  test(`${locale}: Escape closes the card and returns focus to the launcher`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.getByRole('button', { name: copy.launcher }).click();
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: copy.launcher })).toBeFocused();
  });

  test(`${locale}: the bubble appears after 20 s, opens the quiz, passes axe`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/${locale}`);
    // The bubble timer starts after hydration.
    await page.waitForLoadState('networkidle');
    await page.clock.fastForward(20_000);
    const bubble = page.getByRole('button', { name: copy.bubble });
    await expect(bubble).toBeVisible();
    // Scoped: the fast-forwarded clock leaves the hero slideshow mid-crossfade, which the page-wide
    // a11y suite already covers at rest.
    expect(await seriousViolations(page, '.QuizBubble')).toEqual([]);
    await bubble.click();
    await expect(card(page)).toBeVisible();
    await expect(bubble).toHaveCount(0);
  });
}

test('the bubble stays quiet on Contact and Policy pages', async ({ page }) => {
  await page.clock.install();
  for (const path of ['/vi/contact', '/vi/policy/privacy']) {
    await page.goto(path);
    await page.clock.fastForward(30_000);
    await expect(page.getByRole('button', { name: COPY.vi.bubble })).toHaveCount(0);
  }
});

test.describe('without a consent decision', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('the launcher sits above the consent bar', async ({ page }) => {
    await page.goto('/vi');
    const bar = page.getByRole('region', { name: 'Đồng ý cookie' });
    await expect(bar).toBeVisible();
    const launcher = page.getByRole('button', { name: COPY.vi.launcher });
    await expect
      .poll(async () => {
        const [a, b] = [await launcher.boundingBox(), await bar.boundingBox()];
        return Math.round(a!.y + a!.height) <= Math.round(b!.y);
      })
      .toBe(true);
  });

  test('on mobile product pages the launcher sits above the order bar', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      storageState: 'e2e/fixtures/consent-decided.json',
    });
    const page = await context.newPage();
    await page.goto('/vi/products/hoang-hon-01');
    const launcher = page.getByRole('button', { name: COPY.vi.launcher });
    const order = page.locator('.ProductOrderBar');
    await expect
      .poll(async () => {
        const [a, b] = [await launcher.boundingBox(), await order.boundingBox()];
        return Math.round(a!.y + a!.height) <= Math.round(b!.y);
      })
      .toBe(true);
    await context.close();
  });
});

test('quiz events carry enum params only', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'thun-things.consent',
      JSON.stringify({ version: 1, analytics: true, decidedAt: '2026-10-24T00:00:00.000Z' }),
    );
  });
  await page.route(
    (url) => /(^|\.)(google\.com|googletagmanager\.com|google-analytics\.com)$/.test(url.hostname),
    (route) =>
      route.fulfill(
        route.request().url().includes('/gtag/js')
          ? { contentType: 'application/javascript', body: '' }
          : { status: 204, body: '' },
      ),
  );
  await page.goto('/vi?ga_debug=1');
  await page.getByRole('button', { name: COPY.vi.launcher }).click();
  await card(page).getByRole('radio').first().check();
  await card(page).getByRole('button', { name: COPY.vi.continue }).click();
  await card(page).getByRole('button', { name: COPY.vi.showResult }).click();
  await expect(card(page).getByRole('heading', { name: COPY.vi.resultTitle })).toBeVisible();

  const events = await page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry) => entry[0] === 'event' && String(entry[1]).startsWith('quiz_')),
  );
  expect(events.map((entry) => entry[1])).toEqual(['quiz_open', 'quiz_step', 'quiz_complete']);
  for (const [, , params] of events) {
    for (const value of Object.values(params as Record<string, unknown>)) {
      expect(String(value)).toMatch(/^[a-z_0-9-]+$/);
    }
  }
});

test('the API rejects other methods and invalid bodies', async ({ request }) => {
  expect((await request.get('/api/quiz/recommend')).status()).toBe(405);
  const bad = await request.post('/api/quiz/recommend', { data: { locale: 'vi', color: 'plaid' } });
  expect(bad.status()).toBe(400);
  expect(await bad.json()).toEqual({ error: 'Invalid request payload', code: 'VALIDATION_ERROR' });
});
