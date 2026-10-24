import type { BadgeTone } from '@/components/ui/Badge';
import type { ProductStatus } from '@/lib/catalog/schema';

export type ContactPurpose = 'order' | 'notify';

/** Keys under `product.actions` in the messages. */
export type StatusActionKey = 'order' | 'preorder' | 'askFirst';

// Labels are message keys, not text: this module is also bundled for the browser (hover card),
// so it must not import the message bundles. The status label key is `product.status.<status>`.
export interface StatusPresentation {
  tone: BadgeTone;
  /** Absent for sold-out products: the card shows the badge only (V-16). */
  action?: { labelKey: StatusActionKey; purpose: ContactPurpose };
}

const PRESENTATION: Record<ProductStatus, StatusPresentation> = {
  available: { tone: 'neutral', action: { labelKey: 'order', purpose: 'order' } },
  limited: { tone: 'accent', action: { labelKey: 'order', purpose: 'order' } },
  preorder: { tone: 'accent', action: { labelKey: 'preorder', purpose: 'order' } },
  coming_soon: { tone: 'neutral', action: { labelKey: 'askFirst', purpose: 'notify' } },
  sold_out: { tone: 'muted' },
};

export const presentStatus = (status: ProductStatus): StatusPresentation => PRESENTATION[status];

export const contactHref = (slug: string, purpose: ContactPurpose): string =>
  `/contact?${new URLSearchParams({ product: slug, purpose })}`;
