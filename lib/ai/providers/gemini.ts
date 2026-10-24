import 'server-only';

import { GoogleGenAI, ThinkingLevel } from '@google/genai';

import type { AiProvider, ProviderConfig } from '@/lib/ai/providers/types';

// 2.x models take a thinking budget (0 = off); 3.x models take a thinking level.
const thinkingConfig = (model: string) =>
  model.startsWith('gemini-2') ? { thinkingBudget: 0 } : { thinkingLevel: ThinkingLevel.MINIMAL };

/** Gemini through `@google/genai`. No SDK retries: the explain chain owns time and fallback. */
export const createGeminiProvider = ({ apiKey, model }: ProviderConfig): AiProvider => {
  let client: GoogleGenAI | undefined;
  return {
    name: 'gemini',
    model,
    async generate({ system, prompt, maxOutputTokens, signal }) {
      client ??= new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 } } });
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          maxOutputTokens,
          temperature: 0.7,
          abortSignal: signal,
          thinkingConfig: thinkingConfig(model),
        },
      });
      const text = response.text;
      if (!text) throw new Error('empty response');
      return text;
    },
  };
};
