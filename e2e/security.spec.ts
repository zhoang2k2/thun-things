import { expect, type Page, test } from '@playwright/test';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';

for (const locale of ['vi', 'en'] as const) {
  test.describe(locale, () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': `203.0.113.${locale === 'vi' ? 50 : 51}` } });
    const messages = locale === 'vi' ? vi : en;

    // Production CSP is exercised: Playwright serves `next start`. The memory lead sink means the
    // contact submit emails nothing; the in-memory rate limit is shared, so submit at most once here.

    const EXPECTED_HEADERS: Record<string, string | RegExp> = {
      'content-security-policy': /default-src 'self'.*object-src 'none'; upgrade-insecure-requests/,
      'strict-transport-security': 'max-age=63072000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      'x-frame-options': 'DENY',
    };

    type Watch = { messages: string[]; violations: () => Promise<string[]> };

    const watchViolations = async (page: Page): Promise<Watch> => {
      const messages: string[] = [];
      page.on('console', (message) => {
        const text = message.text();
        if (text.includes('Content Security Policy') || text.includes('Refused to')) {
          messages.push(text);
        }
      });
      await page.addInitScript(() => {
        const store: string[] = [];
        (window as unknown as { __cspViolations: string[] }).__cspViolations = store;
        document.addEventListener('securitypolicyviolation', (event) => {
          store.push(
            `${event.violatedDirective} ${event.blockedURI} ${event.sourceFile}:${event.lineNumber}`,
          );
        });
      });
      return {
        messages,
        violations: () =>
          page.evaluate(
            () => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? [],
          ),
      };
    };

    const expectHeaders = (headers: Record<string, string>) => {
      for (const [name, expected] of Object.entries(EXPECTED_HEADERS)) {
        if (typeof expected === 'string') expect(headers[name], name).toBe(expected);
        else expect(headers[name], name).toMatch(expected);
      }
      expect(headers['content-security-policy']).not.toContain('unsafe-eval');
    };

    test.describe('security headers and CSP', () => {
      test('Home: headers, scrolling and a hover card raise no violations', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        const watch = await watchViolations(page);
        const response = await page.goto(`/${locale}`);
        expectHeaders(response!.headers());

        const tiles = page.locator('.ProductTile');
        // The grid streams in after the hero; wait for the full page of tiles first.
        await expect(tiles).toHaveCount(20);
        await tiles.last().scrollIntoViewIfNeeded();
        await tiles.nth(5).hover();
        await expect(page.getByTestId('product-hover-card')).toBeVisible();

        expect(await watch.violations()).toEqual([]);
        expect(watch.messages).toEqual([]);
      });

      test('product page: headers and no violations', async ({ page }) => {
        const watch = await watchViolations(page);
        const response = await page.goto(`/${locale}/products/hoang-hon-01`);
        expectHeaders(response!.headers());
        await expect(page.locator('.ProductInfo')).toBeVisible();

        expect(await watch.violations()).toEqual([]);
        expect(watch.messages).toEqual([]);
      });

      test('Contact: headers and a valid submit raise no violations', async ({ page }) => {
        const watch = await watchViolations(page);
        const response = await page.goto(`/${locale}/contact`);
        expectHeaders(response!.headers());

        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('0912 345 678');
        await page.getByLabel(messages.forms.fields.name).fill('Lan');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await page
          .locator('form.ContactForm')
          .getByRole('button', { name: messages.forms.submit })
          .click();
        await expect(page.getByRole('status')).toContainText(messages.forms.contact.successTitle);

        expect(await watch.violations()).toEqual([]);
        expect(watch.messages).toEqual([]);
      });
    });
  });
}
