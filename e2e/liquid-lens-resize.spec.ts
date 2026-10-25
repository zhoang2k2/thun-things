import { expect, test } from '@playwright/test';

// The open card follows its cell when the grid changes size. The pointer stays inside the same cell
// across the resize, so no new pointer event arrives: only the grid's re-measure can move the card.
test('the open card stays on its cell after a resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/vi');
  const tile = page.locator('.ProductGrid__list > .ProductTile').nth(1);
  await tile.scrollIntoViewIfNeeded();
  const first = await tile.boundingBox();
  // x inside the cell both before (368–720) and after (233–450) the resize.
  await page.mouse.move(first!.x + 20, first!.y + first!.height / 2);
  const card = page.getByTestId('product-hover-card');
  await expect(card).toBeVisible();
  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForTimeout(400);
  const cell = await tile.boundingBox();
  const box = await card.boundingBox();
  expect(Math.abs(box!.x - (cell!.x - 16))).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.y - (cell!.y - 16))).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.width - (cell!.width + 32))).toBeLessThanOrEqual(1);
});
