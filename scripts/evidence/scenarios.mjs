// P9a evidence: the HTML lead emails rendered in Chromium at phone width. Generate the files first
// with `EMAIL_PREVIEW=1 pnpm vitest run lib/leads/emailPreview` (sample data, no real lead).
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PHONE = { width: 390, height: 844 };

const email = (name) => ({
  name: `email-${name}`,
  kind: 'png',
  viewport: PHONE,
  path: '/',
  fullPage: true,
  async run({ page }) {
    await page.goto(pathToFileURL(resolve('.superpowers/email-preview', `${name}.html`)).href);
  },
});

/** @type {import('./capture.mjs').Scenario[]} */
const scenarios = [email('owner-vi'), email('customer-vi'), email('customer-en')];

export default scenarios;
