// P11 (revision 2) evidence: the liquid x-ray lens. `pnpm evidence` writes local artifacts only.
const DESKTOP = { width: 1440, height: 900 };

/** The lens opens where the pointer enters a tile and morphs in place (frames show the edge). */
const lensMorph = {
  name: 'lens-morph-vi',
  kind: 'gif',
  viewport: DESKTOP,
  async run({ page, snap }) {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    const tile = page.locator('.ProductTile').nth(5);
    await tile.scrollIntoViewIfNeeded();
    const box = await tile.boundingBox();
    const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(at.x + 120, at.y);
    await page.mouse.move(at.x, at.y, { steps: 20 });
    for (let i = 0; i < 16; i += 1) {
      await snap(1);
      await page.waitForTimeout(120);
    }
  },
};

/** A neighbour's card revealed by the lens, as it looks with the film grain over it. */
const lensNeighbour = {
  name: 'lens-neighbour-vi',
  kind: 'png',
  viewport: DESKTOP,
  path: '/vi',
  async run({ page }) {
    const other = page.locator('.ProductTile').nth(4);
    await other.scrollIntoViewIfNeeded();
    const box = await other.boundingBox();
    const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(at.x + 150, at.y);
    await page.mouse.move(at.x + 20, at.y, { steps: 20 });
    await page.waitForTimeout(500);
  },
};

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [lensMorph, lensNeighbour];

export default scenarios;
