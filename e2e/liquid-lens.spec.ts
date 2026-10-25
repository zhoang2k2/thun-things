import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P11 liquid x-ray lens (revision 2). The lens is anchored where the pointer enters the grid and
// morphs on its own clock; it is off for touch, keyboard-only use and reduced motion.

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.91' } });

// The grid's own tiles only: the open card links to the same product and must not match.
const tileOf = (page: Page, slug: string) =>
  page
    .locator('.ProductGrid__list > .ProductTile')
    .filter({ has: page.locator(`.ProductTile__link[href$="/${slug}"]`) });

const center = async (page: Page, slug: string) => {
  await tileOf(page, slug).scrollIntoViewIfNeeded();
  const box = await tileOf(page, slug).boundingBox();
  if (!box) throw new Error(`no tile for ${slug}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Moves the pointer in small steps so the browser delivers real pointer events. */
const glide = async (page: Page, to: { x: number; y: number }) => {
  await page.mouse.move(to.x, to.y, { steps: 20 });
};

test.describe('desktop fine pointer', () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false });

  test('the lens anchors where the pointer enters a tile and stays there', async ({ page }) => {
    await page.goto('/vi');
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(0);

    const entry = await center(page, 'hoang-hon-01');
    await page.mouse.move(entry.x + 120, entry.y);
    await glide(page, entry);
    await expect(page.locator('.LiquidLens__xray')).toHaveCount(1);

    const bboxCenter = () =>
      page.evaluate(() => {
        const box = document.querySelector('clipPath path')!.getBoundingClientRect();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      });
    const before = await bboxCenter();
    // Still inside the same tile: the lens must not follow the pointer.
    await glide(page, { x: entry.x + 60, y: entry.y + 40 });
    await page.waitForTimeout(400);
    const after = await bboxCenter();
    // The lens does not follow the pointer: it stays near its entry point while it morphs.
    expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(30);
  });

  test('every x-ray copy is inert and mirrors a card, with the film grain on top', async ({
    page,
  }) => {
    await page.goto('/vi');
    const entry = await center(page, 'hoang-hon-01');
    await page.mouse.move(entry.x + 120, entry.y);
    await glide(page, entry);
    const cells = page.locator('.LiquidLens__xray .XrayCell');
    await expect(cells).toHaveCount(await page.locator('.ProductTile').count());
    for (const cell of await cells.all()) await expect(cell).toHaveAttribute('inert', '');
    await expect(page.locator('.LiquidLens__grain')).toHaveCount(1);
  });

  test('a revealed neighbour card matches its hover card exactly', async ({ page }) => {
    await page.goto('/vi');
    const neighbour = 'hoang-hon-01';
    const hover = await center(page, neighbour);
    // Reveal the neighbour's x-ray copy by sweeping over a different design next to it.
    const other = await center(page, 'pho-cu');
    await page.mouse.move(other.x, other.y);
    await glide(page, { x: other.x + 60, y: other.y });
    const copy = page.locator('.LiquidLens__xray .XrayCell').nth(0).locator('.XrayCell__card');
    await expect(copy).toBeVisible();
    const copyBox = await copy.boundingBox();

    // Now hover the neighbour directly: its real card must sit at the same place and size.
    await glide(page, hover);
    const card = page.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    const cardBox = await card.boundingBox();
    expect(Math.abs(copyBox!.x - cardBox!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(copyBox!.y - cardBox!.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(copyBox!.width - cardBox!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(copyBox!.height - cardBox!.height)).toBeLessThanOrEqual(1);
  });

  test('the lens sits above the hovered card, and the card stays clickable', async ({ page }) => {
    await page.goto('/vi');
    const at = await center(page, 'hoang-hon-01');
    await page.mouse.move(at.x + 120, at.y);
    await glide(page, at);
    const card = page.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    // The card opens with a circle reveal; hit-test only once it has fully opened.
    await page.waitForTimeout(600);
    const lensZ = await page
      .locator('.LiquidLens__xray')
      .evaluate((el) => getComputedStyle(el).zIndex);
    const cardZ = await card.evaluate((el) => getComputedStyle(el).zIndex);
    expect(Number(lensZ)).toBeGreaterThan(Number(cardZ));
    // The lens does not block the card: the element under the card's centre is still the card.
    const box = await card.boundingBox();
    const hit = await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-testid="product-hover-card"]') !== null,
      { x: box!.x + box!.width / 2, y: box!.y + 30 },
    );
    expect(hit).toBe(true);
  });

  test('leaving the grid fades the lens out', async ({ page }) => {
    await page.goto('/vi');
    const at = await center(page, 'hoang-hon-01');
    await page.mouse.move(at.x + 120, at.y);
    await glide(page, at);
    await expect(page.locator('.LiquidLens__xray')).toHaveCSS('visibility', 'visible');
    await page.mouse.move(5, 5);
    await expect(page.locator('.LiquidLens__xray')).toHaveCSS('visibility', 'hidden');
  });

  test('the lens layer adds no serious accessibility violations', async ({ page }) => {
    await page.goto('/vi');
    const at = await center(page, 'dem-trang');
    await page.mouse.move(at.x + 160, at.y);
    await glide(page, at);
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
    await glide(page, at);
    await expect(page.locator('.LiquidLens')).toHaveCount(0);
  });
});

test.describe('touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('no lens is rendered on touch', async ({ page }) => {
    await page.goto('/vi');
    await expect(page.locator('.LiquidLens')).toHaveCount(0);
  });
});
