import { expect, it } from 'vitest';

import { cn } from '@/lib/cn';

it('lets the later Tailwind class win', () => {
  expect(cn('px-2', 'px-4')).toBe('px-4');
});

it('drops falsy values', () => {
  expect(cn('a', false, undefined, null, 'c')).toBe('a c');
});
