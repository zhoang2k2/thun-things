import { describe, it, expect } from 'vitest';
import { env } from './env';

describe('Environment Module', () => {
  it('provides safe default values for local development and testing', () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(env.RATE_LIMIT_REQUESTS_PER_MINUTE).toBeGreaterThan(0);
    expect(env.NEXT_PUBLIC_SITE_URL).toBeDefined();
  });

  it('keeps third-party integration keys optional during bootstrap', () => {
    expect(typeof env.ANTHROPIC_MODEL).toBe('string');
  });
});
