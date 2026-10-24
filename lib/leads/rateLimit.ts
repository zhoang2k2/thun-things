import 'server-only';

import {
  clientKey,
  createMemoryLimiter as createWindow,
  createRateLimiter,
  type RateLimitResult,
} from '@/lib/security/rateLimit';

// 5 submissions per 10 minutes per client. Production without Upstash keeps the forms disabled
// (lib/leads/readiness.ts), so the in-memory window only runs in development and tests.
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

export type { RateLimitResult };
export { clientKey };

export const createMemoryLimiter = (now: () => number = Date.now) => createWindow(RATE_LIMIT, now);

const limiter = createRateLimiter({
  ...RATE_LIMIT,
  window: '10 m',
  prefix: 'thun-things:leads',
  label: 'leads',
});

export const checkRateLimit = (key: string): Promise<RateLimitResult> => limiter(key);
