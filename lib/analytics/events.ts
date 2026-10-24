import type { Locale } from '@/i18n/routing';
import { currentConsent } from '@/lib/analytics/consentStore';
import type { ProductStatus } from '@/lib/catalog/schema';
import type { LeadPurpose } from '@/lib/leads/purposes';

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
}

/** Sends a GA4 event; a no-op unless analytics consent is granted and the Google tag is loaded. */
export const trackEvent = <K extends keyof AnalyticsEvent>(name: K, params: AnalyticsEvent[K]) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!currentConsent()?.analytics) return;
  window.gtag('event', name, params);
};
