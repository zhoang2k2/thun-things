import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import { pickClientMessages, pickFormMessages } from '@/i18n/clientMessages';
import type { Locale } from '@/i18n/routing';
import en from '@/messages/en.json';
import messages from '@/messages/vi.json';

export { messages };

interface IntlRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * `client` provides only the messages every page sends to the browser (`pickClientMessages`)
   * and `form` only those of the nested form provider (`pickFormMessages`), so tests of Client
   * Components fail when a key they need is not sent. Defaults to every message.
   */
  scope?: 'all' | 'client' | 'form';
  /** Defaults to `vi`. */
  locale?: Locale;
}

const scoped = (bundle: typeof messages) => ({
  all: bundle,
  client: pickClientMessages(bundle),
  form: pickFormMessages(bundle),
});

const SCOPED_MESSAGES = { vi: scoped(messages), en: scoped(en) };

const providerFor = (scope: IntlRenderOptions['scope'], locale: Locale) => {
  const IntlProvider = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider
      locale={locale}
      timeZone="Asia/Ho_Chi_Minh"
      messages={SCOPED_MESSAGES[locale][scope ?? 'all']}
    >
      {children}
    </NextIntlClientProvider>
  );
  return IntlProvider;
};

/** Renders UI inside the next-intl provider, with the Vietnamese messages unless `locale` says otherwise. */
export const renderWithIntl = (
  ui: ReactElement,
  { scope, locale = 'vi', ...options }: IntlRenderOptions = {},
) => render(ui, { wrapper: providerFor(scope, locale), ...options });

/** Same, with only the browser's messages: for Client Components and what they render. */
export const renderWithClientIntl = (
  ui: ReactElement,
  options: Omit<IntlRenderOptions, 'scope'> = {},
) => renderWithIntl(ui, { ...options, scope: 'client' });

/** Same, with only the nested form provider's messages: for the contact and notify-me forms. */
export const renderWithFormIntl = (
  ui: ReactElement,
  options: Omit<IntlRenderOptions, 'scope'> = {},
) => renderWithIntl(ui, { ...options, scope: 'form' });
