// P6 consent evidence. `pnpm evidence` writes local artifacts only.
// No scenario uses `?ga_debug=1`: a non-production build then loads nothing from Google, even
// after Accept, so evidence runs never send data to the owner's real GA4 property.
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const pause = (page, ms) => page.waitForTimeout(ms);

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  {
    name: '01-consent-customize-vi',
    kind: 'gif',
    viewport: DESKTOP,
    async run({ page, snap }) {
      await page.goto('/vi');
      await page.waitForLoadState('networkidle');
      await snap(8);
      await page.getByRole('button', { name: 'Tuỳ chỉnh' }).click();
      await snap(8);
      await page.getByRole('checkbox', { name: 'Phân tích (Google Analytics)' }).check();
      await snap(6);
      await page.getByRole('button', { name: 'Lưu lựa chọn' }).click();
      await pause(page, 200);
      await snap(6);
      await page.getByRole('button', { name: 'Cài đặt cookie' }).scrollIntoViewIfNeeded();
      await snap(4);
      await page.getByRole('button', { name: 'Cài đặt cookie' }).click();
      await snap(8);
    },
  },
  {
    name: '02-consent-reject-en',
    kind: 'gif',
    viewport: DESKTOP,
    async run({ page, snap }) {
      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      await snap(8);
      await page.getByRole('button', { name: 'Reject' }).click();
      await pause(page, 200);
      await snap(8);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await snap(6);
    },
  },
  {
    name: '03-settings-dialog-en',
    kind: 'gif',
    viewport: DESKTOP,
    async run({ page, snap }) {
      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Customize' }).click();
      await snap(10);
    },
  },
  { name: 'banner-vi-desktop', kind: 'png', viewport: DESKTOP, path: '/vi' },
  { name: 'banner-vi-mobile', kind: 'png', viewport: MOBILE, mobile: true, path: '/vi' },
  { name: 'banner-en-desktop', kind: 'png', viewport: DESKTOP, path: '/en' },
  {
    name: 'banner-product-mobile',
    kind: 'png',
    viewport: MOBILE,
    mobile: true,
    path: '/vi/products/hoang-hon-01',
  },
  { name: 'privacy-cookies-vi', kind: 'png', viewport: DESKTOP, path: '/vi/policy/privacy' },
  { name: 'privacy-cookies-en', kind: 'png', viewport: DESKTOP, path: '/en/policy/privacy' },
];

export default scenarios;
