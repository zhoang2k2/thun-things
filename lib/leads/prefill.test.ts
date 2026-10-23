import { describe, expect, it } from 'vitest';

import { resolveContactPrefill } from '@/lib/leads/prefill';

describe('resolveContactPrefill', () => {
  it('prefills a known product and defaults the purpose to order', () => {
    const prefill = resolveContactPrefill({ product: 'hoang-hon-01' });
    expect(prefill.product?.slug).toBe('hoang-hon-01');
    expect(prefill.purpose).toBe('order');
  });

  it('keeps an explicit purpose', () => {
    expect(resolveContactPrefill({ product: 'am-ban', purpose: 'notify' }).purpose).toBe('notify');
  });

  it('ignores an unknown product and falls back to other', () => {
    expect(resolveContactPrefill({ product: 'nope' })).toEqual({
      product: undefined,
      purpose: 'other',
    });
    expect(resolveContactPrefill({})).toEqual({ product: undefined, purpose: 'other' });
  });

  it('ignores an unknown purpose and takes the first of repeated params', () => {
    expect(resolveContactPrefill({ product: 'am-ban', purpose: 'spam' }).purpose).toBe('order');
    expect(resolveContactPrefill({ product: ['am-ban', 'nope'] }).product?.slug).toBe('am-ban');
  });
});
