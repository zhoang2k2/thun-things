import { describe, expect, it } from 'vitest';

import { copy } from '@/content/copy/vi';
import { contactFormSchema, notifyFormSchema, toFieldErrors } from '@/lib/leads/schema';

const { errors } = copy.forms;

const VALID_CONTACT = {
  purpose: 'order',
  email: 'khach@example.com',
  phone: '0912 345 678',
  consent: 'on',
};

const contactErrors = (input: Record<string, string>) => {
  const result = contactFormSchema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error);
};

const notifyErrors = (input: Record<string, string>) => {
  const result = notifyFormSchema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error);
};

describe('contactFormSchema', () => {
  it('accepts the required fields and normalises the phone', () => {
    const result = contactFormSchema.parse(VALID_CONTACT);
    expect(result).toEqual({
      purpose: 'order',
      email: 'khach@example.com',
      phone: '+84912345678',
      consent: true,
    });
  });

  it('requires email, phone and consent', () => {
    expect(contactErrors({ purpose: 'order' })).toEqual({
      email: errors.emailRequired,
      phone: errors.phoneRequired,
      consent: errors.consentRequired,
    });
  });

  it('reports malformed email and phone', () => {
    expect(contactErrors({ ...VALID_CONTACT, email: 'khach@', phone: '12345' })).toEqual({
      email: errors.emailInvalid,
      phone: errors.phoneInvalid,
    });
  });

  it('turns blank optional fields into undefined', () => {
    const result = contactFormSchema.parse({
      ...VALID_CONTACT,
      name: '  ',
      size: '',
      quantity: '',
      address: '',
      message: '',
      productSlug: '',
    });
    expect(result.name).toBeUndefined();
    expect(result.quantity).toBeUndefined();
    expect(result.productSlug).toBeUndefined();
  });

  it('keeps quantity between 1 and 20', () => {
    expect(contactFormSchema.parse({ ...VALID_CONTACT, quantity: '3' }).quantity).toBe(3);
    for (const quantity of ['0', '21', '1.5', 'abc']) {
      expect(contactErrors({ ...VALID_CONTACT, quantity })).toEqual({ quantity: errors.quantity });
    }
  });

  it('limits free text length', () => {
    expect(contactErrors({ ...VALID_CONTACT, message: 'x'.repeat(1001) })).toEqual({
      message: errors.tooLong,
    });
  });

  it('rejects an unknown purpose', () => {
    expect(contactErrors({ ...VALID_CONTACT, purpose: 'spam' })).toEqual({
      purpose: errors.purpose,
    });
  });
});

describe('notifyFormSchema', () => {
  it('accepts email only or phone only', () => {
    expect(
      notifyFormSchema.parse({ productSlug: 'am-ban', email: 'a@example.com', consent: 'on' }),
    ).toEqual({ productSlug: 'am-ban', email: 'a@example.com', consent: true });
    expect(
      notifyFormSchema.parse({ productSlug: 'am-ban', phone: '+84 912.345.678', consent: 'on' }),
    ).toEqual({ productSlug: 'am-ban', phone: '+84912345678', consent: true });
  });

  it('requires one of email or phone, with the error on email', () => {
    expect(notifyErrors({ productSlug: 'am-ban', email: '', phone: '', consent: 'on' })).toEqual({
      email: errors.contactRequired,
    });
  });

  it('still validates a filled field', () => {
    expect(notifyErrors({ productSlug: 'am-ban', phone: 'abc', consent: 'on' })).toEqual({
      phone: errors.phoneInvalid,
    });
  });

  it('requires consent', () => {
    expect(notifyErrors({ productSlug: 'am-ban', email: 'a@example.com' })).toEqual({
      consent: errors.consentRequired,
    });
  });
});
