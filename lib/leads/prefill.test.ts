import { describe, expect, it } from 'vitest';

import { resolveContactPrefill } from '@/lib/leads/prefill';

describe('resolveContactPrefill', () => {
  it('prefills a known product and defaults the purpose to order', () => {
    const prefill = resolveContactPrefill({ product: 'hoang-hon-01' });
    expect(prefill.product?.slug).toBe('hoang-hon-01');
    expect(prefill.purpose).toBe('order');
  });

  it('keeps an explicit purpose', () => {
    expect(resolveContactPrefill({ product: 'am-ban', purpose: 'preorder' }).purpose).toBe(
      'preorder',
    );
    expect(resolveContactPrefill({ product: 'am-ban', purpose: 'other' }).purpose).toBe('other');
  });

  it('opens old notify-me links as pre-orders (P9a2)', () => {
    expect(resolveContactPrefill({ product: 'am-ban', purpose: 'notify' }).purpose).toBe(
      'preorder',
    );
  });

  it('defaults a sold-out product to pre-order', () => {
    expect(resolveContactPrefill({ product: 'am-ban' }).purpose).toBe('preorder');
  });

  it('ignores an unknown product and falls back to other', () => {
    expect(resolveContactPrefill({ product: 'nope' })).toEqual({
      product: undefined,
      purpose: 'other',
    });
    expect(resolveContactPrefill({})).toEqual({ product: undefined, purpose: 'other' });
  });

  it('ignores an unknown purpose and takes the first of repeated params', () => {
    expect(resolveContactPrefill({ product: 'hoang-hon-01', purpose: 'spam' }).purpose).toBe(
      'order',
    );
    expect(resolveContactPrefill({ product: ['am-ban', 'nope'] }).product?.slug).toBe('am-ban');
  });
});
