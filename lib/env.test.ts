import { describe, expect, expectTypeOf, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { parseEnv } = await import('@/lib/env');

describe('parseEnv', () => {
  it('parses an empty environment', () => {
    const env = parseEnv({});
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(env.LEADS_FROM_EMAIL).toBe('onboarding@resend.dev');
    expect(env.ANTHROPIC_MODEL).toBe('claude-haiku-5-5');
    expect(env.GEMINI_MODEL).toBe('gemini-3.1-flash-lite');
    expect(env.GEMINI_API_KEY).toBeUndefined();
    expect(env.AI_ENABLED).toBe(false);
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it('exposes defaulted fields as non-optional types', () => {
    const env = parseEnv({});
    expectTypeOf(env.NEXT_PUBLIC_SITE_URL).toEqualTypeOf<string>();
    expectTypeOf(env.AI_ENABLED).toEqualTypeOf<boolean>();
    expectTypeOf(env.RESEND_API_KEY).toEqualTypeOf<string | undefined>();
  });

  it('treats empty strings as missing', () => {
    expect(parseEnv({ RESEND_API_KEY: '' }).RESEND_API_KEY).toBeUndefined();
    expect(parseEnv({ GEMINI_API_KEY: '' }).GEMINI_API_KEY).toBeUndefined();
    expect(parseEnv({ GEMINI_MODEL: '' }).GEMINI_MODEL).toBe('gemini-3.1-flash-lite');
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: '' }).NEXT_PUBLIC_SITE_URL).toBe(
      'http://localhost:3000',
    );
  });

  it('parses the AI flag', () => {
    expect(parseEnv({ AI_ENABLED: 'true' }).AI_ENABLED).toBe(true);
    expect(parseEnv({ AI_ENABLED: 'false' }).AI_ENABLED).toBe(false);
  });

  it('rejects a malformed site url', () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: 'not-a-url' })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('rejects a non-boolean AI flag', () => {
    expect(() => parseEnv({ AI_ENABLED: 'yes' })).toThrow(/AI_ENABLED/);
  });

  it('rejects a malformed GA id', () => {
    expect(() => parseEnv({ NEXT_PUBLIC_GA_ID: '123' })).toThrow(/NEXT_PUBLIC_GA_ID/);
  });

  it('names every invalid key in one error', () => {
    expect(() => parseEnv({ LEADS_TO_EMAIL: 'nope', UPSTASH_REDIS_REST_URL: 'nope' })).toThrow(
      /LEADS_TO_EMAIL.*UPSTASH_REDIS_REST_URL/,
    );
  });
});
