import { describe, expect, it } from 'vitest';

import { formatPriceVND } from '@/lib/catalog/format';
import { contactHref, presentStatus } from '@/lib/catalog/status';
import { product } from '@/messages/vi.json';

describe('presentStatus', () => {
  it.each([
    ['available', 'Còn hàng', 'neutral', { label: 'Đặt mua', purpose: 'order' }],
    ['limited', 'Số lượng giới hạn', 'accent', { label: 'Đặt mua', purpose: 'order' }],
    ['preorder', 'Đặt trước', 'accent', { label: 'Đặt trước', purpose: 'order' }],
    ['coming_soon', 'Sắp ra mắt', 'neutral', { label: 'Hỏi trước', purpose: 'notify' }],
    ['sold_out', 'Hết hàng', 'muted', undefined],
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

it('builds the contact fallback link', () => {
  expect(contactHref('hoang-hon-01', 'order')).toBe('/contact?product=hoang-hon-01&purpose=order');
});

it('formats VND prices', () => {
  expect(formatPriceVND(350000)).toMatch(/^350\.000\s₫$/);
});
