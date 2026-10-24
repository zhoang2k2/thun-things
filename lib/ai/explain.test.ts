import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { explain, providersFromEnv, DEADLINE_MS } = await import('@/lib/ai/explain');
const { createMemoryCache } = await import('@/lib/ai/cache');
type AiProvider = import('@/lib/ai/providers/types').AiProvider;

const INPUT = { locale: 'vi' as const, color: 'sunset', slug: 'hoang-hon-01' };
const GOOD = 'Màu cam ấm hợp với lựa chọn của bạn.';

const fake = (
  name: AiProvider['name'],
  behaviour: (signal: AbortSignal) => Promise<string>,
): AiProvider & { calls: number; budgets: number[] } => {
  const provider = {
    name,
    model: `${name}-model`,
    calls: 0,
    budgets: [] as number[],
    generate: vi.fn(async ({ signal }: { signal: AbortSignal }) => {
      provider.calls += 1;
      return behaviour(signal);
    }),
  };
  return provider;
};

const hang = (signal: AbortSignal) =>
  new Promise<string>((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  });

const run = (providers: AiProvider[], cache = createMemoryCache()) =>
  explain(INPUT, { providers, cache });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('explain', () => {
  it('uses Gemini when it answers', async () => {
    const gemini = fake('gemini', async () => GOOD);
    const anthropic = fake('anthropic', async () => 'unused.');
    expect(await run([gemini, anthropic])).toEqual({ text: GOOD, provider: 'gemini' });
    expect(anthropic.calls).toBe(0);
  });

  it('falls back to Anthropic when Gemini throws', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const gemini = fake('gemini', async () => {
      throw new Error('quota');
    });
    const anthropic = fake('anthropic', async () => GOOD);
    expect(await run([gemini, anthropic])).toEqual({ text: GOOD, provider: 'anthropic' });
  });

  it('falls back when Gemini returns invalid output', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const gemini = fake('gemini', async () => 'Xem https://example.com nhé.');
    const anthropic = fake('anthropic', async () => GOOD);
    expect(await run([gemini, anthropic])).toEqual({ text: GOOD, provider: 'anthropic' });
  });

  it('cuts a hanging Gemini short so Anthropic still has time, within the deadline', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const gemini = fake('gemini', hang);
    const anthropic = fake(
      'anthropic',
      (signal) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => resolve(GOOD), 1_000);
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('aborted'));
          });
        }),
    );
    const pending = run([gemini, anthropic]);
    await vi.advanceTimersByTimeAsync(DEADLINE_MS);
    expect(await pending).toEqual({ text: GOOD, provider: 'anthropic' });
  });

  it('gives up at the deadline even if a provider ignores the signal', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const never = () => new Promise<string>(() => {});
    const pending = run([fake('gemini', never), fake('anthropic', never)]);
    await vi.advanceTimersByTimeAsync(DEADLINE_MS);
    expect(await pending).toBeNull();
  });

  it('returns null when every provider fails, and does not cache the failure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const cache = createMemoryCache();
    const failing = fake('gemini', async () => '');
    expect(await run([failing], cache)).toBeNull();
    const working = fake('gemini', async () => GOOD);
    expect(await run([working], cache)).toEqual({ text: GOOD, provider: 'gemini' });
  });

  it('serves a cached answer without calling providers', async () => {
    const cache = createMemoryCache();
    await run([fake('gemini', async () => GOOD)], cache);
    const second = fake('gemini', async () => 'Khác.');
    expect(await run([second], cache)).toEqual({ text: GOOD, provider: 'gemini' });
    expect(second.calls).toBe(0);
  });

  it('returns null without providers or for an unknown product', async () => {
    expect(await run([])).toBeNull();
    const gemini = fake('gemini', async () => GOOD);
    expect(
      await explain(
        { ...INPUT, slug: 'missing' },
        { providers: [gemini], cache: createMemoryCache() },
      ),
    ).toBeNull();
    expect(gemini.calls).toBe(0);
  });

  it('never logs the prompt or the output', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await run([fake('gemini', async () => 'Một. Hai. Ba.')]);
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/Một|Hoàng Hôn|hoang-hon/);
    expect(warn).toHaveBeenCalledWith('[ai] gemini invalid');
  });
});

describe('providersFromEnv', () => {
  const base = { AI_ENABLED: true, GEMINI_MODEL: 'g', ANTHROPIC_MODEL: 'a' };

  it('orders Gemini before Anthropic and skips missing keys', () => {
    const names = (config: Parameters<typeof providersFromEnv>[0]) =>
      providersFromEnv(config).map((provider) => `${provider.name}:${provider.model}`);
    expect(names({ ...base, GEMINI_API_KEY: 'x', ANTHROPIC_API_KEY: 'y' })).toEqual([
      'gemini:g',
      'anthropic:a',
    ]);
    expect(names({ ...base, ANTHROPIC_API_KEY: 'y' })).toEqual(['anthropic:a']);
    expect(names({ ...base, GEMINI_API_KEY: 'x' })).toEqual(['gemini:g']);
    expect(names(base)).toEqual([]);
  });

  it('is empty when AI is off', () => {
    expect(
      providersFromEnv({ ...base, AI_ENABLED: false, GEMINI_API_KEY: 'x', ANTHROPIC_API_KEY: 'y' }),
    ).toEqual([]);
  });
});
