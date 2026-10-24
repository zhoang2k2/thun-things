import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { ConsentSettings } from '@/components/consent/ConsentSettings';
import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { CONSENT_KEY, readConsent } from '@/lib/analytics/consent';
import { resetConsentStoreForTests } from '@/lib/analytics/consentStore';
import en from '@/messages/en.json';
import { messages as vi_ } from '@/test/renderWithIntl';
import { renderWithClientIntl } from '@/test/renderWithIntl';

// jsdom has no <dialog> modal API.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

beforeEach(() => {
  window.localStorage.clear();
  resetConsentStoreForTests();
});

const ui = (
  <ConsentProvider>
    <CookieSettingsButton />
    <ConsentBanner />
    <ConsentSettings />
  </ConsentProvider>
);

const { consent } = vi_;

describe('ConsentBanner', () => {
  it('shows without a decision, with accept, reject and customize', () => {
    renderWithClientIntl(ui);
    const banner = screen.getByRole('region', { name: consent.label });
    expect(banner).toHaveTextContent(consent.message);
    expect(within(banner).getByRole('link', { name: consent.policyLink })).toHaveAttribute(
      'href',
      '/vi/policy/privacy',
    );
    const buttons = within(banner)
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(buttons).toEqual([consent.accept, consent.reject, consent.customize]);
  });

  it('does not steal focus on load', () => {
    renderWithClientIntl(ui);
    expect(document.body).toHaveFocus();
  });

  it('stays hidden when a decision exists', () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: 1, analytics: false, decidedAt: '2026-10-24T00:00:00.000Z' }),
    );
    renderWithClientIntl(ui);
    expect(screen.queryByRole('region', { name: consent.label })).not.toBeInTheDocument();
  });

  it('accept stores analytics: true and hides the bar', async () => {
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: consent.accept }));
    expect(readConsent()?.analytics).toBe(true);
    expect(screen.queryByRole('region', { name: consent.label })).not.toBeInTheDocument();
  });

  it('reject stores analytics: false and hides the bar', async () => {
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: consent.reject }));
    expect(readConsent()?.analytics).toBe(false);
    expect(screen.queryByRole('region', { name: consent.label })).not.toBeInTheDocument();
  });

  it('keeps the choice for the session when storage is unavailable', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: consent.accept }));
    expect(screen.queryByRole('region', { name: consent.label })).not.toBeInTheDocument();
    setItem.mockRestore();
  });

  it('renders English copy', () => {
    renderWithClientIntl(ui, { locale: 'en' });
    expect(screen.getByRole('region', { name: en.consent.label })).toHaveTextContent(
      en.consent.message,
    );
  });
});

describe('ConsentSettings', () => {
  it('opens from customize, saves the analytics choice and closes', async () => {
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: consent.customize }));
    const dialog = screen.getByRole('dialog', { name: consent.settingsTitle });
    const analytics = within(dialog).getByRole('checkbox', { name: consent.analyticsTitle });
    expect(analytics).not.toBeChecked();
    expect(within(dialog).getByText(consent.alwaysOn)).toBeInTheDocument();
    await userEvent.click(analytics);
    await userEvent.click(within(dialog).getByRole('button', { name: consent.save }));
    expect(readConsent()?.analytics).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: consent.label })).not.toBeInTheDocument();
  });

  it('opens from the footer button with the current choice, and cancel keeps it', async () => {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: 1, analytics: true, decidedAt: '2026-10-24T00:00:00.000Z' }),
    );
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: vi_.footer.cookieSettings }));
    const dialog = screen.getByRole('dialog', { name: consent.settingsTitle });
    expect(within(dialog).getByRole('checkbox', { name: consent.analyticsTitle })).toBeChecked();
    await userEvent.click(within(dialog).getByRole('button', { name: consent.cancel }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(readConsent()?.analytics).toBe(true);
  });

  it('closes on Escape (native cancel event)', async () => {
    renderWithClientIntl(ui);
    await userEvent.click(screen.getByRole('button', { name: consent.customize }));
    const dialog = screen.getByRole('dialog', { name: consent.settingsTitle });
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
