import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { localizedPath } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/catalog';
import { shellPaths } from '@/lib/seo/routes';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';

for (const locale of ['vi', 'en'] as const) {
  test.describe(locale, () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': `203.0.113.${locale === 'vi' ? 20 : 21}` } });
    const messages = locale === 'vi' ? vi : en;

    // axe (WCAG 2.2 AA tags) on every page: every product page covers each status group.
    const PAGES = [
      ...shellPaths.map((path) => localizedPath(locale, path)),
      `/${locale}?page=2`,
      `/${locale}/contact?product=hoang-hon-01&purpose=order`,
      ...getAllSlugs().map((slug) => `/${locale}/products/${slug}`),
      `/${locale}/contact/sent`,
      `/${locale}/contact/retry`,
      `/${locale}/does-not-exist`,
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
        if (path === `/${locale}` || path.startsWith(`/${locale}?`))
          await page.locator('.ProductTile').first().waitFor();
        expect(await seriousViolations(page)).toEqual([]);
      });
    }

    test('Contact with errors has no serious accessibility violations', async ({ page }) => {
      await page.goto(`/${locale}/contact`);
      await page
        .locator('form.ContactForm')
        .getByRole('button', { name: messages.forms.submit })
        .click();
      await expect(page.locator('.FormErrorSummary')).toBeFocused();
      expect(await seriousViolations(page)).toEqual([]);
    });

    test('Home with an open hover card has no serious accessibility violations', async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await page.locator('.ProductTile').first().getByRole('link').first().focus();
      await expect(page.getByTestId('product-hover-card')).toBeVisible();
      expect(await seriousViolations(page)).toEqual([]);
    });
  });
}
