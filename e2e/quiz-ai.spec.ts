import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P8 AI rationale. The test server runs with AI_ENABLED=false (playwright.config.ts), so the real
// endpoint always answers 204 and no provider is ever called; the rationale UI is exercised by
// stubbing /api/quiz/explain in the browser.

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.82' } });

const COPY = {
  vi: {
    launcher: 'Tìm áo hợp bạn',
    showResult: 'Xem gợi ý',
    continue: 'Tiếp tục',
    label: 'Viết bởi AI',
    resultTitle: 'Gợi ý cho bạn',
  },
  en: {
    launcher: 'Find your shirt',
    showResult: 'Show my match',
    continue: 'Continue',
    label: 'Written by AI',
    resultTitle: 'Your match',
  },
} as const;

const TEXT = {
  vi: 'Màu cam ấm áp hợp với gu nghệ thuật của bạn.',
  en: 'The warm orange suits the artful style you picked.',
} as const;

const card = (page: Page) => page.getByRole('dialog');

const runQuiz = async (page: Page, locale: 'vi' | 'en') => {
  const copy = COPY[locale];
  await page.goto(`/${locale}`);
  await page.getByRole('button', { name: copy.launcher }).click();
  await card(page).getByRole('radio').first().check();
  await card(page).getByRole('button', { name: copy.continue }).click();
  await card(page).getByRole('radio').first().check();
  await card(page).getByRole('button', { name: copy.showResult }).click();
  await expect(card(page).getByRole('heading', { name: copy.resultTitle })).toBeVisible();
};

for (const locale of ['vi', 'en'] as const) {
  test(`${locale}: shows the rationale with an AI label when the API answers`, async ({ page }) => {
    await page.route('**/api/quiz/explain', (route) =>
      route.fulfill({ json: { text: TEXT[locale], provider: 'gemini' } }),
    );
    await runQuiz(page, locale);
    await expect(card(page).getByText(TEXT[locale])).toBeVisible();
    await expect(card(page).getByText(COPY[locale].label)).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .include('.QuizCard')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  });
}

test('with AI off the result shows without a rationale and nothing left loading', async ({
  page,
}) => {
  const explain = page.waitForResponse('**/api/quiz/explain');
  await runQuiz(page, 'vi');
  expect((await explain).status()).toBe(204);
  await expect(card(page).locator('.QuizRationale__skeleton')).toHaveCount(0);
  await expect(card(page).getByText(COPY.vi.label)).toHaveCount(0);
  await expect(card(page).locator('a[href*="/products/"]').first()).toBeVisible();
});

test('a slow rationale is dropped and the result stays usable', async ({ page }) => {
  await page.clock.install();
  await page.route('**/api/quiz/explain', () => {
    // Never answers: the client gives up after 4 s.
  });
  await runQuiz(page, 'en');
  await expect(card(page).locator('.QuizRationale__skeleton')).toHaveCount(1);
  await page.clock.fastForward(4_000);
  await expect(card(page).locator('.QuizRationale__skeleton')).toHaveCount(0);
  await expect(card(page).getByText(COPY.en.label)).toHaveCount(0);
});

test('the explain API rejects other methods and invalid bodies', async ({ request }) => {
  expect((await request.get('/api/quiz/explain')).status()).toBe(405);
  const bad = await request.post('/api/quiz/explain', {
    data: { locale: 'vi', color: 'white', slug: 'missing' },
  });
  expect(bad.status()).toBe(400);
  expect(await bad.json()).toEqual({ error: 'Invalid request payload', code: 'VALIDATION_ERROR' });
  const off = await request.post('/api/quiz/explain', {
    data: { locale: 'vi', color: 'white', slug: 'hoang-hon-01' },
  });
  expect(off.status()).toBe(204);
});

test('no AI key name or SDK reaches the browser bundles', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith('.js')) files.push(path);
    }
  };
  walk(join('.next', 'static'));
  expect(files.length).toBeGreaterThan(0);
  const forbidden = [
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY',
    'generativelanguage.googleapis.com',
    'api.anthropic.com',
    '@google/genai',
    '@anthropic-ai/sdk',
  ];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const needle of forbidden)
      expect(source.includes(needle), `${needle} in ${file}`).toBe(false);
  }
});
