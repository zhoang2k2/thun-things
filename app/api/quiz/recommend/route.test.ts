import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/quiz/recommend/route';
import { getQuizOptions } from '@/lib/catalog';
import { QUIZ_RATE_LIMIT } from '@/lib/recommend/rateLimit';

let ip = 0;
const call = (body: unknown, key = `198.51.100.${(ip += 1)}`) =>
  POST(
    new Request('http://localhost/api/quiz/recommend', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': key },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const { colors, vibes } = getQuizOptions();
const color = colors[0]!.id;
const vibe = vibes[0]!;

describe('POST /api/quiz/recommend', () => {
  it('returns a featured product and up to three more in the requested locale', async () => {
    const response = await call({ locale: 'en', color, vibe });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(['exact', 'color', 'vibe', 'none']).toContain(body.match);
    expect(body.featured).toEqual(
      expect.objectContaining({
        slug: expect.any(String),
        name: expect.any(String),
        priceLabel: expect.stringContaining('₫'),
        status: expect.any(String),
        image: expect.objectContaining({ width: expect.any(Number) }),
      }),
    );
    expect(body.more.length).toBeLessThanOrEqual(3);
    expect(body.more.map((item: { slug: string }) => item.slug)).not.toContain(body.featured.slug);
  });

  it('formats prices for the locale', async () => {
    const vi = await (await call({ locale: 'vi', color })).json();
    const en = await (await call({ locale: 'en', color })).json();
    expect(vi.featured.priceLabel).toMatch(/\d\.\d{3}/);
    expect(en.featured.priceLabel).toMatch(/\d,\d{3}/);
  });

  it.each([
    ['an unknown colour', { locale: 'vi', color: 'plaid' }],
    ['an unknown vibe', { locale: 'vi', color, vibe: 'gothic' }],
    ['an unknown locale', { locale: 'fr', color }],
    ['extra keys', { locale: 'vi', color, email: 'a@example.com' }],
    ['a missing colour', { locale: 'vi' }],
  ])('rejects %s with 400 and no internals', async (_name, body) => {
    const response = await call(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid request payload',
      code: 'VALIDATION_ERROR',
    });
  });

  it('rejects non-JSON and oversized bodies with 400', async () => {
    expect((await call('{not json')).status).toBe(400);
    expect((await call({ locale: 'vi', color, pad: 'x'.repeat(5_000) })).status).toBe(400);
  });

  it('rate limits a client after the allowed number of requests', async () => {
    const key = '203.0.113.99';
    for (let attempt = 0; attempt < QUIZ_RATE_LIMIT.max; attempt += 1) {
      expect((await call({ locale: 'vi', color }, key)).status).toBe(200);
    }
    const limited = await call({ locale: 'vi', color }, key);
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: 'Too many requests', code: 'RATE_LIMITED' });
  });
});
