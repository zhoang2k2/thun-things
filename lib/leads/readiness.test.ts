import { describe, expect, it } from 'vitest';

import {
  canSendCustomerConfirmation,
  getFormReadiness,
  leadSinkMode,
  type ReadinessInput,
} from '@/lib/leads/readiness';

const EMAIL_READY: ReadinessInput = { resendApiKey: 're_test', leadsToEmail: 'owner@example.com' };
const UPSTASH: ReadinessInput = { upstashUrl: 'https://redis.example.com', upstashToken: 'token' };

describe('canSendCustomerConfirmation', () => {
  it('stays off for an empty or resend.dev sender', () => {
    expect(canSendCustomerConfirmation('')).toBe(false);
    expect(canSendCustomerConfirmation('onboarding@resend.dev')).toBe(false);
    expect(canSendCustomerConfirmation('Hello@Resend.dev')).toBe(false);
  });

  it('turns on for an own-domain sender', () => {
    expect(canSendCustomerConfirmation('hello@thunthings.vn')).toBe(true);
  });
});

describe('leadSinkMode', () => {
  it('defaults to email', () => {
    expect(leadSinkMode({})).toBe('email');
  });

  it('uses memory only when the test flag is set outside production', () => {
    expect(leadSinkMode({ e2eSink: 'memory' })).toBe('memory');
    expect(leadSinkMode({ e2eSink: 'memory', vercelEnv: 'preview' })).toBe('memory');
    expect(leadSinkMode({ e2eSink: 'memory', vercelEnv: 'production' })).toBe('email');
  });
});

describe('getFormReadiness', () => {
  it('is disabled without the Resend key or inbox', () => {
    expect(getFormReadiness({})).toEqual({ enabled: false, reason: 'email' });
    expect(getFormReadiness({ resendApiKey: 're_test' })).toEqual({
      enabled: false,
      reason: 'email',
    });
    expect(getFormReadiness({ leadsToEmail: 'owner@example.com' })).toEqual({
      enabled: false,
      reason: 'email',
    });
  });

  it('needs Upstash in production only', () => {
    expect(getFormReadiness({ ...EMAIL_READY, nodeEnv: 'development' })).toEqual({
      enabled: true,
    });
    expect(getFormReadiness({ ...EMAIL_READY, nodeEnv: 'production' })).toEqual({
      enabled: false,
      reason: 'ratelimit',
    });
    expect(getFormReadiness({ ...EMAIL_READY, ...UPSTASH, nodeEnv: 'production' })).toEqual({
      enabled: true,
    });
  });

  it('is enabled in memory mode without any email or Upstash configuration', () => {
    expect(getFormReadiness({ e2eSink: 'memory', nodeEnv: 'production' })).toEqual({
      enabled: true,
    });
  });

  it('ignores the memory flag on Vercel production', () => {
    expect(
      getFormReadiness({ e2eSink: 'memory', nodeEnv: 'production', vercelEnv: 'production' }),
    ).toEqual({ enabled: false, reason: 'email' });
  });
});
