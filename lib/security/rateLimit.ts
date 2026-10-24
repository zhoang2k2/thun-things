import 'server-only';

import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { env } from '@/lib/env';
import { hasUpstash, leadSinkMode } from '@/lib/leads/readiness';

// Shared rate limiting for public endpoints (lead forms, quiz). Upstash when configured;
// otherwise an in-memory window (development, tests, and e2e runs, which never touch Upstash).

export interface RateLimitResult {
  ok: boolean;
}

export type Limiter = (key: string) => Promise<RateLimitResult>;

export interface RateLimitConfig {
  max: number;
  windowMs: number;
  /** Upstash duration matching `windowMs`, e.g. '10 m'. */
  window: Duration;
  /** Redis key prefix, e.g. 'thun-things:quiz'. */
  prefix: string;
  /** Log label, e.g. 'leads'. */
  label: string;
}

export const createMemoryLimiter = (
  { max, windowMs }: Pick<RateLimitConfig, 'max' | 'windowMs'>,
  now: () => number = Date.now,
): Limiter => {
  const hits = new Map<string, number[]>();
  return async (key) => {
    const current = now();
    const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return { ok: false };
    }
    hits.set(key, [...recent, current]);
    return { ok: true };
  };
};

const createUpstashLimiter = (config: RateLimitConfig, url: string, token: string): Limiter => {
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(config.max, config.window),
    prefix: config.prefix,
  });
  return async (key) => {
    try {
      const { success } = await ratelimit.limit(key);
      return { ok: success };
    } catch (error) {
      // An Upstash outage must not block real visitors.
      console.error(
        `[${config.label}] rate limit unavailable:`,
        error instanceof Error ? error.name : error,
      );
      return { ok: true };
    }
  };
};

/** Lazily picks Upstash or the in-memory window on first use. */
export const createRateLimiter = (config: RateLimitConfig): Limiter => {
  let limiter: Limiter | undefined;
  return (key) => {
    if (!limiter) {
      const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
      limiter =
        leadSinkMode() === 'email' && hasUpstash() && url && token
          ? createUpstashLimiter(config, url, token)
          : createMemoryLimiter(config);
    }
    return limiter(key);
  };
};

// Relies on Vercel overwriting x-forwarded-for / x-real-ip; spoofable when self-hosted.
/** First hop of x-forwarded-for (set by Vercel), else x-real-ip, else a shared bucket. */
export const clientKey = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'anonymous';
};
