import type { Locale } from '@/i18n/routing';
import { currentConsent } from '@/lib/analytics/consentStore';
import type { ProductStatus } from '@/lib/catalog/schema';
import type { LeadPurpose } from '@/lib/leads/purposes';
import type { MatchKind } from '@/lib/recommend/score';

// GA4 events (spec section 5). Params are enums and product slugs only — never email, phone,
// name, address or free text. `product_id` is the product slug, the id people see in URLs.
export interface AnalyticsEvent {
  select_item: { product_id: string; status: ProductStatus; locale: Locale };
  hover_preview_open: { product_id: string; status: ProductStatus };
  contact_start: { purpose: LeadPurpose; form: 'contact' | 'notify'; product_id?: string };
  contact_submit: {
    purpose: LeadPurpose;
    form: 'contact' | 'notify';
    product_id?: string;
    locale: Locale;
  };
  locale_switch: { from: Locale; to: Locale };
  // Quiz (P7): answers are catalog colour ids and vibe tags, never free text.
  quiz_open: { source: 'launcher' | 'bubble' };
  quiz_step: { step: 'color' | 'vibe'; value: string };
  quiz_complete: { color: string; vibe?: string; match: MatchKind };
  quiz_result_click: { product_id: string; position: number };
  quiz_bubble_shown: { count: number };
  quiz_bubble_dismiss: Record<never, never>;
  // P8: which provider wrote the rationale; the text itself is never sent.
  quiz_rationale_shown: { provider: 'gemini' | 'anthropic'; product_id: string };
}

/** Sends a GA4 event; a no-op unless analytics consent is granted and the Google tag is loaded. */
export const trackEvent = <K extends keyof AnalyticsEvent>(name: K, params: AnalyticsEvent[K]) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!currentConsent()?.analytics) return;
  window.gtag('event', name, params);
};
