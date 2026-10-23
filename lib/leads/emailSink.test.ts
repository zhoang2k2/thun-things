import { describe, expect, it, vi } from 'vitest';

import { getProductBySlug } from '@/lib/catalog';
import { canSendCustomerConfirmation } from '@/lib/leads/readiness';
import { createEmailSink, type EmailMessage, type SendEmail } from '@/lib/leads/emailSink';
import { LeadDeliveryError, type Lead } from '@/lib/leads/types';

const product = getProductBySlug('hoang-hon-01')!;

const LEAD: Lead = {
  kind: 'contact',
  purpose: 'order',
  email: 'khach@example.com',
  phone: '+84912345678',
  name: 'Lan',
  size: 'M',
  quantity: 2,
  productId: product.id,
  productSlug: product.slug,
  locale: 'vi',
  consent: true,
  createdAt: '2026-10-23T08:00:00.000Z',
};

const setup = (fromEmail: string, send?: SendEmail) => {
  const sent: EmailMessage[] = [];
  const sendMock = vi.fn<SendEmail>(
    send ??
      (async (message) => {
        sent.push(message);
        return { error: null };
      }),
  );
  const sink = createEmailSink({
    send: sendMock,
    to: 'owner@example.com',
    from: fromEmail,
    siteUrl: 'https://thun.example',
    sendConfirmation: canSendCustomerConfirmation(fromEmail),
    findProduct: getProductBySlug,
  });
  return { sink, sent, sendMock };
};

describe('emailSink', () => {
  it('emails the owner with purpose, product and contact details', async () => {
    const { sink, sent } = setup('onboarding@resend.dev');
    await sink.deliver(LEAD);
    expect(sent).toHaveLength(1);
    const [owner] = sent;
    expect(owner.to).toEqual(['owner@example.com']);
    expect(owner.from).toBe('Thun Things <onboarding@resend.dev>');
    expect(owner.replyTo).toBe('khach@example.com');
    expect(owner.subject).toBe(`[Thun Things] Đặt mua — ${product.name.vi}`);
    expect(owner.text).toContain('Đặt mua');
    expect(owner.text).toContain(product.name.vi);
    expect(owner.text).toContain('https://thun.example/products/hoang-hon-01');
    expect(owner.text).toContain('+84912345678');
    expect(owner.text).toContain('Số lượng: 2');
  });

  it('skips the customer confirmation for a resend.dev sender', async () => {
    const { sink, sent } = setup('onboarding@resend.dev');
    await sink.deliver(LEAD);
    expect(sent.map((message) => message.to[0])).toEqual(['owner@example.com']);
  });

  it('sends the confirmation from an own-domain sender', async () => {
    const { sink, sent } = setup('hello@thunthings.vn');
    await sink.deliver(LEAD);
    expect(sent.map((message) => message.to[0])).toEqual([
      'owner@example.com',
      'khach@example.com',
    ]);
    expect(sent[1].subject).toBe('Thun Things đã nhận yêu cầu của bạn');
  });

  it('skips the confirmation when the customer gave no email', async () => {
    const { sink, sent } = setup('hello@thunthings.vn');
    await sink.deliver({ ...LEAD, email: undefined });
    expect(sent).toHaveLength(1);
    expect(sent[0].replyTo).toBeUndefined();
  });

  it('throws a delivery error without lead data when the owner email fails', async () => {
    const { sink } = setup('onboarding@resend.dev', async () => ({
      error: { name: 'validation_error', message: 'khach@example.com is invalid' },
    }));
    const failure = await sink.deliver(LEAD).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(LeadDeliveryError);
    const { message } = failure as LeadDeliveryError;
    expect(message).toContain('validation_error');
    expect(message).not.toContain('khach@example.com');
    expect(message).not.toContain('912345678');
  });

  it('does not fail the lead when only the confirmation fails', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    let call = 0;
    const { sink } = setup('hello@thunthings.vn', async () => {
      call += 1;
      return { error: call === 2 ? { name: 'rate_limit_exceeded', message: 'x' } : null };
    });
    await expect(sink.deliver(LEAD)).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledWith('[leads] confirmation failed:', 'rate_limit_exceeded');
    errorLog.mockRestore();
  });
});
