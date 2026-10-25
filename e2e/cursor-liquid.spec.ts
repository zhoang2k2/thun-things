import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// P11 revision 4: a site-wide liquid follows the pointer (120px near-circle; 240px and deep over the
// product grid), sits above the hover card and below the header, pushes neighbouring designs away and
// recolours its overlap with the hover card's button. Off on touch and under reduced motion.

test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.93' } });

const tiles = (page: Page) => page.locator('.ProductGrid__list:visible > .ProductTile');

/** Width of the liquid outline, from its clip path geometry. */
const liquidWidth = (page: Page) =>
  page.evaluate(
    () => (document.querySelector('.CursorLiquid__clip path') as SVGPathElement).getBBox().width,
  );

const glide = async (page: Page, to: { x: number; y: number }) => {
  await page.mouse.move(to.x, to.y, { steps: 12 });
};

/** Centre a tile on screen and return its centre point. */
const centreOf = async (page: Page, index: number) => {
  await tiles(page)
    .nth(index)
    .evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const box = (await tiles(page).nth(index).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
};

test.describe('desktop fine pointer', () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false });

  test('a small near-circle outside the grid grows over the grid', async ({ page }) => {
    await page.goto('/vi');
    // Hero area: outside the product grid.
    await glide(page, { x: 700, y: 300 });
    await page.waitForTimeout(500);
    const resting = await liquidWidth(page);
    expect(resting).toBeGreaterThan(100);
    expect(resting).toBeLessThan(140);

    const at = await centreOf(page, 5);
    await glide(page, at);
    await page.waitForTimeout(700);
    expect(await liquidWidth(page)).toBeGreaterThan(200);
  });

  test('sits above the hover card and below the header, coloured over the card', async ({
    page,
  }) => {
    await page.goto('/vi');
    const at = await centreOf(page, 1);
    await glide(page, at);
    const card = page.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    const z = async (selector: string) =>
      Number(
        await page
          .locator(selector)
          .first()
          .evaluate((el) => getComputedStyle(el).zIndex),
      );
    expect(await z('.CursorLiquid__colour')).toBeGreaterThan(
      await z('[data-testid="product-hover-card"]'),
    );
    expect(await z('.CursorLiquid__colour')).toBeLessThan(await z('.SiteHeader'));
    await expect(page.locator('.CursorLiquid__colour')).toHaveCSS('visibility', 'visible');
    await expect(page.locator('.CursorLiquid__colour')).toHaveCSS('mix-blend-mode', 'multiply');
  });

  test('copies the card button where the liquid overlaps it: purple, orange while hovered', async ({
    page,
  }) => {
    await page.goto('/vi');
    const at = await centreOf(page, 1);
    await glide(page, at);
    const button = page.getByTestId('product-hover-card').locator('.ProductAction');
    await expect(button).toBeVisible();
    await page.waitForTimeout(400);
    const copy = page.locator('.CursorLiquid__button');
    const real = (await button.boundingBox())!;
    const copied = (await copy.boundingBox())!;
    expect(Math.abs(real.x - copied.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(real.y - copied.y)).toBeLessThanOrEqual(1);
    await expect(copy).toHaveCSS('background-color', 'rgb(107, 63, 160)');

    await glide(page, { x: real.x + real.width / 2, y: real.y + real.height / 2 });
    await expect(copy).toHaveAttribute('data-hover', 'true');
    await expect(copy).toHaveCSS('background-color', 'rgb(255, 90, 31)');
  });

  test('pushes neighbouring designs away while the hovered one stays still', async ({ page }) => {
    await page.goto('/vi');
    const at = await centreOf(page, 1);
    // Near the right edge of tile 1: tile 2 is close to the liquid.
    await glide(page, { x: at.box.x + at.box.width - 20, y: at.y });
    await page.waitForTimeout(400);
    const transformOf = (index: number) =>
      tiles(page)
        .nth(index)
        .locator('.ProductTile__link')
        .evaluate((el) => el.style.transform);
    expect(await transformOf(2)).toContain('translate(');
    expect(await transformOf(1)).toBe('');
    await page.mouse.move(5, 5);
    await expect.poll(() => transformOf(2)).toBe('');
  });

  test('the card opens by growing its frame out of the photo, with a 1px border', async ({
    page,
  }) => {
    await page.goto('/vi');
    const at = await centreOf(page, 1);
    await glide(page, at);
    const card = page.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('border-top-width', '1px');
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).clipPath))
      .toMatch(/^inset\(0px 0px|^none$/);
  });

  test('the grid shares the header frame', async ({ page }) => {
    await page.goto('/vi');
    const header = (await page.locator('.SiteHeader__inner').boundingBox())!;
    const grid = (await page.locator('.ProductGrid:visible').boundingBox())!;
    expect(Math.abs(grid.x - header.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(grid.width - header.width)).toBeLessThanOrEqual(1);
  });

  test('no serious accessibility violations with the liquid active', async ({ page }) => {
    await page.goto('/vi');
    const at = await centreOf(page, 10);
    await glide(page, at);
    const { violations } = await new AxeBuilder({ page })
      .include('.ProductGrid')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('no liquid', async ({ page }) => {
    await page.goto('/vi');
    await glide(page, { x: 700, y: 300 });
    await expect(page.locator('.CursorLiquid')).toHaveCount(0);
  });
});

test.describe('touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('no liquid on touch', async ({ page }) => {
    await page.goto('/vi');
    await expect(page.locator('.CursorLiquid')).toHaveCount(0);
  });
});
