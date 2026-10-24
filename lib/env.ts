import 'server-only';
import { z } from 'zod';

// Every variable is optional or defaulted so a missing value never crashes
// dev, build, or CI; features that need a missing value stay disabled.
// Contract: docs/configuration-variables.md and .env.example.

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema.optional());
// prefault (not default) so the fallback still runs through transforms.
const withDefault = <T extends z.ZodType>(schema: T, fallback: z.input<T>) =>
  z.preprocess(blankToUndefined, schema.prefault(fallback as never));

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: withDefault(z.url(), 'http://localhost:3000'),
  RESEND_API_KEY: optional(z.string()),
  LEADS_TO_EMAIL: optional(z.email()),
  LEADS_FROM_EMAIL: withDefault(z.email(), 'onboarding@resend.dev'),
  UPSTASH_REDIS_REST_URL: optional(z.url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string()),
  NEXT_PUBLIC_GA_ID: optional(z.string().regex(/^G-[A-Z0-9]+$/, 'must look like G-XXXXXXX')),
  GEMINI_API_KEY: optional(z.string()),
  GEMINI_MODEL: withDefault(z.string(), 'gemini-3.1-flash-lite'),
  ANTHROPIC_API_KEY: optional(z.string()),
  ANTHROPIC_MODEL: withDefault(z.string(), 'claude-haiku-5-5'),
  AI_ENABLED: withDefault(
    z.enum(['true', 'false']).transform((value) => value === 'true'),
    'false',
  ),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  return result.data;
}

export const env: Env = parseEnv(process.env);
