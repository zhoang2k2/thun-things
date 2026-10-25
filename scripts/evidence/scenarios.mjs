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

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
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
