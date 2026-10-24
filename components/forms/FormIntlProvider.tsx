import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import type { ReactNode } from 'react';

import { pickFormMessages } from '@/i18n/clientMessages';

/**
 * Sends the form copy to the browser only where a form renders. Its messages replace the page
 * provider's for everything inside, so only forms belong in it.
 */
export const FormIntlProvider = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale={useLocale()} messages={pickFormMessages(useMessages())}>
    {children}
  </NextIntlClientProvider>
);
