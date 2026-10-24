import 'server-only';

import { Redis } from '@upstash/redis';

import type { ExplainInput } from '@/lib/ai/prompt';
import type { ProviderName } from '@/lib/ai/providers/types';
import { env } from '@/lib/env';
import { hasUpstash, leadSinkMode } from '@/lib/leads/readiness';

// Rationale cache (P8, spec section 1): the same answer for the same product and model is reused
// for a week. Upstash when configured (same condition as the rate limiters), memory otherwise.

export interface CachedRationale {
  text: string;
  provider: ProviderName;
}

export interface ExplainCache {
  get(key: string): Promise<CachedRationale | null>;
  set(key: string, value: CachedRationale): Promise<void>;
}

export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MEMORY_MAX = 200;

export const cacheKey = ({ locale, color, vibe, slug }: ExplainInput, model: string) =>
  `explain:v1:${locale}:${color}:${vibe ?? '-'}:${slug}:${model}`;

export const createMemoryCache = ({
  max = MEMORY_MAX,
  now = Date.now,
}: { max?: number; now?: () => number } = {}): ExplainCache => {
  // Map keeps insertion order, so the first key is the oldest.
  const entries = new Map<string, { value: CachedRationale; expires: number }>();
  return {
    async get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expires <= now()) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key, value) {
      entries.delete(key);
      entries.set(key, { value, expires: now() + CACHE_TTL_MS });
      for (const oldest of entries.keys()) {
        if (entries.size <= max) break;
        entries.delete(oldest);
      }
    },
  };
};

const createRedisCache = (redis: Redis): ExplainCache => ({
  get: (key) => redis.get<CachedRationale>(`thun-things:${key}`),
  async set(key, value) {
    await redis.set(`thun-things:${key}`, value, { px: CACHE_TTL_MS });
  },
});

let shared: ExplainCache | undefined;

/** Lazily picks Upstash or memory on first use. */
export const defaultExplainCache = (): ExplainCache => {
  if (!shared) {
    const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
    shared =
      leadSinkMode() === 'email' && hasUpstash() && url && token
        ? createRedisCache(new Redis({ url, token }))
        : createMemoryCache();
  }
  return shared;
};
