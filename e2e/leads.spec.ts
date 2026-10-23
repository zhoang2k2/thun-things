import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

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
    await page.goto('/vi/contact');
    const form = contactForm(page);
    await form.getByRole('button', { name: 'Gửi' }).click();

    const summary = page.locator('.FormErrorSummary');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Vui lòng nhập email.');
    await expect(summary).toContainText('Vui lòng nhập số điện thoại hoặc Zalo.');
    await expect(summary).toContainText('Bạn cần đồng ý với chính sách bảo mật.');
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(await seriousViolations(page)).toEqual([]);

    await page.getByLabel('Email').fill('khach@example.com');
    await page.getByLabel('Số điện thoại / Zalo').fill('12345');
    await page.getByLabel('Tên').fill('Lan');
    await form.getByRole('button', { name: 'Gửi' }).click();
    await expect(summary).toContainText('Số điện thoại chưa đúng');
    // Values survive the failed submit.
    await expect(page.getByLabel('Email')).toHaveValue('khach@example.com');
    await expect(page.getByLabel('Tên')).toHaveValue('Lan');

    await page.getByLabel('Số điện thoại / Zalo').fill('0912 345 678');
    await page.getByRole('checkbox', { name: /chính sách bảo mật/ }).check();
    await form.getByRole('button', { name: 'Gửi' }).click();
    const success = page.getByRole('status');
    await expect(success).toContainText('Đã nhận yêu cầu');
    await expect(success).toBeFocused();
  });

  test('prefills the product from a product page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/vi/products/hoang-hon-01');
    await page.locator('.ProductInfo').getByRole('link', { name: 'Đặt mua' }).click();
    await expect(page).toHaveURL(/\/contact\?product=hoang-hon-01&purpose=order$/);

    const summary = page.getByRole('region', { name: 'Sản phẩm' });
    await expect(summary).toContainText('Hoàng Hôn 01');
    await expect(summary).toContainText('₫');
    await expect(page.getByRole('radio', { name: 'Đặt mua' })).toBeChecked();
    await expect(page.getByRole('combobox', { name: 'Size' })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/vi/contact?product=pho-cu');
    await page.getByLabel('Email').fill('khach@example.com');
    await page.getByLabel('Số điện thoại / Zalo').fill('0912345678');
    await page.getByRole('checkbox', { name: /chính sách bảo mật/ }).check();
    await contactForm(page).getByRole('button', { name: 'Gửi' }).click();
    await expect(page).toHaveURL(/\/contact\/sent$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Đã nhận yêu cầu');

    await page.goto('/vi/contact');
    await contactForm(page).getByRole('button', { name: 'Gửi' }).click();
    await expect(page).toHaveURL(/\/contact\/retry$/);
    await expect(page.getByRole('link', { name: 'Quay lại form liên hệ' })).toBeVisible();

    await page.goto('/vi/products/am-ban');
    const notify = page.locator('#notify');
    await notify.getByLabel('Email').fill('a@example.com');
    await notify.getByRole('checkbox').check();
    await notify.getByRole('button', { name: 'Báo cho tôi' }).click();
    await expect(page).toHaveURL(/\/contact\/sent$/);
    await context.close();
  });

  test('ignores an unknown product and keeps working', async ({ page }) => {
    await page.goto('/vi/contact?product=nope');
    await expect(page.getByRole('region', { name: 'Sản phẩm' })).toHaveCount(0);
    await expect(page.getByRole('radio', { name: 'Câu hỏi khác' })).toBeChecked();
    await expect(page.getByRole('textbox', { name: 'Size' })).toBeVisible();
    await expect(contactForm(page).getByRole('button', { name: 'Gửi' })).toBeEnabled();
  });
});

test.describe('notify-me form', () => {
  test('requires email or phone, then confirms inline', async ({ page }) => {
    await page.goto('/vi/products/am-ban');
    const section = page.locator('#notify');
    await expect(section.getByRole('heading', { name: 'Báo khi có hàng' })).toBeVisible();

    await section.getByRole('checkbox').check();
    await section.getByRole('button', { name: 'Báo cho tôi' }).click();
    await expect(section.locator('.FormErrorSummary')).toContainText(
      'Vui lòng nhập email hoặc số điện thoại.',
    );
    await expect(section.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');

    await section.getByLabel('Số điện thoại / Zalo').fill('+84 912.345.678');
    await section.getByRole('button', { name: 'Báo cho tôi' }).click();
    await expect(section.getByRole('status')).toContainText('Đã ghi nhận');
  });

  test('available products have no notify-me form', async ({ page }) => {
    await page.goto('/vi/products/hoang-hon-01');
    await expect(page.locator('#notify')).toHaveCount(0);
  });

  test('the mobile order bar jumps to the form', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto('/vi/products/am-ban');
    await page.locator('.ProductOrderBar').getByRole('link', { name: 'Báo khi có hàng' }).tap();
    await expect(page).toHaveURL(/#notify$/);
    await expect(page.locator('#notify').getByLabel('Email')).toBeInViewport();
    await context.close();
  });
});

test.describe('policy and about content', () => {
  test('policies render structured sections', async ({ page }) => {
    await page.goto('/vi/policy/privacy');
    await expect(page.getByRole('heading', { level: 2, name: 'Bên xử lý dữ liệu' })).toBeVisible();
    await expect(page.getByText(/Resend/)).toBeVisible();
    await page.goto('/vi/policy/returns');
    await expect(page.getByRole('heading', { level: 2, name: 'Thời hạn' })).toBeVisible();
  });

  test('about shows the text and a photo slot', async ({ page }) => {
    await page.goto('/vi/about');
    await expect(page.locator('.AboutPage__text p').first()).toBeVisible();
    await expect(page.getByRole('img', { name: 'Xưởng in của Thun Things' })).toBeVisible();
  });

  test('policies render English sections on /en', async ({ page }) => {
    await page.goto('/en/policy/privacy');
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Who processes your data' }),
    ).toBeVisible();
    await expect(page.getByText('Last updated October 23, 2026')).toBeVisible();
    await page.goto('/en/policy/returns');
    await expect(page.getByRole('heading', { level: 2, name: 'Time limit' })).toBeVisible();
    await expect(page.getByText(/\[Owner to update:/).first()).toBeVisible();
  });

  test('about renders English text and photo alt on /en', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('.AboutPage__text p').first()).toContainText(
      'Thun Things treats every T-shirt',
    );
    await expect(page.getByRole('img', { name: 'The Thun Things print studio' })).toBeVisible();
  });
});
