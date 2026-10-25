import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P11 liquid x-ray lens. The lens only exists for fine pointers without reduced motion; each spec
// sets its own context so the media queries are real, not mocked.

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.91' } });

const tileOf = (page: Page, slug: string) =>
  page.locator('.ProductTile').filter({ has: page.locator(`a[href$="/${slug}"]`) });

/** Sweeps the pointer across the grid in small steps so the follower and stretch update. */
const sweep = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.move(to.x, to.y, { steps: 30 });
};

const center = async (page: Page, slug: string) => {
  await tileOf(page, slug).scrollIntoViewIfNeeded();
  const box = await tileOf(page, slug).boundingBox();
  if (!box) throw new Error(`no tile for ${slug}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test.describe('desktop fine pointer', () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false });

  test('the lens x-rays neighbouring designs and fades out on leave', async ({ page }) => {
    await page.goto('/vi');
    const grid = page.locator('.ProductGrid__list');
    await grid.scrollIntoViewIfNeeded();
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(0);

    const target = await center(page, 'hoang-hon-01');
    await sweep(page, { x: target.x + 120, y: target.y }, target);
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(1);
    // One x-ray cell per visible grid cell.
    await expect(page.locator('.LiquidLens__xray .XrayCell')).toHaveCount(
      await page.locator('.ProductTile').count(),
    );

    const outline = page.locator('.LiquidLens path').first();
    const first = await outline.getAttribute('d');
    await page.waitForTimeout(300);
    expect(await outline.getAttribute('d')).not.toBe(first);

    // Leaving the grid hides the lens (fade is 150 ms).
    await page.mouse.move(5, 5);
    await expect(page.locator('.LiquidLens')).toHaveCSS('visibility', 'hidden');
  });

  test('the hovered card stays on top and clickable while the lens is active', async ({ page }) => {
    await page.goto('/vi');
    const slug = 'hoang-hon-01';
    const at = await center(page, slug);
    await sweep(page, { x: at.x + 120, y: at.y }, at);
    const card = tileOf(page, slug).getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    const hit = await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-testid="product-hover-card"]') !== null,
      { x: box!.x + box!.width / 2, y: box!.y + 30 },
    );
    expect(hit).toBe(true);
  });

  test('the lens layer adds no serious accessibility violations', async ({ page }) => {
    await page.goto('/vi');
    const at = await center(page, 'dem-trang');
    await sweep(page, { x: at.x + 160, y: at.y }, { x: at.x + 40, y: at.y });
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(1);
    const { violations } = await new AxeBuilder({ page })
      .include('.ProductGrid')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('no lens is rendered', async ({ page }) => {
    await page.goto('/vi');
    const at = await center(page, 'hoang-hon-01');
    await sweep(page, { x: at.x - 300, y: at.y }, at);
    await expect(page.locator('.LiquidLens')).toHaveCount(0);
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(0);
  });
});

test.describe('touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('no lens is rendered on touch', async ({ page }) => {
    await page.goto('/vi');
    await expect(page.locator('.LiquidLens')).toHaveCount(0);
  });
});
