import type { BadgeTone } from '@/components/ui/Badge';
import type { ProductStatus } from '@/lib/catalog/schema';

export type ContactPurpose = 'order' | 'preorder';

/** Keys under `product.actions` in the messages. */
export type StatusActionKey = 'order' | 'preorder';

// Labels are message keys, not text: this module is also bundled for the browser (hover card),
// so it must not import the message bundles. The status label key is `product.status.<status>`.
export interface StatusPresentation {
  tone: BadgeTone;
  action: { labelKey: StatusActionKey; purpose: ContactPurpose };
  /** Sold out (P9a2): the "up to 10% off when you pre-order" line under the button. */
  preorderOffer?: true;
}

const PRESENTATION: Record<ProductStatus, StatusPresentation> = {
  available: { tone: 'neutral', action: { labelKey: 'order', purpose: 'order' } },
  sold_out: {
    tone: 'muted',
    action: { labelKey: 'preorder', purpose: 'preorder' },
    preorderOffer: true,
  },
};

export const presentStatus = (status: ProductStatus): StatusPresentation => PRESENTATION[status];

export const contactHref = (slug: string, purpose: ContactPurpose): string =>
  `/contact?${new URLSearchParams({ product: slug, purpose })}`;
