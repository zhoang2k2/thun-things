import { describe, expect, it } from 'vitest';

import { clientKey, createMemoryLimiter } from '@/lib/security/rateLimit';

describe('createMemoryLimiter', () => {
  it('allows `max` hits per window per key', async () => {
    const limit = createMemoryLimiter({ max: 3, windowMs: 1_000 }, () => 0);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(await limit('a')).toEqual({ ok: true });
    }
    expect(await limit('a')).toEqual({ ok: false });
    expect(await limit('b')).toEqual({ ok: true });
  });

  it('frees the window after `windowMs`', async () => {
    let now = 0;
    const limit = createMemoryLimiter({ max: 1, windowMs: 1_000 }, () => now);
    await limit('a');
    expect(await limit('a')).toEqual({ ok: false });
    now = 1_000;
    expect(await limit('a')).toEqual({ ok: true });
  });
});

describe('clientKey', () => {
  it('uses the first forwarded hop, then x-real-ip, then a shared bucket', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
    expect(clientKey(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientKey(new Headers())).toBe('anonymous');
  });
});
