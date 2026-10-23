import 'server-only';

import { type Locale, routing } from '@/i18n/routing';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

export type { Locale };
export const DEFAULT_LOCALE: Locale = routing.defaultLocale;

/** Shape of every message bundle; `messages/vi.json` is the reference. */
export type Messages = typeof vi;

const MESSAGES: Record<Locale, Messages> = { vi, en };

/**
 * Messages for code outside React (email templates, `llms.txt`, OG images, JSON-LD, metadata
 * helpers). Components use next-intl's `useTranslations` / `getTranslations` instead.
 */
export const getMessagesFor = (locale: Locale): Messages => MESSAGES[locale];
