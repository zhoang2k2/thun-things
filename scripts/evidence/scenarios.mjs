// P5 locale-switch evidence and English pages. `pnpm evidence` writes local artifacts only.
// `:visible`: after a client-side locale switch, Next keeps the previous route's tree in the DOM
// (hidden with `display: none`) for back/forward, so a plain selector matches two switchers.
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  ...[
    ['home', ''],
    ['product', '/products/hoang-hon-01'],
    ['contact', '/contact?product=am-ban&purpose=notify'],
  ].map(([name, path]) => ({
    name: `switch-${name}`,
    kind: 'gif',
    viewport: DESKTOP,
    async run({ page, snap }) {
      await page.goto(`/vi${path}`);
      await page.waitForLoadState('networkidle');
      await snap(8);
      const english = page.locator('.LocaleSwitcher a[lang="en"]:visible');
      await english.click();
      await page.waitForURL(`/en${path}`);
      await page.waitForLoadState('networkidle');
      await snap(8);
      await page.locator('.LocaleSwitcher a[lang="vi"]:visible').click();
      await page.waitForURL(`/vi${path}`);
      await page.waitForLoadState('networkidle');
      await snap(8);
    },
  })),
  ...[
    ['home', '/en'],
    ['product', '/en/products/hoang-hon-01'],
    ['contact', '/en/contact?product=hoang-hon-01&purpose=order'],
    ['privacy', '/en/policy/privacy'],
    ['about', '/en/about'],
    ['returns', '/en/policy/returns'],
    ['not-found', '/en/does-not-exist'],
    ['notify', '/en/products/am-ban'],
  ].flatMap(([name, path]) => [
    { name: `en-${name}-desktop`, kind: 'png', viewport: DESKTOP, path },
    { name: `en-${name}-mobile`, kind: 'png', viewport: MOBILE, mobile: true, path },
  ]),
  {
    name: 'og-product-en',
    kind: 'png',
    viewport: DESKTOP,
    path: '/en/products/hoang-hon-01/opengraph-image',
  },
];

export default scenarios;
