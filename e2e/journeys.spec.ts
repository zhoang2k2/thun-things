import { expect, type Locator, type Page, test } from '@playwright/test';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';

for (const locale of ['vi', 'en'] as const) {
  test.describe(locale, () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': `203.0.113.${locale === 'vi' ? 40 : 41}` } });
    const messages = locale === 'vi' ? vi : en;

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
      test.use({
        extraHTTPHeaders: { 'x-forwarded-for': locale === 'vi' ? '192.0.2.61' : '192.0.2.71' },
      });

      test('skip link, header, grid card, product, Contact, submit', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${locale}`);
        await tiles(page).first().waitFor();

        await page.keyboard.press('Tab');
        const skipLink = page.getByRole('link', { name: messages.a11y.skipToContent });
        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeVisible();

        await page.keyboard.press('Tab');
        const focusedInHeader = await page
          .getByRole('banner')
          .evaluate((header) => header.contains(document.activeElement));
        expect(focusedInHeader).toBe(true);

        const tileLink = tiles(page).first().locator('.ProductTile__link');
        await tabTo(page, tileLink);
        const card = page.getByTestId('product-hover-card');
        await expect(card).toBeVisible();

        const href = await tileLink.getAttribute('href');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const orderLink = page
          .locator('.ProductInfo')
          .getByRole('link', { name: messages.product.actions.order });
        await tabTo(page, orderLink);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/contact\?product=[a-z0-9-]+&purpose=order$/);
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.order }),
        ).toBeChecked();

        await tabTo(page, page.getByLabel(messages.forms.fields.email));
        await page.keyboard.type('khach@example.com');
        await tabTo(page, page.getByLabel(messages.forms.fields.phone));
        await page.keyboard.type('0912 345 678');
        const consent = page.getByRole('checkbox', { name: messages.forms.fields.consentLink });
        await tabTo(page, consent);
        await page.keyboard.press('Space');
        await expect(consent).toBeChecked();
        await tabTo(
          page,
          page.locator('form.ContactForm').getByRole('button', { name: messages.forms.submit }),
        );
        await page.keyboard.press('Enter');

        const success = page.getByRole('status');
        await expect(success).toContainText(messages.forms.contact.successTitle);
        await expect(success).toBeFocused();
      });
    });

    test.describe('reduced motion', () => {
      test.use({ reducedMotion: 'reduce' });

      test('the hero does not autoplay or animate its progress', async ({ page }) => {
        await page.goto(`/${locale}`);
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
        await page.goto(`/${locale}`);
        await tiles(page).nth(5).hover();
        const card = page.getByTestId('product-hover-card');
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
      test.use({
        extraHTTPHeaders: { 'x-forwarded-for': locale === 'vi' ? '192.0.2.62' : '192.0.2.72' },
      });

      test('Home, product, "Liên hệ đặt hàng", prefilled Contact, success', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${locale}`);
        const tile = tiles(page).first();
        // Centre the tile so the whole card is on screen: a click that scrolls would move the pointer
        // onto another tile and open that design's card instead.
        await tile.evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await tile.hover();
        const card = page.getByTestId('product-hover-card');
        await expect(card).toBeVisible();
        const name = (await card.locator('.ProductHoverCard__name').textContent())!;
        await card.locator('.ProductHoverCard__image').click();

        await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/);
        await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
        await page
          .locator('.ProductInfo')
          .getByRole('link', { name: messages.product.actions.order })
          .click();

        await expect(page).toHaveURL(/\/contact\?product=[a-z0-9-]+&purpose=order$/);
        await expect(
          page.getByRole('region', { name: messages.forms.contact.productLabel }),
        ).toContainText(name);
        await expect(
          page.getByRole('radio', { name: messages.forms.purposes.order }),
        ).toBeChecked();

        await page.getByLabel(messages.forms.fields.email).fill('khach@example.com');
        await page.getByLabel(messages.forms.fields.phone).fill('0912 345 678');
        await page.getByRole('checkbox', { name: messages.forms.fields.consentLink }).check();
        await page
          .locator('form.ContactForm')
          .getByRole('button', { name: messages.forms.submit })
          .click();
        await expect(page.getByRole('status')).toContainText(messages.forms.contact.successTitle);
      });
    });
  });
}
