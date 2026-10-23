import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import { pickClientMessages, pickFormMessages } from '@/i18n/clientMessages';
import messages from '@/messages/vi.json';

export { messages };

interface IntlRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * `client` provides only the messages every page sends to the browser (`pickClientMessages`)
   * and `form` only those of the nested form provider (`pickFormMessages`), so tests of Client
   * Components fail when a key they need is not sent. Defaults to every message.
   */
  scope?: 'all' | 'client' | 'form';
}

const SCOPED_MESSAGES = {
  all: messages,
  client: pickClientMessages(messages),
  form: pickFormMessages(messages),
};

const providerFor = (scope: IntlRenderOptions['scope']) => {
  const IntlProvider = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider
      locale="vi"
      timeZone="Asia/Ho_Chi_Minh"
      messages={SCOPED_MESSAGES[scope ?? 'all']}
    >
      {children}
    </NextIntlClientProvider>
  );
  return IntlProvider;
};

/** Renders UI inside the next-intl provider with the Vietnamese messages. */
export const renderWithIntl = (ui: ReactElement, { scope, ...options }: IntlRenderOptions = {}) =>
  render(ui, { wrapper: providerFor(scope), ...options });

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
