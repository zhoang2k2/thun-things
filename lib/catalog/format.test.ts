import { expect, it } from 'vitest';
import { formatPriceVND } from '@/lib/catalog/format';
it('formats VND for each locale', () => {
  expect(formatPriceVND(390000, 'vi').replaceAll('\u00a0', ' ')).toBe('390.000 ₫');
  expect(formatPriceVND(390000, 'en')).toBe('₫390,000');
});
