import { describe, expect, it } from 'vitest';

import { productionConfigProblems } from './check-production-config.mjs';

const COMPLETE = {
  VERCEL_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: 'https://thun-things.vercel.app',
  RESEND_API_KEY: 're_secret_value',
  LEADS_TO_EMAIL: 'owner@example.com',
  UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'token_secret_value',
  NEXT_PUBLIC_GA_ID: 'G-ABC123',
};

describe('productionConfigProblems', () => {
  it('passes a complete production configuration', () => {
    expect(productionConfigProblems(COMPLETE)).toEqual([]);
  });

  it('never enforces outside Vercel production (local, CI, previews)', () => {
    expect(productionConfigProblems({})).toEqual([]);
    expect(productionConfigProblems({ VERCEL_ENV: 'preview' })).toEqual([]);
  });

  it('names each missing or blank required variable', () => {
    const problems = productionConfigProblems({
      ...COMPLETE,
      RESEND_API_KEY: '',
      UPSTASH_REDIS_REST_TOKEN: undefined,
    });
    expect(problems).toEqual(['RESEND_API_KEY is missing', 'UPSTASH_REDIS_REST_TOKEN is missing']);
  });

  it('requires an https site URL', () => {
    expect(
      productionConfigProblems({ ...COMPLETE, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }),
    ).toEqual(['NEXT_PUBLIC_SITE_URL must be an https URL']);
  });

  it('requires an AI key when AI is enabled', () => {
    expect(productionConfigProblems({ ...COMPLETE, AI_ENABLED: 'true' })).toEqual([
      'AI_ENABLED=true needs GEMINI_API_KEY or ANTHROPIC_API_KEY',
    ]);
    expect(
      productionConfigProblems({ ...COMPLETE, AI_ENABLED: 'true', GEMINI_API_KEY: 'k' }),
    ).toEqual([]);
  });

  it('never repeats a value', () => {
    const problems = productionConfigProblems({
      ...COMPLETE,
      NEXT_PUBLIC_SITE_URL: 'http://leaky.example',
      LEADS_TO_EMAIL: '',
    });
    const output = problems.join('\n');
    expect(output).not.toContain('leaky');
    expect(output).not.toContain('secret_value');
  });
});
