import { locale as rootLocale } from 'next/root-params';
import { getRequestConfig } from 'next-intl/server';

import { getMessagesFor } from '@/i18n/messages';
import { isLocale, routing } from '@/i18n/routing';

// The locale is the `[locale]` root param (`next/root-params`), known while prerendering, so
// pages stay static. An explicit override (`getTranslations({ locale })`) wins. Anything that is
// not a routing locale (routes outside `[locale]`, such as the global 404) falls back to `vi`.
export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await rootLocale());
  const locale = isLocale(candidate) ? candidate : routing.defaultLocale;
  return {
    locale,
    messages: getMessagesFor(locale),
    timeZone: 'Asia/Ho_Chi_Minh',
  };
});
