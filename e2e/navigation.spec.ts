import { expect, test } from '@playwright/test';

test('header navigates to about and contact', async ({ page }) => {
  await page.goto('/vi');
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });

  await nav.getByRole('link', { name: 'Giới thiệu' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Giới thiệu' })).toBeVisible();

  await nav.getByRole('link', { name: 'Liên hệ' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Liên hệ' })).toBeVisible();
});

test('policy pages render', async ({ page }) => {
  for (const slug of ['privacy', 'returns']) {
    const response = await page.goto(`/vi/policy/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  }
});

test('unknown policy returns 404', async ({ page }) => {
  const response = await page.goto('/vi/policy/anything');
  expect(response?.status()).toBe(404);
});

test('skip link reaches main', async ({ page }) => {
  await page.goto('/vi/about');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Chuyển đến nội dung' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press('Enter');
  const main = page.locator('main#main');
  await expect(main).toBeFocused();

  const headerBox = await page.getByRole('banner').boundingBox();
  const mainBox = await main.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(mainBox).not.toBeNull();
  expect(mainBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
});

test('header stays visible after scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/vi');
  await page.mouse.wheel(0, 2000);
  await expect.poll(async () => (await page.getByRole('banner').boundingBox())?.y).toBe(0);
});

test('unknown route returns 404 with the not-found page', async ({ page }) => {
  const response = await page.goto('/vi/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' })).toBeVisible();
});
