import type { BadgeTone } from '@/components/ui/Badge';
import { copy } from '@/content/copy/vi';
import type { ProductStatus } from '@/lib/catalog/schema';

export type ContactPurpose = 'order' | 'notify';

export interface StatusPresentation {
  label: string;
  tone: BadgeTone;
  /** Absent for sold-out products: the card shows the badge only (V-16). */
  action?: { label: string; purpose: ContactPurpose };
}

const { status: statusCopy, actions } = copy.product;

const PRESENTATION: Record<ProductStatus, StatusPresentation> = {
  available: {
    label: statusCopy.available,
    tone: 'neutral',
    action: { label: actions.order, purpose: 'order' },
  },
  limited: {
    label: statusCopy.limited,
    tone: 'accent',
    action: { label: actions.order, purpose: 'order' },
  },
  preorder: {
    label: statusCopy.preorder,
    tone: 'accent',
    action: { label: actions.preorder, purpose: 'order' },
  },
  coming_soon: {
    label: statusCopy.coming_soon,
    tone: 'neutral',
    action: { label: actions.askFirst, purpose: 'notify' },
  },
  sold_out: { label: statusCopy.sold_out, tone: 'muted' },
};

export const presentStatus = (status: ProductStatus): StatusPresentation => PRESENTATION[status];

export const contactHref = (slug: string, purpose: ContactPurpose): string =>
  `/contact?${new URLSearchParams({ product: slug, purpose })}`;
