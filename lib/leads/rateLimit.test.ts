import { describe, expect, it } from 'vitest';

import { clientKey, createMemoryLimiter, RATE_LIMIT } from '@/lib/leads/rateLimit';

describe('createMemoryLimiter', () => {
  it('allows five submissions, refuses the sixth, and leaves other keys alone', async () => {
    const limit = createMemoryLimiter(() => 1_000);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(await limit('1.1.1.1')).toEqual({ ok: true });
    }
    expect(await limit('1.1.1.1')).toEqual({ ok: false });
    expect(await limit('2.2.2.2')).toEqual({ ok: true });
  });

  it('frees the window after ten minutes', async () => {
    let now = 0;
    const limit = createMemoryLimiter(() => now);
    for (let attempt = 0; attempt < 5; attempt += 1) await limit('ip');
    expect(await limit('ip')).toEqual({ ok: false });
    now = RATE_LIMIT.windowMs;
    expect(await limit('ip')).toEqual({ ok: true });
  });
});

describe('clientKey', () => {
  it('uses the first x-forwarded-for hop', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
  });

  it('falls back to x-real-ip, then a shared bucket', () => {
    expect(clientKey(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientKey(new Headers())).toBe('anonymous');
  });
});
