import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import type { AiProvider, ProviderConfig } from '@/lib/ai/providers/types';

/** Claude through `@anthropic-ai/sdk`. No SDK retries: the explain chain owns time and fallback. */
export const createAnthropicProvider = ({ apiKey, model }: ProviderConfig): AiProvider => {
  let client: Anthropic | undefined;
  return {
    name: 'anthropic',
    model,
    async generate({ system, prompt, maxOutputTokens, signal }) {
      client ??= new Anthropic({ apiKey, maxRetries: 0 });
      const message = await client.messages.create(
        {
          model,
          max_tokens: maxOutputTokens,
          system,
          messages: [{ role: 'user', content: prompt }],
        },
        { signal },
      );
      const text = message.content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('');
      if (!text) throw new Error('empty response');
      return text;
    },
  };
};
