import { beforeEach, describe, expect, it, vi } from 'vitest';

const ai = vi.hoisted(() => ({ explain: vi.fn() }));
vi.mock('@/lib/ai/explain', () => ({ explain: ai.explain }));

const { POST } = await import('@/app/api/quiz/explain/route');
const { EXPLAIN_RATE_LIMIT } = await import('@/lib/ai/rateLimit');
const { getAllSlugs, getQuizOptions } = await import('@/lib/catalog');

let ip = 0;
const call = (body: unknown, key = `203.0.113.${(ip += 1)}`) =>
  POST(
    new Request('http://localhost/api/quiz/explain', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': key },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const { colors, vibes } = getQuizOptions();
const VALID = { locale: 'vi', color: colors[0]!.id, vibe: vibes[0]!, slug: getAllSlugs()[0]! };

beforeEach(() => {
  ai.explain.mockReset();
});

describe('POST /api/quiz/explain', () => {
  it('returns the rationale and provider without caching the response', async () => {
    ai.explain.mockResolvedValue({ text: 'Hợp với bạn.', provider: 'gemini' });
    const response = await call(VALID);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ text: 'Hợp với bạn.', provider: 'gemini' });
    expect(ai.explain).toHaveBeenCalledWith(VALID);
  });

  it('accepts a request without a vibe', async () => {
    ai.explain.mockResolvedValue(null);
    expect((await call({ ...VALID, vibe: undefined })).status).toBe(204);
  });

  it('answers 204 with no body when there is no rationale', async () => {
    ai.explain.mockResolvedValue(null);
    const response = await call(VALID);
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('answers 204, not 500, when the chain throws, and never echoes the error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    ai.explain.mockRejectedValue(new Error('secret-key-in-message'));
    const response = await call(VALID);
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it.each([
    ['an unknown product', { ...VALID, slug: 'missing' }],
    ['an unknown colour', { ...VALID, color: 'plaid' }],
    ['an unknown vibe', { ...VALID, vibe: 'gothic' }],
    ['extra keys', { ...VALID, note: 'free text' }],
    ['a missing product', { locale: 'vi', color: VALID.color }],
    ['non-JSON', 'not json'],
    ['an oversized body', { ...VALID, pad: 'x'.repeat(2_000) }],
  ])('rejects %s with 400 and does not call the model', async (_name, body) => {
    const response = await call(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid request payload',
      code: 'VALIDATION_ERROR',
    });
    expect(ai.explain).not.toHaveBeenCalled();
  });

  it(`answers 429 after ${EXPLAIN_RATE_LIMIT.max} requests from one client`, async () => {
    ai.explain.mockResolvedValue(null);
    const key = '203.0.113.250';
    for (let index = 0; index < EXPLAIN_RATE_LIMIT.max; index += 1) {
      expect((await call(VALID, key)).status).toBe(204);
    }
    const limited = await call(VALID, key);
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: 'Too many requests', code: 'RATE_LIMITED' });
    expect(ai.explain).toHaveBeenCalledTimes(EXPLAIN_RATE_LIMIT.max);
  });
});
