import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';

// The locale is fixed to Vietnamese until locale routing lands. Not reading `requestLocale`
// keeps next-intl away from request headers, so pages stay prerendered.
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: getMessagesFor(DEFAULT_LOCALE),
  timeZone: 'Asia/Ho_Chi_Minh',
}));
