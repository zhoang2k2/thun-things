export type ProviderName = 'gemini' | 'anthropic';

export interface GenerateInput {
  system: string;
  prompt: string;
  maxOutputTokens: number;
  signal: AbortSignal;
}

/** One LLM behind the quiz rationale. `generate` rejects on any failure or empty answer. */
export interface AiProvider {
  name: ProviderName;
  model: string;
  generate(input: GenerateInput): Promise<string>;
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
}
