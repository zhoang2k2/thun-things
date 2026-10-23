// Evidence scenarios for the current phase PR (see the git-pr-workflow skill).
// `gif` scenarios call `snap(hold)` after each meaningful step; `png` scenarios get a full-page shot.
// Keep each GIF under 15 s: frames × 140 ms.
//
// P3 runs twice:
//   E2E_LEADS_SINK=memory pnpm evidence          forms enabled, leads kept in memory (no email)
//   RESEND_API_KEY= LEADS_TO_EMAIL= EVIDENCE_SET=disabled pnpm evidence   disabled form state

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const typeSlowly = async (locator, text, snap) => {
  await locator.click();
  for (const chunk of text.match(/.{1,4}/g)) {
    await locator.pressSequentially(chunk);
    await snap();
  }
};

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  {
    name: '01-contact-form',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/contact');
      await snap(5);
      await page.locator('form.ContactForm').getByRole('button', { name: 'Gửi' }).click();
      await page.locator('.FormErrorSummary').waitFor();
      await snap(10);
      await typeSlowly(page.getByLabel('Email'), 'lan@example.com', snap);
      await typeSlowly(page.getByLabel('Số điện thoại / Zalo'), '0912 345 678', snap);
      await page.getByRole('checkbox', { name: /chính sách bảo mật/ }).check();
      await snap(3);
      await page.locator('form.ContactForm').getByRole('button', { name: 'Gửi' }).click();
      await page.getByRole('status').waitFor();
      await snap(12);
    },
  },
  {
    name: '02-product-to-contact',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/products/hoang-hon-01');
      await snap(6);
      await page.locator('.ProductInfo').getByRole('link', { name: 'Đặt mua' }).click();
      await page.waitForURL('**/contact?product=hoang-hon-01&purpose=order');
      await page.getByRole('combobox', { name: 'Size' }).waitFor();
      await snap(10);
      await page.getByRole('combobox', { name: 'Size' }).selectOption('M');
      await page.getByLabel('Số lượng').fill('2');
      await snap(8);
    },
  },
  {
    name: '03-notify-me',
    kind: 'gif',
    viewport: DESKTOP,
    run: async ({ page, snap }) => {
      await page.goto('/products/am-ban');
      const section = page.locator('#notify');
      await snap(5);
      await section.getByRole('checkbox').check();
      await section.getByRole('button', { name: 'Báo cho tôi' }).click();
      await section.locator('.FormErrorSummary').waitFor();
      await snap(10);
      await typeSlowly(section.getByLabel('Email'), 'lan@example.com', snap);
      await section.getByRole('button', { name: 'Báo cho tôi' }).click();
      await section.getByRole('status').waitFor();
      await snap(12);
    },
  },
  { name: 'contact-desktop', kind: 'png', viewport: DESKTOP, path: '/contact' },
  { name: 'contact-mobile', kind: 'png', viewport: MOBILE, path: '/contact', mobile: true },
  {
    name: 'contact-product-desktop',
    kind: 'png',
    viewport: DESKTOP,
    path: '/contact?product=hoang-hon-01&purpose=order',
  },
  { name: 'product-sold-out-desktop', kind: 'png', viewport: DESKTOP, path: '/products/am-ban' },
  {
    name: 'product-sold-out-mobile',
    kind: 'png',
    viewport: MOBILE,
    path: '/products/am-ban',
    mobile: true,
  },
  { name: 'privacy-desktop', kind: 'png', viewport: DESKTOP, path: '/policy/privacy' },
  { name: 'privacy-mobile', kind: 'png', viewport: MOBILE, path: '/policy/privacy', mobile: true },
  { name: 'returns-desktop', kind: 'png', viewport: DESKTOP, path: '/policy/returns' },
  { name: 'about-desktop', kind: 'png', viewport: DESKTOP, path: '/about' },
  { name: 'about-mobile', kind: 'png', viewport: MOBILE, path: '/about', mobile: true },
  { name: 'contact-sent-desktop', kind: 'png', viewport: DESKTOP, path: '/contact/sent' },
  {
    name: 'contact-disabled-desktop',
    kind: 'png',
    viewport: DESKTOP,
    path: '/contact',
    set: 'disabled',
  },
  {
    name: 'notify-disabled-mobile',
    kind: 'png',
    viewport: MOBILE,
    path: '/products/am-ban',
    mobile: true,
    set: 'disabled',
  },
];

export default scenarios;
