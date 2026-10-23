import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SHELL_PAGES = ['/', '/about', '/contact', '/policy/privacy', '/policy/returns'];

for (const path of SHELL_PAGES) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = violations
      .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      .map((violation) => `${violation.id}: ${violation.help}`);
    expect(serious).toEqual([]);
  });
}
