import type { Product } from '@/lib/catalog/schema';
import { customerEmail, ownerEmail } from '@/lib/leads/templates';
import { LeadDeliveryError, type Lead, type LeadSink } from '@/lib/leads/types';

export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
}

/** Matches the Resend SDK: failures come back as `error`, not as exceptions. */
export type SendEmail = (
  message: EmailMessage,
) => Promise<{ error: { name: string; message: string } | null }>;

export interface EmailSinkOptions {
  send: SendEmail;
  to: string;
  from: string;
  siteUrl: string;
  sendConfirmation: boolean;
  findProduct: (slug: string) => Product | undefined;
}

const SENDER_NAME = 'Thun Things';

export const createEmailSink = (options: EmailSinkOptions): LeadSink => ({
  async deliver(lead: Lead) {
    const { send, to, siteUrl, findProduct } = options;
    const from = `${SENDER_NAME} <${options.from}>`;
    const product = lead.productSlug ? findProduct(lead.productSlug) : undefined;

    const owner = await send({
      from,
      to: [to],
      replyTo: lead.email,
      ...ownerEmail(lead, product, siteUrl),
    });
    if (owner.error) throw new LeadDeliveryError(owner.error.name);

    if (!options.sendConfirmation || !lead.email) return;
    const customer = await send({
      from,
      to: [lead.email],
      ...customerEmail(lead, product, siteUrl),
    });
    // The owner already has the lead; a failed confirmation must not fail the submission.
    if (customer.error) {
      console.error('[leads] confirmation failed:', customer.error.name);
    }
  },
});
