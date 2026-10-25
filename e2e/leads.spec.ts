import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';

for (const locale of ['vi', 'en'] as const) {
  test.describe(locale, () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': `203.0.113.${locale === 'vi' ? 60 : 61}` } });
    const messages = locale === 'vi' ? vi : en;

    // Runs against the memory lead sink (playwright.config.ts): nothing is emailed.

    const seriousViolations = async (page: Page) => {
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      return violations
        .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
        .map((violation) => `${violation.id}: ${violation.help}`);
    };

    const contactForm = (page: Page) => page.locator('form.ContactForm');

    test.describe('contact form', () => {
      test('shows errors, then confirms a valid order', async ({ page }) => {
        await page.goto(`/${locale}/contact`);
        const form = contactForm(page);
        await form.getByRole('button', { name: messages.forms.submit }).click();

        const summary = page.locator('.FormErrorSummary');
        await expect(summary).toBeFocused();
        await expect(summary).toContainText(messages.forms.errors.emailRequired);
        await expect(summary).toContainText(messages.forms.errors.phoneRequired);
        await expect(summary).toContainText(messages.forms.errors.consentRequired);
        await expect(page.getByLabel(messages.forms.fields.email)).toHaveAttribute(
          'aria-invalid',
          'true',
        );
        expect(await seriousViolations(page)).toEqual([]);

        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('12345');
        await page.getByLabel(messages.forms.fields.name).fill('Lan');
        await form.getByRole('button', { name: messages.forms.submit }).click();
        await expect(summary).toContainText(messages.forms.errors.phoneInvalid);
        // Values survive the failed submit.
        await expect(page.getByLabel(messages.forms.fields.email)).toHaveValue('khach@example.com');
        await expect(page.getByLabel(messages.forms.fields.name)).toHaveValue('Lan');

        await page.getByLabel(messages.forms.fields.phone).fill('0912 345 678');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await form.getByRole('button', { name: messages.forms.submit }).click();
        const success = page.getByRole('status');
        await expect(success).toContainText(messages.forms.contact.successTitle);
        await expect(success).toBeFocused();
      });

      test('prefills the product from a product page', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${locale}/products/hoang-hon-01`);
        await page
          .locator('.ProductInfo')
          .getByRole('link', { name: messages.product.actions.order })
          .click();
        await expect(page).toHaveURL(/\/contact\?product=hoang-hon-01&purpose=order$/);

        const summary = page.getByRole('region', { name: messages.forms.contact.productLabel });
        await expect(summary).toContainText(locale === 'vi' ? 'Hoàng Hôn 01' : 'Sunset 01');
        await expect(summary).toContainText('₫');
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.order }),
        ).toBeChecked();
        await expect(
          page.getByRole('combobox', { name: messages.forms.fields.size }),
        ).toBeVisible();
        expect(await seriousViolations(page)).toEqual([]);
      });

      test('works without JavaScript', async ({ browser }) => {
        const context = await browser.newContext({
          extraHTTPHeaders: { 'x-forwarded-for': `198.51.100.${locale === 'vi' ? 60 : 61}` },
          javaScriptEnabled: false,
        });
        const page = await context.newPage();
        await page.goto(`/${locale}/contact?product=pho-cu`);
        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('0912345678');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await contactForm(page).getByRole('button', { name: messages.forms.submit }).click();
        await expect(page).toHaveURL(/\/contact\/sent$/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          messages.forms.contact.successTitle,
        );

        await page.goto(`/${locale}/contact`);
        await contactForm(page).getByRole('button', { name: messages.forms.submit }).click();
        await expect(page).toHaveURL(/\/contact\/retry$/);
        await expect(
          page.getByRole('link', { name: messages.pages.contactRetry.back }),
        ).toBeVisible();

        // A link shared before P9a2 (purpose=notify) still submits without JavaScript.
        await page.goto(`/${locale}/contact?product=am-ban&purpose=notify`);
        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('0912345678');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await contactForm(page).getByRole('button', { name: messages.forms.submit }).click();
        await expect(page).toHaveURL(/\/contact\/sent$/);
        await context.close();
      });

      test('ignores an unknown product and keeps working', async ({ page }) => {
        await page.goto(`/${locale}/contact?product=nope`);
        await expect(
          page.getByRole('region', { name: messages.forms.contact.productLabel }),
        ).toHaveCount(0);
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.other }),
        ).toBeChecked();
        await expect(page.getByRole('textbox', { name: messages.forms.fields.size })).toBeVisible();
        await expect(
          contactForm(page).getByRole('button', { name: messages.forms.submit }),
        ).toBeEnabled();
      });
    });

    test.describe('pre-order (P9a2)', () => {
      test('a sold-out design offers pre-order with up to 10% off, through Contact', async ({
        page,
      }) => {
        await page.goto(`/${locale}/products/am-ban`);
        const info = page.locator('.ProductInfo');
        await expect(info.getByText(messages.product.status.sold_out)).toBeVisible();
        await expect(info.getByText(messages.product.preorderOffer)).toBeVisible();
        await expect(page.locator('#notify')).toHaveCount(0);
        await info.getByRole('link', { name: messages.product.actions.preorder }).click();

        await expect(page).toHaveURL(/\/contact\?product=am-ban&purpose=preorder$/);
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.preorder }),
        ).toBeChecked();
        await expect(
          page.getByRole('region', { name: messages.forms.contact.productLabel }),
        ).toBeVisible();
        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('0912345678');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await contactForm(page).getByRole('button', { name: messages.forms.submit }).click();
        await expect(page.getByRole('status')).toContainText(messages.forms.contact.successTitle);
      });

      test('a link shared before P9a2 (purpose=notify) opens as a pre-order', async ({ page }) => {
        await page.goto(`/${locale}/contact?product=am-ban&purpose=notify`);
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.preorder }),
        ).toBeChecked();
      });

      test('an in-stock design is ordered without the discount line', async ({ page }) => {
        await page.goto(`/${locale}/products/hoang-hon-01`);
        const info = page.locator('.ProductInfo');
        await expect(info.getByText(messages.product.status.available)).toBeVisible();
        await expect(info.getByText(messages.product.preorderOffer)).toHaveCount(0);
        await expect(
          info.getByRole('link', { name: messages.product.actions.order }),
        ).toHaveAttribute('href', `/${locale}/contact?product=hoang-hon-01&purpose=order`);
      });

      test('the mobile order bar pre-orders a sold-out design', async ({ browser }) => {
        const context = await browser.newContext({
          extraHTTPHeaders: { 'x-forwarded-for': `198.51.100.${locale === 'vi' ? 60 : 61}` },
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          isMobile: true,
        });
        const page = await context.newPage();
        await page.goto(`/${locale}/products/am-ban`);
        await page
          .locator('.ProductOrderBar')
          .getByRole('link', { name: messages.product.actions.preorder })
          .tap();
        await expect(page).toHaveURL(/\/contact\?product=am-ban&purpose=preorder$/);
        await context.close();
      });
    });

    test.describe('policy and about content', () => {
      test('policies render structured sections', async ({ page }) => {
        await page.goto(`/${locale}/policy/privacy`);
        await expect(
          page.getByRole('heading', {
            level: 2,
            name: locale === 'vi' ? 'Bên xử lý dữ liệu' : 'Who processes your data',
          }),
        ).toBeVisible();
        await expect(page.getByText(/Resend/)).toBeVisible();
        await page.goto(`/${locale}/policy/returns`);
        await expect(
          page.getByRole('heading', {
            level: 2,
            name: locale === 'vi' ? 'Thời hạn' : 'Time limit',
          }),
        ).toBeVisible();
      });

      test('about shows the text and a photo slot', async ({ page }) => {
        await page.goto(`/${locale}/about`);
        await expect(page.locator('.AboutPage__text p').first()).toBeVisible();
        await expect(
          page.getByRole('img', {
            name: locale === 'vi' ? 'Xưởng in của Thun Things' : 'The Thun Things print studio',
          }),
        ).toBeVisible();
      });
    });
  });
}
