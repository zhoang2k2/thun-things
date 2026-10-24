import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { cacheKey, createMemoryCache, CACHE_TTL_MS } = await import('@/lib/ai/cache');

const VALUE = { text: 'A good fit.', provider: 'gemini' as const };

describe('explain cache', () => {
  it('keys on locale, colour, vibe, slug and model', () => {
    const base = { locale: 'vi' as const, color: 'black', vibe: 'art', slug: 'a' };
    const key = cacheKey(base, 'gemini-3.1-flash-lite');
    expect(key).toBe('explain:v1:vi:black:art:a:gemini-3.1-flash-lite');
    expect(cacheKey({ ...base, vibe: undefined }, 'm')).toBe('explain:v1:vi:black:-:a:m');
    expect(cacheKey(base, 'other-model')).not.toBe(key);
  });

  it('returns stored values until they expire', async () => {
    let now = 0;
    const cache = createMemoryCache({ now: () => now });
    await cache.set('k', VALUE);
    expect(await cache.get('k')).toEqual(VALUE);
    now = CACHE_TTL_MS + 1;
    expect(await cache.get('k')).toBeNull();
  });

  it('evicts the oldest entry beyond its size', async () => {
    const cache = createMemoryCache({ max: 2 });
    await cache.set('a', VALUE);
    await cache.set('b', VALUE);
    await cache.set('c', VALUE);
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('c')).toEqual(VALUE);
  });
});
