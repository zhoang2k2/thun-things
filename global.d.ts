import type { Locale, Messages } from '@/i18n/messages';

// Types `useTranslations` / `getTranslations` keys and locales from `messages/vi.json`.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
