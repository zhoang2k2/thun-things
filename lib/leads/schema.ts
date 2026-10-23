import { z } from 'zod';

import { copy } from '@/content/copy/vi';
import { normalizeVietnamesePhone } from '@/lib/leads/phone';
import { LEAD_PURPOSES } from '@/lib/leads/purposes';

// Form schemas for the lead server functions. Inputs come from FormData, so every field
// arrives as a string or is missing; blank optional fields become undefined.

// Zod's JIT probe calls `Function("")`, which a CSP without 'unsafe-eval' reports as a violation
// even though the throw is caught. No client component imports this module any more (client code
// takes `LEAD_PURPOSES` from the zod-free `purposes` module), so this is defence in depth in case
// a future client import brings the schema back into the browser.
z.config({ jitless: true });

const { errors } = copy.forms;

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const toOptionalText = (value: unknown): string | undefined => toText(value) || undefined;

const optionalText = (max: number) =>
  z.preprocess(toOptionalText, z.string().max(max, errors.tooLong).optional());

const requiredEmail = z.preprocess(
  toText,
  z.email({ error: (issue) => (issue.input ? errors.emailInvalid : errors.emailRequired) }),
);

const optionalEmail = z.preprocess(toOptionalText, z.email(errors.emailInvalid).optional());

const phoneValue = z.string().transform((value, context) => {
  const phone = normalizeVietnamesePhone(value);
  if (phone) return phone;
  context.addIssue({ code: 'custom', message: errors.phoneInvalid });
  return z.NEVER;
});

const requiredPhone = z.preprocess(
  toText,
  z.string().min(1, errors.phoneRequired).max(30, errors.phoneInvalid).pipe(phoneValue),
);

const optionalPhone = z.preprocess(
  toOptionalText,
  z.string().max(30, errors.phoneInvalid).pipe(phoneValue).optional(),
);

const consent = z.preprocess(
  toText,
  z.enum(['on', 'true'], { error: errors.consentRequired }).transform(() => true as const),
);

const quantity = z.preprocess(
  toOptionalText,
  z.coerce
    .number({ error: errors.quantity })
    .int(errors.quantity)
    .min(1, errors.quantity)
    .max(20, errors.quantity)
    .optional(),
);

export const contactFormSchema = z.object({
  purpose: z.preprocess(toText, z.enum(LEAD_PURPOSES, { error: errors.purpose })),
  email: requiredEmail,
  phone: requiredPhone,
  name: optionalText(80),
  size: optionalText(10),
  quantity,
  address: optionalText(300),
  message: optionalText(1000),
  productSlug: optionalText(80),
  consent,
});

export const notifyFormSchema = z
  .object({
    productSlug: z.preprocess(toText, z.string().min(1, copy.forms.unknownProduct).max(80)),
    email: optionalEmail,
    phone: optionalPhone,
    consent,
  })
  .superRefine((form, context) => {
    if (form.email || form.phone) return;
    context.addIssue({ code: 'custom', path: ['email'], message: errors.contactRequired });
  });

export type ContactForm = z.output<typeof contactFormSchema>;
export type NotifyForm = z.output<typeof notifyFormSchema>;

/** First message per top-level field, keyed by the form field name. */
export const toFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
};
