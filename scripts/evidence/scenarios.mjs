// P7 quiz bot evidence. `pnpm evidence` writes local artifacts only; no scenario uses `?ga_debug=1`.
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const pause = (page, ms) => page.waitForTimeout(ms);

const COPY = {
  vi: {
    reject: 'Từ chối',
    launcher: 'Tìm áo hợp bạn',
    continue: 'Tiếp tục',
    showResult: 'Xem gợi ý',
    seeMore: 'Xem thêm',
  },
  en: {
    reject: 'Reject',
    launcher: 'Find your shirt',
    continue: 'Continue',
    showResult: 'Show my match',
    seeMore: 'See more',
  },
};

const quizFlow = (locale) => ({
  name: `0${locale === 'vi' ? 1 : 2}-quiz-flow-${locale}`,
  kind: 'gif',
  viewport: DESKTOP,
  async run({ page, snap }) {
    const copy = COPY[locale];
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: copy.reject }).click();
    await snap(6);
    await page.getByRole('button', { name: copy.launcher }).click();
    const card = page.getByRole('dialog');
    await card.getByRole('radio').first().waitFor();
    await snap(8);
    await card.getByRole('radio').nth(1).check();
    await snap(6);
    await card.getByRole('button', { name: copy.continue }).click();
    await snap(6);
    await card.getByRole('radio').first().check();
    await snap(4);
    await card.getByRole('button', { name: copy.showResult }).click();
    await card.locator('a[href*="/products/"]').first().waitFor();
    await pause(page, 300);
    await snap(10);
    const more = card.getByRole('button', { name: copy.seeMore });
    if (await more.count()) {
      await more.click();
      await pause(page, 200);
      await snap(10);
    }
  },
});

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  quizFlow('vi'),
  quizFlow('en'),
  {
    name: '03-bubble-shown-dismissed-vi',
    kind: 'gif',
    viewport: DESKTOP,
    async run({ page, snap }) {
      await page.clock.install();
      await page.goto('/vi');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: COPY.vi.reject }).click();
      // Pause the hero so the clock jump does not catch it mid-transition.
      await page.getByRole('button', { name: 'Tạm dừng' }).click();
      await snap(6);
      await page.clock.fastForward(20_000);
      await page.getByRole('button', { name: 'Tắt gợi ý' }).waitFor();
      await snap(14);
      await page.getByRole('button', { name: 'Tắt gợi ý' }).click();
      await snap(8);
    },
  },
  {
    name: 'quiz-card-mobile-above-consent-vi',
    kind: 'png',
    viewport: MOBILE,
    mobile: true,
    path: '/vi',
    async run({ page }) {
      await page.getByRole('button', { name: COPY.vi.launcher }).click();
      await page.getByRole('dialog').getByRole('radio').first().waitFor();
    },
  },
  {
    name: 'quiz-launcher-product-mobile-vi',
    kind: 'png',
    viewport: MOBILE,
    mobile: true,
    path: '/vi/products/hoang-hon-01',
    async run() {},
  },
];

export default scenarios;
