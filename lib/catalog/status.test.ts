import { describe, expect, it } from 'vitest';

import { formatPriceVND } from '@/lib/catalog/format';
import { contactHref, presentStatus } from '@/lib/catalog/status';
import { product } from '@/messages/vi.json';

describe('presentStatus', () => {
  it.each([
    ['available', 'Còn hàng', 'neutral', { label: 'Liên hệ đặt hàng', purpose: 'order' }],
    ['sold_out', 'Hết hàng', 'muted', { label: 'Liên hệ đặt trước', purpose: 'preorder' }],
  ] as const)('%s → %s', (status, label, tone, action) => {
    const presentation = presentStatus(status);
    expect(presentation.tone).toBe(tone);
    expect(product.status[status]).toBe(label);
    expect(
      presentation.action && {
        label: product.actions[presentation.action.labelKey],
        purpose: presentation.action.purpose,
      },
    ).toEqual(action);
  });
});

it('offers the pre-order discount only on sold-out designs', () => {
  expect(presentStatus('sold_out').preorderOffer).toBe(true);
  expect(presentStatus('available').preorderOffer).toBeUndefined();
  expect(product.preorderOffer).toBe('Giảm đến 10% khi đặt trước');
});

it('builds the contact fallback link', () => {
  expect(contactHref('hoang-hon-01', 'order')).toBe('/contact?product=hoang-hon-01&purpose=order');
});

it('formats VND prices', () => {
  expect(formatPriceVND(350000)).toMatch(/^350\.000\s₫$/);
});
