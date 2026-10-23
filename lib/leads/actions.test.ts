import { beforeEach, describe, expect, it, vi } from 'vitest';

import { initialFormState } from '@/lib/leads/formState';
import type { Lead } from '@/lib/leads/types';
import { LeadDeliveryError } from '@/lib/leads/types';

const mocks = vi.hoisted(() => ({
  requestHeaders: new Headers(),
  redirect: vi.fn<(path: string) => never>(),
  deliver: vi.fn<(lead: Lead) => Promise<void>>(),
  checkRateLimit: vi.fn<(key: string) => Promise<{ ok: boolean }>>(),
  getFormReadiness: vi.fn<() => { enabled: boolean; reason?: string }>(),
}));

vi.mock('next/headers', () => ({ headers: async () => mocks.requestHeaders }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/leads/sink', () => ({ getLeadSink: () => ({ deliver: mocks.deliver }) }));
vi.mock('@/lib/leads/rateLimit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  clientKey: (headers: Headers) => headers.get('x-forwarded-for') ?? 'anonymous',
}));
vi.mock('@/lib/leads/readiness', () => ({ getFormReadiness: mocks.getFormReadiness }));

const { submitContact, submitNotify } = await import('@/lib/leads/actions');

const formData = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

const VALID_CONTACT = {
  purpose: 'order',
  email: 'khach@example.com',
  phone: '0912 345 678',
  quantity: '2',
  productSlug: 'hoang-hon-01',
  consent: 'on',
};

beforeEach(() => {
  mocks.requestHeaders = new Headers({ 'x-forwarded-for': '203.0.113.7', 'next-action': 'abc' });
  mocks.redirect.mockReset().mockImplementation((path) => {
    throw new Error(`REDIRECT ${path}`);
  });
  mocks.deliver.mockReset().mockResolvedValue(undefined);
  mocks.checkRateLimit.mockReset().mockResolvedValue({ ok: true });
  mocks.getFormReadiness.mockReset().mockReturnValue({ enabled: true });
});

describe('submitContact', () => {
  it('delivers one lead with the normalised phone and product', async () => {
    const state = await submitContact(initialFormState, formData(VALID_CONTACT));
    expect(state).toEqual({ status: 'success' });
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('203.0.113.7');
    expect(mocks.deliver).toHaveBeenCalledTimes(1);
    const [lead] = mocks.deliver.mock.calls[0];
    expect(lead).toMatchObject({
      kind: 'contact',
      purpose: 'order',
      email: 'khach@example.com',
      phone: '+84912345678',
      quantity: 2,
      productSlug: 'hoang-hon-01',
      productId: expect.any(String),
      locale: 'vi',
      consent: true,
    });
  });

  it('pretends success for a filled honeypot and sends nothing', async () => {
    const state = await submitContact(
      initialFormState,
      formData({ ...VALID_CONTACT, website: 'http://spam.example' }),
    );
    expect(state).toEqual({ status: 'success' });
    expect(mocks.deliver).not.toHaveBeenCalled();
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });

  it('returns field errors and echoes the values without sending', async () => {
    const state = await submitContact(
      initialFormState,
      formData({ purpose: 'order', email: 'khach@', phone: '', name: 'Lan' }),
    );
    expect(state.status).toBe('error');
    expect(state.fieldErrors).toEqual({
      email: 'forms.errors.emailInvalid',
      phone: 'forms.errors.phoneRequired',
      consent: 'forms.errors.consentRequired',
    });
    expect(state.values).toMatchObject({ email: 'khach@', name: 'Lan' });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('refuses when rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    const state = await submitContact(initialFormState, formData(VALID_CONTACT));
    expect(state).toMatchObject({ status: 'error', message: 'forms.rateLimited' });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('refuses when the form is disabled', async () => {
    mocks.getFormReadiness.mockReturnValue({ enabled: false, reason: 'email' });
    const state = await submitContact(initialFormState, formData(VALID_CONTACT));
    expect(state).toEqual({ status: 'disabled', message: 'forms.disabled' });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('ignores an unknown product slug', async () => {
    await submitContact(initialFormState, formData({ ...VALID_CONTACT, productSlug: 'nope' }));
    const [lead] = mocks.deliver.mock.calls[0];
    expect(lead.productSlug).toBeUndefined();
    expect(lead.productId).toBeUndefined();
  });

  it('reports a delivery failure without leaking lead data to the log', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.deliver.mockRejectedValue(new LeadDeliveryError('validation_error'));
    const state = await submitContact(initialFormState, formData(VALID_CONTACT));
    expect(state).toMatchObject({ status: 'error', message: 'forms.deliveryFailed' });
    expect(errorLog).toHaveBeenCalledWith('[leads] delivery failed:', 'validation_error');
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('khach@example.com');
    errorLog.mockRestore();
  });
});

describe('submissions without JavaScript', () => {
  beforeEach(() => {
    mocks.requestHeaders = new Headers({ 'x-forwarded-for': '203.0.113.7' });
  });

  it('redirects to the static confirmation after delivery', async () => {
    await expect(submitContact(initialFormState, formData(VALID_CONTACT))).rejects.toThrow(
      'REDIRECT /vi/contact/sent',
    );
    expect(mocks.deliver).toHaveBeenCalledTimes(1);
  });

  it('redirects to the retry page on errors', async () => {
    await expect(
      submitNotify(initialFormState, formData({ productSlug: 'am-ban', consent: 'on' })),
    ).rejects.toThrow('REDIRECT /vi/contact/retry');
    expect(mocks.deliver).not.toHaveBeenCalled();
  });
});

describe('submitNotify', () => {
  it('delivers a notify lead with email only', async () => {
    const state = await submitNotify(
      initialFormState,
      formData({ productSlug: 'am-ban', email: 'a@example.com', phone: '', consent: 'on' }),
    );
    expect(state).toEqual({ status: 'success' });
    expect(mocks.deliver.mock.calls[0][0]).toMatchObject({
      kind: 'notify',
      purpose: 'notify',
      email: 'a@example.com',
      productSlug: 'am-ban',
    });
  });

  it('requires email or phone and sends nothing', async () => {
    const state = await submitNotify(
      initialFormState,
      formData({ productSlug: 'am-ban', email: '', phone: '', consent: 'on' }),
    );
    expect(state.fieldErrors).toEqual({ email: 'forms.errors.contactRequired' });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });

  it('refuses an unknown product', async () => {
    const state = await submitNotify(
      initialFormState,
      formData({ productSlug: 'nope', phone: '0912345678', consent: 'on' }),
    );
    expect(state).toMatchObject({ status: 'error', message: 'forms.unknownProduct' });
    expect(mocks.deliver).not.toHaveBeenCalled();
  });
});
