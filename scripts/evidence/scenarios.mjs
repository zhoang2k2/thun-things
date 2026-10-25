// P9a2 evidence: the two product statuses (vi) on the hover card, the product page, the mobile
// order bar and the prefilled Contact page. `pnpm evidence` writes local artifacts only.
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const dismissConsent = async (page) => {
  const reject = page.getByRole('button', { name: 'Từ chối' });
  if (await reject.isVisible()) await reject.click();
};

const hoverTile =
  (slug) =>
  async ({ page }) => {
    await dismissConsent(page);
    const tile = page.locator('.ProductTile').filter({ has: page.locator(`a[href$="/${slug}"]`) });
    // Bring the tile near the top so the whole card (image, name, price, button) fits.
    const box = await tile.boundingBox();
    await page.evaluate((top) => window.scrollBy(0, top - 80), box.y);
    await tile.hover();
    await tile.getByTestId('product-hover-card').waitFor();
    await page.waitForTimeout(400);
  };

const settle = async ({ page }) => {
  await dismissConsent(page);
  await page.waitForTimeout(300);
};

// P11 tint prototype (plan Task 1): the same lens and cursor position, three candidate tints.
const lensTint = (name, fill, opacity) => ({
  name,
  kind: 'png',
  viewport: DESKTOP,
  path: '/vi',
  async run({ page }) {
    const target = page.locator('.ProductTile').nth(5);
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(center.x - 120, center.y);
    await page.mouse.move(center.x, center.y, { steps: 25 });
    // Prototype only: the hovered tile's card and its stacking boost would hide the lens, so both are
    // taken out for this capture to judge the tint over the back-photo layer.
    await page.addStyleTag({
      content:
        '[data-testid="product-hover-card"] { display: none !important; } .ProductTile { z-index: auto !important; }',
    });
    await page.evaluate(
      ({ fill, opacity }) => {
        const tint = document.querySelector('.LiquidLens path[fill]');
        tint.setAttribute('fill', fill);
        tint.setAttribute('fill-opacity', String(opacity));
      },
      { fill, opacity },
    );
    await page.waitForTimeout(250);
  },
});

// P11 sweep: the real behaviour (the hovered card stays), captured as a GIF across the grid.
const lensSweep = {
  name: 'lens-sweep-vi',
  kind: 'gif',
  viewport: DESKTOP,
  async run({ page, snap }) {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');
    const grid = page.locator('.ProductTile');
    const first = await grid.nth(0).boundingBox();
    const fifth = await grid.nth(4).boundingBox();
    await page.mouse.move(first.x + 40, first.y + 40);
    await snap(2);
    for (let i = 0; i <= 24; i += 1) {
      const t = i / 24;
      await page.mouse.move(
        first.x + 40 + (fifth.x - first.x + 80) * t,
        first.y + 40 + (fifth.y - first.y) * Math.sin(t * Math.PI) * 0.6,
      );
      await snap(1);
    }
  },
};

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  lensSweep,
  lensTint('lens-tint-orange-vi', '#E8662E', 0.1),
  lensTint('lens-tint-ink-vi', '#111111', 0.05),
  lensTint('lens-tint-moss-vi', '#4F5B3A', 0.1),
  {
    name: 'hover-in-stock-vi',
    kind: 'png',
    viewport: DESKTOP,
    path: '/vi',
    run: hoverTile('hoang-hon-01'),
  },
  {
    name: 'hover-sold-out-vi',
    kind: 'png',
    viewport: DESKTOP,
    path: '/vi',
    run: hoverTile('am-ban'),
  },
  {
    name: 'product-in-stock-vi',
    kind: 'png',
    viewport: DESKTOP,
    path: '/vi/products/hoang-hon-01',
    run: settle,
  },
  {
    name: 'product-sold-out-vi',
    kind: 'png',
    viewport: DESKTOP,
    path: '/vi/products/am-ban',
    run: settle,
  },
  {
    name: 'order-bar-sold-out-mobile-vi',
    kind: 'png',
    viewport: MOBILE,
    mobile: true,
    path: '/vi/products/am-ban',
    run: settle,
  },
  {
    name: 'contact-preorder-vi',
    kind: 'png',
    viewport: DESKTOP,
    path: '/vi/contact?product=am-ban&purpose=preorder',
    run: settle,
  },
  {
    name: 'product-sold-out-en',
    kind: 'png',
    viewport: DESKTOP,
    path: '/en/products/am-ban',
    async run({ page }) {
      const reject = page.getByRole('button', { name: 'Reject' });
      if (await reject.isVisible()) await reject.click();
      await page.waitForTimeout(300);
    },
  },
];

export default scenarios;
