import { z } from 'zod';

/**
 * Environment Schema Definition
 *
 * Rules:
 * - Server-only secrets MUST NOT be prefixed with NEXT_PUBLIC_.
 * - Client-accessible variables MUST be prefixed with NEXT_PUBLIC_.
 * - External service credentials (Anthropic, Resend, GA4, Upstash) are optional during bootstrap
 *   so local development and CI builds succeed without requiring paid resources.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Server-only: Anthropic AI integration (Phase 5)
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-7-sonnet-20250219'),

  // Server-only: Email delivery via Resend (Phase 3)
  RESEND_API_KEY: z.string().min(1).optional(),
  LEADS_TO_EMAIL: z.string().email().optional(),

  // Server-only: Rate limiting (Phase 4/5)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(60),

  // Client-safe: Analytics (Phase 3)
  NEXT_PUBLIC_GA_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Environment variable validation failed');
  }

  return parsed.data;
}

export const env = validateEnv();
