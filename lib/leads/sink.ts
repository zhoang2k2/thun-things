import 'server-only';

import { Resend } from 'resend';

import { getProductBySlug } from '@/lib/catalog';
import { env } from '@/lib/env';
import { createEmailSink } from '@/lib/leads/emailSink';
import { memorySink } from '@/lib/leads/memorySink';
import { canSendCustomerConfirmation, leadSinkMode } from '@/lib/leads/readiness';
import { LeadDeliveryError, type LeadSink } from '@/lib/leads/types';

export type { Lead, LeadSink } from '@/lib/leads/types';

let emailSink: LeadSink | undefined;

// Later sinks (Sheet, Supabase; P10) plug in here without touching the forms.
export const getLeadSink = (): LeadSink => {
  if (leadSinkMode() === 'memory') return memorySink;
  if (emailSink) return emailSink;

  const { RESEND_API_KEY: apiKey, LEADS_TO_EMAIL: to } = env;
  if (!apiKey || !to) throw new LeadDeliveryError('not_configured');

  const resend = new Resend(apiKey);
  emailSink = createEmailSink({
    send: (message) => resend.emails.send(message),
    to,
    from: env.LEADS_FROM_EMAIL,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    sendConfirmation: canSendCustomerConfirmation(),
    findProduct: getProductBySlug,
  });
  return emailSink;
};
