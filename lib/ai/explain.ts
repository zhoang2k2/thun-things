import 'server-only';

import {
  type CachedRationale,
  cacheKey,
  defaultExplainCache,
  type ExplainCache,
} from '@/lib/ai/cache';
import { checkOutput } from '@/lib/ai/output';
import { buildPrompt, type ExplainInput } from '@/lib/ai/prompt';
import { createAnthropicProvider } from '@/lib/ai/providers/anthropic';
import { createGeminiProvider } from '@/lib/ai/providers/gemini';
import type { AiProvider } from '@/lib/ai/providers/types';
import { env, type Env } from '@/lib/env';

// Quiz rationale chain (P8, spec section 1): Gemini first, Anthropic as fallback, all inside one
// deadline so the client's 4 s budget holds. Logs carry the provider and failure kind only.

export const DEADLINE_MS = 3_500;
/** A provider with a fallback behind it gets at most this, so the fallback keeps real time. */
export const FIRST_ATTEMPT_MS = 2_000;
const MAX_OUTPUT_TOKENS = 120;

type AiConfig = Pick<
  Env,
  'AI_ENABLED' | 'GEMINI_API_KEY' | 'GEMINI_MODEL' | 'ANTHROPIC_API_KEY' | 'ANTHROPIC_MODEL'
>;

/** Configured providers in fallback order; empty when AI is off or no key is set. */
export const providersFromEnv = (config: AiConfig): AiProvider[] => {
  if (!config.AI_ENABLED) return [];
  const providers: AiProvider[] = [];
  if (config.GEMINI_API_KEY) {
    providers.push(
      createGeminiProvider({ apiKey: config.GEMINI_API_KEY, model: config.GEMINI_MODEL }),
    );
  }
  if (config.ANTHROPIC_API_KEY) {
    providers.push(
      createAnthropicProvider({ apiKey: config.ANTHROPIC_API_KEY, model: config.ANTHROPIC_MODEL }),
    );
  }
  return providers;
};

let configured: AiProvider[] | undefined;

/** Resolves with the provider's text, or rejects once `ms` pass even if it ignores the signal. */
const attempt = (provider: AiProvider, prompt: { system: string; prompt: string }, ms: number) => {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, ms);
  });
  return Promise.race([
    provider.generate({ ...prompt, maxOutputTokens: MAX_OUTPUT_TOKENS, signal: controller.signal }),
    timeout,
  ]).finally(() => clearTimeout(timer));
};

/** The rationale for a quiz result, or null when AI is off, unconfigured or every provider failed. */
export const explain = async (
  input: ExplainInput,
  deps: { providers?: AiProvider[]; cache?: ExplainCache } = {},
): Promise<CachedRationale | null> => {
  const providers = deps.providers ?? (configured ??= providersFromEnv(env));
  if (providers.length === 0) return null;
  const prompt = buildPrompt(input);
  if (!prompt) return null;

  const cache = deps.cache ?? defaultExplainCache();
  const key = cacheKey(input, providers.map((provider) => provider.model).join('+'));
  const cached = await cache.get(key).catch(() => null);
  if (cached) return cached;

  const end = Date.now() + DEADLINE_MS;
  for (const [index, provider] of providers.entries()) {
    const remaining = end - Date.now();
    if (remaining <= 0) break;
    const budget = index < providers.length - 1 ? Math.min(remaining, FIRST_ATTEMPT_MS) : remaining;
    try {
      const text = checkOutput(await attempt(provider, prompt, budget));
      if (text) {
        const result = { text, provider: provider.name };
        await cache.set(key, result).catch(() => undefined);
        return result;
      }
      console.warn(`[ai] ${provider.name} invalid`);
    } catch (error) {
      const kind = error instanceof Error && error.message === 'timeout' ? 'timeout' : 'error';
      console.warn(`[ai] ${provider.name} ${kind}`);
    }
  }
  return null;
};
