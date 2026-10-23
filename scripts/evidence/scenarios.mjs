// Evidence scenarios for the current phase PR (see the git-pr-workflow skill).
// `gif` scenarios call `snap(hold)` after each meaningful step; `png` scenarios get a full-page shot.
// Keep each GIF under 15 s: frames × 140 ms.
//
// P4: PNG only. Generated images (icon, Open Graph) are opened directly by URL; the error page has
// no screenshot because no test-only route triggers it.
//   pnpm evidence

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [
  { name: 'icon-svg', kind: 'png', viewport: DESKTOP, path: '/icon.svg' },
  { name: 'apple-icon', kind: 'png', viewport: DESKTOP, path: '/apple-icon' },
  { name: 'og-default', kind: 'png', viewport: DESKTOP, path: '/opengraph-image' },
  {
    name: 'og-product-available',
    kind: 'png',
    viewport: DESKTOP,
    path: '/products/hoang-hon-01/opengraph-image',
  },
  {
    name: 'og-product-sold-out',
    kind: 'png',
    viewport: DESKTOP,
    path: '/products/am-ban/opengraph-image',
  },
  { name: 'not-found-desktop', kind: 'png', viewport: DESKTOP, path: '/does-not-exist' },
  {
    name: 'not-found-mobile',
    kind: 'png',
    viewport: MOBILE,
    path: '/does-not-exist',
    mobile: true,
  },
];

export default scenarios;
