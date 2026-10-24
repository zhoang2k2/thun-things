// P8 quiz AI rationale evidence. `pnpm evidence` writes local artifacts only. The capture server
// runs with AI off, so the rationale shown here is a stubbed `/api/quiz/explain` answer: no real
// AI provider is called. No scenario uses `?ga_debug=1`.
const DESKTOP = { width: 1440, height: 900 };

const pause = (page, ms) => page.waitForTimeout(ms);

const COPY = {
  vi: {
    reject: 'Từ chối',
    launcher: 'Tìm áo hợp bạn',
    continue: 'Tiếp tục',
    showResult: 'Xem gợi ý',
    text: 'Sắc cam hoàng hôn ấm áp, hợp với gu nghệ thuật bạn vừa chọn.',
  },
  en: {
    reject: 'Reject',
    launcher: 'Find your shirt',
    continue: 'Continue',
    showResult: 'Show my match',
    text: 'The warm sunset orange suits the artful style you picked.',
  },
};

const rationaleFlow = (locale, index) => ({
  name: `0${index}-quiz-rationale-${locale}`,
  kind: 'gif',
  viewport: DESKTOP,
  async run({ page, snap }) {
    const copy = COPY[locale];
    await page.route('**/api/quiz/explain', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_200));
      await route.fulfill({ json: { text: copy.text, provider: 'gemini' } });
    });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: copy.reject }).click();
    await page.getByRole('button', { name: copy.launcher }).click();
    const card = page.getByRole('dialog');
    await card.getByRole('radio').first().waitFor();
    await card.getByRole('radio').nth(1).check();
    await snap(5);
    await card.getByRole('button', { name: copy.continue }).click();
    await card.getByRole('radio').first().check();
    await snap(4);
    await card.getByRole('button', { name: copy.showResult }).click();
    await card.locator('.QuizRationale__skeleton').waitFor();
    await snap(6);
    await card.getByText(copy.text).waitFor();
    await pause(page, 200);
    await snap(14);
  },
});

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  rationaleFlow('vi', 1),
  rationaleFlow('en', 2),
  { name: 'privacy-ai-vi', kind: 'png', viewport: DESKTOP, path: '/vi/policy/privacy' },
  { name: 'privacy-ai-en', kind: 'png', viewport: DESKTOP, path: '/en/policy/privacy' },
];

export default scenarios;
