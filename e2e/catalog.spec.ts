import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const tiles = (page: Page) => page.locator('.ProductTile');
const card = (page: Page) => page.getByTestId('product-hover-card');

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('home grid', () => {
  test('paginates 20 then 4 products and tolerates bad page values', async ({ page }) => {
    await page.goto('/vi');
    await expect(tiles(page)).toHaveCount(20);
    await page.goto('/vi?page=2');
    await expect(tiles(page)).toHaveCount(4);
    await page.goto('/vi?page=abc');
    await expect(tiles(page)).toHaveCount(20);
    await page.goto('/vi?page=99');
    await expect(tiles(page)).toHaveCount(4);
  });

  test('pagination links move between pages', async ({ page }) => {
    await page.goto('/vi');
    const nav = page.getByRole('navigation', { name: 'Phân trang' });
    await nav.getByRole('link', { name: 'Trang 2' }).click();
    await expect(page).toHaveURL(/\?page=2$/);
    await expect(tiles(page)).toHaveCount(4);
  });

  test('hovering a tile shows the card with price', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi');
    await tiles(page).nth(5).hover();
    await expect(card(page)).toBeVisible();
    await expect(card(page)).toContainText('₫');
  });

  test('the hovered image keeps its position and size inside a 16px frame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi');
    for (const index of [4, 5, 7]) {
      const tile = tiles(page).nth(index);
      await tile.scrollIntoViewIfNeeded();
      const before = await tile.boundingBox();
      const neighbour = await tiles(page)
        .nth(index === 7 ? 6 : index + 1)
        .boundingBox();
      await tile.hover();
      const tileCard = tile.getByTestId('product-hover-card');
      await expect(tileCard).toBeVisible();
      await page.waitForTimeout(500);
      const image = await tileCard.locator('.ProductHoverCard__image').boundingBox();
      const cardBox = await tileCard.boundingBox();
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(image![key] - before![key])).toBeLessThanOrEqual(0.5);
      }
      expect(Math.abs(cardBox!.x - (before!.x - 16))).toBeLessThanOrEqual(0.5);
      expect(Math.abs(cardBox!.y - (before!.y - 16))).toBeLessThanOrEqual(0.5);
      expect(Math.abs(cardBox!.width - (before!.width + 32))).toBeLessThanOrEqual(0.5);
      expect(await horizontalOverflow(page)).toBe(0);
      // Other cells never move.
      expect(
        await tiles(page)
          .nth(index === 7 ? 6 : index + 1)
          .boundingBox(),
      ).toEqual(neighbour);
      await page.mouse.move(720, 10);
    }
  });

  test('mobile shows one column and the card spans the screen', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/vi');
    const first = tiles(page).first();
    const second = tiles(page).nth(1);
    await second.waitFor(); // the grid streams in after the hero
    const [a, b] = [await first.boundingBox(), await second.boundingBox()];
    expect(a!.width).toBeCloseTo(390 - 32, 0);
    expect(b!.y).toBeGreaterThan(a!.y);
    await first.scrollIntoViewIfNeeded();
    await first.getByRole('link').first().tap();
    const tileCard = first.getByTestId('product-hover-card');
    await expect(tileCard).toBeVisible();
    const cardBox = await tileCard.boundingBox();
    expect(cardBox!.x).toBeCloseTo(0, 0);
    expect(cardBox!.width).toBeCloseTo(390, 0);
    await context.close();
  });

  test('keyboard focus opens the card and Escape closes it', async ({ page }) => {
    await page.goto('/vi');
    const link = tiles(page).first().getByRole('link').first();
    await link.focus();
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
  });
});

test.describe('product page', () => {
  test('renders the product heading and related products', async ({ page }) => {
    const response = await page.goto('/vi/products/hoang-hon-01');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: 'Hoàng Hôn 01' })).toBeVisible();
    await expect(page.locator('.ProductPage__related .ProductTile')).toHaveCount(4);
  });

  test('mobile shows a swipeable gallery and a sticky order bar', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/vi/products/hoang-hon-01');
    const counter = page.locator('.ProductGallery__counter');
    await expect(counter).toHaveText('01 / 04');
    await page
      .locator('.ProductGallery__track')
      .evaluate((track) => track.scrollTo({ left: track.clientWidth, behavior: 'instant' }));
    await expect(counter).toHaveText('02 / 04');
    const bar = page.locator('.ProductOrderBar');
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('link', { name: 'Đặt mua' })).toBeVisible();
    const barBox = await bar.boundingBox();
    expect(Math.round(barBox!.y + barBox!.height)).toBe(844);
    await context.close();
  });

  test('desktop keeps the stacked gallery without the order bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/products/hoang-hon-01');
    await expect(page.locator('.ProductOrderBar')).toBeHidden();
    await expect(page.locator('.ProductGallery__counter')).toBeHidden();
  });

  test('unknown products return 404', async ({ page }) => {
    const response = await page.goto('/vi/products/nope');
    expect(response?.status()).toBe(404);
  });
});

for (const path of ['/vi', '/vi?page=2', '/vi/products/hoang-hon-01', '/vi/products/am-ban']) {
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
