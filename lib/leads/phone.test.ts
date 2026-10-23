import { describe, expect, it } from 'vitest';

import { normalizeVietnamesePhone } from '@/lib/leads/phone';

describe('normalizeVietnamesePhone', () => {
  it.each([
    ['0912 345 678', '+84912345678'],
    ['0912345678', '+84912345678'],
    ['+84 912.345.678', '+84912345678'],
    ['84912345678', '+84912345678'],
    ['(+84) 912-345-678', '+84912345678'],
    ['0387 654 321', '+84387654321'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeVietnamesePhone(input)).toBe(expected);
  });

  it.each(['12345', 'abc', '0912 345 67a', '091234567', '09123456789', '0212345678', ''])(
    'rejects %s',
    (input) => {
      expect(normalizeVietnamesePhone(input)).toBeNull();
    },
  );
});
