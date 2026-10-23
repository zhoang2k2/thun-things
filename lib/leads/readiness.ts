import 'server-only';

import { env } from '@/lib/env';

// Decides whether the lead forms can accept submissions. Owner-facing values come from
// `@/lib/env`; the deployment markers and the test-only sink flag are read here on purpose so
// they never become part of the owner contract (.env.example, docs/configuration-variables.md).

export interface ReadinessInput {
  resendApiKey?: string;
  leadsToEmail?: string;
  upstashUrl?: string;
  upstashToken?: string;
  nodeEnv?: string;
  vercelEnv?: string;
  /** Test-only: Playwright sets `E2E_LEADS_SINK=memory` so forms work without sending email. */
  e2eSink?: string;
}

export type FormReadiness = { enabled: true } | { enabled: false; reason: 'email' | 'ratelimit' };

export type LeadSinkMode = 'email' | 'memory';

const currentInput = (): ReadinessInput => ({
  resendApiKey: env.RESEND_API_KEY,
  leadsToEmail: env.LEADS_TO_EMAIL,
  upstashUrl: env.UPSTASH_REDIS_REST_URL,
  upstashToken: env.UPSTASH_REDIS_REST_TOKEN,
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  e2eSink: process.env.E2E_LEADS_SINK,
});

/** Without a verified domain Resend only delivers to the account owner, so confirmations wait for P9. */
export const canSendCustomerConfirmation = (fromEmail: string = env.LEADS_FROM_EMAIL): boolean =>
  fromEmail !== '' && !fromEmail.toLowerCase().endsWith('@resend.dev');

/** The in-memory sink is refused on Vercel production so a stray flag can never swallow leads. */
export const leadSinkMode = (input: ReadinessInput = currentInput()): LeadSinkMode =>
  input.e2eSink === 'memory' && input.vercelEnv !== 'production' ? 'memory' : 'email';

export const hasUpstash = (input: ReadinessInput = currentInput()): boolean =>
  Boolean(input.upstashUrl && input.upstashToken);

export const getFormReadiness = (input: ReadinessInput = currentInput()): FormReadiness => {
  const mode = leadSinkMode(input);
  if (mode === 'email' && !(input.resendApiKey && input.leadsToEmail)) {
    return { enabled: false, reason: 'email' };
  }
  // Production needs the shared limiter; the in-memory one only protects a single instance.
  if (mode === 'email' && input.nodeEnv === 'production' && !hasUpstash(input)) {
    return { enabled: false, reason: 'ratelimit' };
  }
  return { enabled: true };
};
