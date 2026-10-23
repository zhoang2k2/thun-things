// Evidence scenarios for the current phase PR (see the git-pr-workflow skill).
// `gif` scenarios call `snap(hold)` after each meaningful step; `png` scenarios get a full-page shot.
// Keep each GIF under 15 s: frames × 140 ms.

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const pause = (page, ms) => page.waitForTimeout(ms);

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  {
    name: '01-hero-slideshow',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/');
      for (let step = 0; step < 24; step += 1) {
        await snap();
        await pause(page, 120);
      }
      await page.getByRole('button', { name: 'Tạm dừng' }).click();
      await snap(6);
      await page.getByRole('button', { name: 'Banner 4 / 4' }).click();
      await snap(8);
    },
  },
  {
    name: '02-hover-card',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/');
      const tiles = page.locator('.ProductTile');
      await tiles.nth(4).scrollIntoViewIfNeeded();
      await page.mouse.move(720, 120);
      await snap(4);
      for (const index of [5, 6, 7, 4]) {
        const box = await tiles.nth(index).boundingBox();
        await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.4, { steps: 6 });
        for (let step = 0; step < 6; step += 1) {
          await snap();
          await pause(page, 60);
        }
        await snap(4);
      }
      await page.mouse.move(720, 60, { steps: 6 });
      await snap(5);
    },
  },
  {
    name: '03-keyboard-card',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/');
      const tile = page.locator('.ProductTile').nth(1);
      await tile.scrollIntoViewIfNeeded();
      await snap(3);
      await tile.getByRole('link').first().focus();
      await snap(8);
      await page.keyboard.press('Tab');
      await snap(8);
      await page.keyboard.press('Escape');
      await snap(6);
    },
  },
  {
    name: '04-mobile-tap',
    kind: 'gif',
    viewport: MOBILE,
    mobile: true,
    run: async ({ page, snap }) => {
      await page.goto('/');
      const tile = page.locator('.ProductTile').nth(2);
      await tile.scrollIntoViewIfNeeded();
      await snap(4);
      await tile.getByRole('link').first().tap();
      await pause(page, 400);
      await snap(8);
      await page.getByTestId('product-hover-card').getByText(/₫/).tap();
      await page.waitForURL('**/products/**');
      await snap(8);
    },
  },
  {
    name: '05-pagination',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/');
      const nav = page.getByRole('navigation', { name: 'Phân trang' });
      await nav.scrollIntoViewIfNeeded();
      await snap(5);
      await nav.getByRole('link', { name: 'Trang 2' }).click();
      await page.waitForURL('**/?page=2');
      await page.getByRole('navigation', { name: 'Phân trang' }).scrollIntoViewIfNeeded();
      await snap(8);
    },
  },
  { name: 'home-desktop', kind: 'png', viewport: DESKTOP, path: '/' },
  { name: 'home-mobile', kind: 'png', viewport: MOBILE, path: '/', mobile: true },
  { name: 'product-desktop', kind: 'png', viewport: DESKTOP, path: '/products/am-ban' },
  { name: 'product-mobile', kind: 'png', viewport: MOBILE, path: '/products/am-ban', mobile: true },
  { name: 'product-404', kind: 'png', viewport: DESKTOP, path: '/products/nope' },
];

export default scenarios;
