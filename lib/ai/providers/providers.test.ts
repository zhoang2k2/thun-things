import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const sdk = vi.hoisted(() => ({
  generateContent: vi.fn(),
  geminiOptions: undefined as unknown,
  create: vi.fn(),
  anthropicOptions: undefined as unknown,
}));

vi.mock('@google/genai', () => ({
  ThinkingLevel: { MINIMAL: 'MINIMAL' },
  GoogleGenAI: class {
    models = { generateContent: sdk.generateContent };
    constructor(options: unknown) {
      sdk.geminiOptions = options;
    }
  },
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: sdk.create };
    constructor(options: unknown) {
      sdk.anthropicOptions = options;
    }
  },
}));

const { createGeminiProvider } = await import('@/lib/ai/providers/gemini');
const { createAnthropicProvider } = await import('@/lib/ai/providers/anthropic');

const input = (signal = new AbortController().signal) => ({
  system: 'SYSTEM',
  prompt: 'PROMPT',
  maxOutputTokens: 120,
  signal,
});

describe('Gemini provider', () => {
  it('sends the model, instruction, token cap and signal without SDK retries', async () => {
    sdk.generateContent.mockResolvedValue({ text: 'Hi.' });
    const signal = new AbortController().signal;
    const provider = createGeminiProvider({ apiKey: 'k', model: 'gemini-3.1-flash-lite' });
    expect(provider.name).toBe('gemini');
    expect(await provider.generate(input(signal))).toBe('Hi.');
    expect(sdk.geminiOptions).toMatchObject({
      apiKey: 'k',
      httpOptions: { retryOptions: { attempts: 1 } },
    });
    const call = sdk.generateContent.mock.calls[0]![0];
    expect(call).toMatchObject({
      model: 'gemini-3.1-flash-lite',
      contents: 'PROMPT',
      config: {
        systemInstruction: 'SYSTEM',
        maxOutputTokens: 120,
        abortSignal: signal,
        thinkingConfig: { thinkingLevel: 'MINIMAL' },
      },
    });
  });

  it('turns thinking off by budget on 2.x models', async () => {
    sdk.generateContent.mockResolvedValue({ text: 'Hi.' });
    await createGeminiProvider({ apiKey: 'k', model: 'gemini-2.5-flash-lite' }).generate(input());
    expect(sdk.generateContent.mock.calls.at(-1)![0].config.thinkingConfig).toEqual({
      thinkingBudget: 0,
    });
  });

  it('fails on an empty answer', async () => {
    sdk.generateContent.mockResolvedValue({ text: undefined });
    await expect(
      createGeminiProvider({ apiKey: 'k', model: 'm' }).generate(input()),
    ).rejects.toThrow();
  });
});

describe('Anthropic provider', () => {
  it('sends the model, system, token cap and signal without SDK retries', async () => {
    sdk.create.mockResolvedValue({
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'there.' },
      ],
    });
    const signal = new AbortController().signal;
    const provider = createAnthropicProvider({ apiKey: 'k', model: 'claude-haiku-5-5' });
    expect(provider.name).toBe('anthropic');
    expect(await provider.generate(input(signal))).toBe('Hello there.');
    expect(sdk.anthropicOptions).toMatchObject({ apiKey: 'k', maxRetries: 0 });
    expect(sdk.create).toHaveBeenCalledWith(
      {
        model: 'claude-haiku-5-5',
        max_tokens: 120,
        system: 'SYSTEM',
        messages: [{ role: 'user', content: 'PROMPT' }],
      },
      { signal },
    );
  });

  it('fails on an empty answer', async () => {
    sdk.create.mockResolvedValue({ content: [] });
    await expect(
      createAnthropicProvider({ apiKey: 'k', model: 'm' }).generate(input()),
    ).rejects.toThrow();
  });
});
