import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const tiles = (page: Page) => page.locator('.ProductTile');
const card = (page: Page) => page.getByTestId('product-hover-card');

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('home grid', () => {
  test('paginates 20 then 4 products and tolerates bad page values', async ({ page }) => {
    await page.goto('/');
    await expect(tiles(page)).toHaveCount(20);
    await page.goto('/?page=2');
    await expect(tiles(page)).toHaveCount(4);
    await page.goto('/?page=abc');
    await expect(tiles(page)).toHaveCount(20);
    await page.goto('/?page=99');
    await expect(tiles(page)).toHaveCount(4);
  });

  test('pagination links move between pages', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Phân trang' });
    await nav.getByRole('link', { name: 'Trang 2' }).click();
    await expect(page).toHaveURL(/\?page=2$/);
    await expect(tiles(page)).toHaveCount(4);
  });

  test('hovering a tile shows the card with price', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await tiles(page).nth(5).hover();
    await expect(card(page)).toBeVisible();
    await expect(card(page)).toContainText('₫');
  });

  test('edge tiles do not overflow the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    for (const index of [4, 7]) {
      const tile = tiles(page).nth(index);
      await tile.hover();
      // The previous card may still be animating out, so scope to this tile.
      const tileCard = tile.getByTestId('product-hover-card');
      await expect(tileCard).toBeVisible();
      const box = await tileCard.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
      expect(await horizontalOverflow(page)).toBe(0);
    }
  });

  test('keyboard focus opens the card and Escape closes it', async ({ page }) => {
    await page.goto('/');
    const link = tiles(page).first().getByRole('link').first();
    await link.focus();
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
  });
});

test.describe('product page', () => {
  test('renders the product heading and related products', async ({ page }) => {
    const response = await page.goto('/products/hoang-hon-01');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: 'Hoàng Hôn 01' })).toBeVisible();
    await expect(page.locator('.ProductPage__related .ProductTile')).toHaveCount(4);
  });

  test('unknown products return 404', async ({ page }) => {
    const response = await page.goto('/products/nope');
    expect(response?.status()).toBe(404);
  });
});

for (const path of ['/', '/?page=2', '/products/hoang-hon-01', '/products/am-ban']) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await tiles(page).first().waitFor();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = violations
      .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      .map((violation) => `${violation.id}: ${violation.help}`);
    expect(serious).toEqual([]);
  });
}
