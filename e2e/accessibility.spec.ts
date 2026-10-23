import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { getAllSlugs } from '@/lib/catalog';
import { shellPaths } from '@/lib/seo/routes';

// axe (WCAG 2.2 AA tags) on every page: every product page covers each status group.
const PAGES = [
  ...shellPaths,
  '/?page=2',
  '/contact?product=hoang-hon-01&purpose=order',
  ...getAllSlugs().map((slug) => `/products/${slug}`),
  '/contact/sent',
  '/contact/retry',
  '/does-not-exist',
];

const seriousViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.help}`);
};

for (const path of PAGES) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    // Home streams its grid behind Suspense.
    if (path === '/' || path.startsWith('/?')) await page.locator('.ProductTile').first().waitFor();
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test('Contact with errors has no serious accessibility violations', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('form.ContactForm').getByRole('button', { name: 'Gửi' }).click();
  await expect(page.locator('.FormErrorSummary')).toBeFocused();
  expect(await seriousViolations(page)).toEqual([]);
});

test('Home with an open hover card has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.locator('.ProductTile').first().getByRole('link').first().focus();
  await expect(page.getByTestId('product-hover-card')).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
