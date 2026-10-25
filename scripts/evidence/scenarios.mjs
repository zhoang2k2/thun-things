// P11 revision 4 evidence: the site-wide liquid. `pnpm evidence` writes local artifacts only.
const DESKTOP = { width: 1440, height: 900 };

const centreTile = async (page, index) => {
  const tile = page.locator('.ProductGrid__list:visible > .ProductTile').nth(index);
  await tile.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const box = await tile.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
};

/** From the page into the grid: outer becomes inner, a card opens, neighbours are pushed. */
const liquidJourney = {
  name: 'liquid-journey-vi',
  kind: 'gif',
  viewport: DESKTOP,
  async run({ page, snap }) {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    const at = await centreTile(page, 5);
    // Start above the grid (outside it), then move in.
    await page.mouse.move(at.x - 300, at.box.y - 140);
    await snap(4);
    for (let i = 1; i <= 14; i += 1) {
      await page.mouse.move(
        at.x - 300 + (300 * i) / 14,
        at.box.y - 140 + ((at.y - at.box.y + 140) * i) / 14,
      );
      await snap(1);
    }
    for (let i = 0; i < 8; i += 1) {
      await page.waitForTimeout(80);
      await snap(1);
    }
  },
};

const still = (name, run) => ({ name, kind: 'png', viewport: DESKTOP, path: '/vi', run });

/** Outer state over the hero (outside the grid). */
const outer = still('liquid-outer-vi', async ({ page }) => {
  await page.mouse.move(600, 300);
  await page.mouse.move(700, 320, { steps: 10 });
  await page.waitForTimeout(500);
});

/** Over a hovered card, near its button: coloured over the card, purple on the button overlap. */
const overCard = still('liquid-over-card-vi', async ({ page }) => {
  const at = await centreTile(page, 1);
  await page.mouse.move(at.x, at.y, { steps: 10 });
  await page.waitForTimeout(450);
  const button = await page
    .getByTestId('product-hover-card')
    .locator('.ProductAction')
    .boundingBox();
  await page.mouse.move(at.x, button.y - 40, { steps: 10 });
  await page.waitForTimeout(400);
});

/** Hovering the card button: the overlap turns orange, the button itself black. */
const onButton = still('liquid-on-button-vi', async ({ page }) => {
  const at = await centreTile(page, 1);
  await page.mouse.move(at.x, at.y, { steps: 10 });
  await page.waitForTimeout(450);
  const button = await page
    .getByTestId('product-hover-card')
    .locator('.ProductAction')
    .boundingBox();
  await page.mouse.move(button.x + button.width / 2, button.y + button.height / 2, { steps: 10 });
  await page.waitForTimeout(400);
});

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [liquidJourney, outer, overCard, onButton];

export default scenarios;
