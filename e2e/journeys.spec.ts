import { expect, type Locator, type Page, test } from '@playwright/test';

// End-to-end journeys (P4 spec section 6). Leads go to the memory sink (playwright.config.ts).
// The in-memory rate limit (5 per client per 10 minutes) is keyed by the first x-forwarded-for
// hop, so each submitting journey sends its own documentation-range address and never shares a
// bucket with the other specs.

const tiles = (page: Page) => page.locator('.ProductTile');

const isFocused = (locator: Locator) =>
  locator.evaluate((element) => element === document.activeElement).catch(() => false);

/** Presses Tab until `target` has focus; fails if it is not reached within `limit` presses. */
const tabTo = async (page: Page, target: Locator, limit = 60) => {
  for (let presses = 0; presses < limit; presses += 1) {
    if (await isFocused(target)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
};

test.describe('keyboard-only path', () => {
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.61' } });

  test('skip link, header, grid card, product, Contact, submit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await tiles(page).first().waitFor();

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Chuyển đến nội dung' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Tab');
    const focusedInHeader = await page
      .getByRole('banner')
      .evaluate((header) => header.contains(document.activeElement));
    expect(focusedInHeader).toBe(true);

    const tileLink = tiles(page).first().locator('.ProductTile__link');
    await tabTo(page, tileLink);
    const card = tiles(page).first().getByTestId('product-hover-card');
    await expect(card).toBeVisible();

    const href = await tileLink.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const orderLink = page.locator('.ProductInfo').getByRole('link', { name: 'Đặt mua' });
    await tabTo(page, orderLink);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/contact\?product=[a-z0-9-]+&purpose=order$/);
    await expect(page.getByRole('radio', { name: 'Đặt mua' })).toBeChecked();

    await tabTo(page, page.getByLabel('Email'));
    await page.keyboard.type('khach@example.com');
    await tabTo(page, page.getByLabel('Số điện thoại / Zalo'));
    await page.keyboard.type('0912 345 678');
    const consent = page.getByRole('checkbox', { name: /chính sách bảo mật/ });
    await tabTo(page, consent);
    await page.keyboard.press('Space');
    await expect(consent).toBeChecked();
    await tabTo(page, page.locator('form.ContactForm').getByRole('button', { name: 'Gửi' }));
    await page.keyboard.press('Enter');

    const success = page.getByRole('status');
    await expect(success).toContainText('Đã nhận yêu cầu');
    await expect(success).toBeFocused();
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero does not autoplay or animate its progress', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.HeroSlideshow');
    const current = hero.locator('.HeroSlideshow__bar[aria-current="true"]');
    await expect(current).toHaveCount(1);
    const label = await current.getAttribute('aria-label');
    await expect(hero.locator('.animate-hero-progress')).toHaveCount(0);

    await page.waitForTimeout(6000);
    await expect(current).toHaveAttribute('aria-label', label!);
    await expect(hero.locator('.animate-hero-progress')).toHaveCount(0);
  });

  test('the hover card opens without the circle reveal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await tiles(page).nth(5).hover();
    const card = tiles(page).nth(5).getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    // Sampled while the card is opening and after it settles.
    for (let sample = 0; sample < 3; sample += 1) {
      const clipPath = await card.evaluate((element) => getComputedStyle(element).clipPath);
      expect(clipPath).toBe('none');
      await page.waitForTimeout(150);
    }
  });
});

test.describe('buying-path smoke', () => {
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': '192.0.2.62' } });

  test('Home, product, "Đặt mua", prefilled Contact, success', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const tile = tiles(page).first();
    await tile.hover();
    const card = tile.getByTestId('product-hover-card');
    await expect(card).toBeVisible();
    const name = (await card.locator('.ProductHoverCard__name').textContent())!;
    await card.locator('.ProductHoverCard__image').click();

    await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await page.locator('.ProductInfo').getByRole('link', { name: 'Đặt mua' }).click();

    await expect(page).toHaveURL(/\/contact\?product=[a-z0-9-]+&purpose=order$/);
    await expect(page.getByRole('region', { name: 'Sản phẩm' })).toContainText(name);
    await expect(page.getByRole('radio', { name: 'Đặt mua' })).toBeChecked();

    await page.getByLabel('Email').fill('khach@example.com');
    await page.getByLabel('Số điện thoại / Zalo').fill('0912 345 678');
    await page.getByRole('checkbox', { name: /chính sách bảo mật/ }).check();
    await page.locator('form.ContactForm').getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByRole('status')).toContainText('Đã nhận yêu cầu');
  });
});
