import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { env } from '@/lib/env';
import { hasUpstash, leadSinkMode } from '@/lib/leads/readiness';

// 5 submissions per 10 minutes per client. Upstash when configured; otherwise an in-memory
// window for development and tests (production without Upstash keeps the forms disabled).
// End-to-end runs (memory sink) never touch Upstash, even when the owner's values are present.
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

export interface RateLimitResult {
  ok: boolean;
}

type Limiter = (key: string) => Promise<RateLimitResult>;

export const createMemoryLimiter = (now: () => number = Date.now): Limiter => {
  const hits = new Map<string, number[]>();
  return async (key) => {
    const current = now();
    const recent = (hits.get(key) ?? []).filter((time) => current - time < RATE_LIMIT.windowMs);
    if (recent.length >= RATE_LIMIT.max) {
      hits.set(key, recent);
      return { ok: false };
    }
    hits.set(key, [...recent, current]);
    return { ok: true };
  };
};

const createUpstashLimiter = (url: string, token: string): Limiter => {
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT.max, '10 m'),
    prefix: 'thun-things:leads',
  });
  return async (key) => {
    try {
      const { success } = await ratelimit.limit(key);
      return { ok: success };
    } catch (error) {
      // An Upstash outage must not block real customers; the honeypot still filters bots.
      console.error('[leads] rate limit unavailable:', error instanceof Error ? error.name : error);
      return { ok: true };
    }
  };
};

let limiter: Limiter | undefined;

const getLimiter = (): Limiter => {
  if (!limiter) {
    const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
    limiter =
      leadSinkMode() === 'email' && hasUpstash() && url && token
        ? createUpstashLimiter(url, token)
        : createMemoryLimiter();
  }
  return limiter;
};

export const checkRateLimit = (key: string): Promise<RateLimitResult> => getLimiter()(key);

// Relies on Vercel overwriting x-forwarded-for / x-real-ip; spoofable when self-hosted.
/** First hop of x-forwarded-for (set by Vercel), else x-real-ip, else a shared bucket. */
export const clientKey = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'anonymous';
};
