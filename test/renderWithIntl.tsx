import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import { pickClientMessages } from '@/i18n/clientMessages';
import messages from '@/messages/vi.json';

export { messages };

interface IntlRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * `client` provides only the messages the browser receives (`pickClientMessages`), so tests
   * of Client Components fail when a key they need is not sent. Defaults to every message.
   */
  scope?: 'all' | 'client';
}

const providerFor = (scope: IntlRenderOptions['scope']) => {
  const IntlProvider = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider
      locale="vi"
      timeZone="Asia/Ho_Chi_Minh"
      messages={scope === 'client' ? pickClientMessages(messages) : messages}
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
