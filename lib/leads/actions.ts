'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { z } from 'zod';

import { DEFAULT_LOCALE } from '@/i18n/messages';
import { localizedPath } from '@/i18n/routing';
import { getProductBySlug } from '@/lib/catalog';
import type { Product } from '@/lib/catalog/schema';
import { type FormMessageKey, type FormState, HONEYPOT_FIELD } from '@/lib/leads/formState';
import { checkRateLimit, clientKey } from '@/lib/leads/rateLimit';
import { getFormReadiness } from '@/lib/leads/readiness';
import { contactFormSchema, notifyFormSchema, toFieldErrors } from '@/lib/leads/schema';
import { getLeadSink } from '@/lib/leads/sink';
import { LeadDeliveryError, type Lead } from '@/lib/leads/types';

// Order: readiness → honeypot → validation → rate limit → delivery. Validation runs before the
// rate limit so fixing typos never uses up a visitor's five submissions; invalid input costs
// nothing because nothing is sent.

const readValues = (formData: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && key !== HONEYPOT_FIELD && !key.startsWith('$ACTION')) {
      values[key] = value;
    }
  }
  return values;
};

interface SubmissionSpec<Schema extends z.ZodType> {
  formData: FormData;
  schema: Schema;
  toLead: (
    form: z.output<Schema>,
    base: Pick<Lead, 'locale' | 'consent' | 'createdAt'>,
  ) => Lead | FormMessageKey;
}

const handleSubmission = async <Schema extends z.ZodType>({
  formData,
  schema,
  toLead,
}: SubmissionSpec<Schema>): Promise<FormState> => {
  if (!getFormReadiness().enabled) return { status: 'disabled', message: 'forms.disabled' };

  const values = readValues(formData);
  // Bots get the same success as people, so they learn nothing.
  if (String(formData.get(HONEYPOT_FIELD) ?? '').trim()) return { status: 'success' };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { ok } = await checkRateLimit(clientKey(await headers()));
  if (!ok) return { status: 'error', message: 'forms.rateLimited', values };

  const lead = toLead(parsed.data, {
    locale: 'vi',
    consent: true,
    createdAt: new Date().toISOString(),
  });
  if (typeof lead === 'string') return { status: 'error', message: lead, values };

  try {
    await getLeadSink().deliver(lead);
  } catch (error) {
    const reason = error instanceof LeadDeliveryError ? error.reason : 'unexpected';
    console.error('[leads] delivery failed:', reason);
    return { status: 'error', message: 'forms.deliveryFailed', values };
  }
  return { status: 'success' };
};

// Without JavaScript the browser posts the form natively and, under Cache Components, the page
// cannot be re-rendered in place, so those submissions get a 303 to a static result page.
// Router-driven submissions carry the `next-action` header and keep the in-place state.
const respond = async (state: FormState): Promise<FormState> => {
  if ((await headers()).has('next-action')) return state;
  // Vietnamese result pages until forms carry the locale (P5 Task 5).
  const result = state.status === 'success' ? '/contact/sent' : '/contact/retry';
  redirect(localizedPath(DEFAULT_LOCALE, result));
};

const productFields = (product: Product | undefined) =>
  product ? { productId: product.id, productSlug: product.slug } : {};

export async function submitContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const state = await handleSubmission({
    formData,
    schema: contactFormSchema,
    toLead: ({ productSlug, ...form }, base) => ({
      ...base,
      ...form,
      kind: 'contact',
      // Unknown products are ignored; the message still reaches the owner.
      ...productFields(productSlug ? getProductBySlug(productSlug) : undefined),
    }),
  });
  return respond(state);
}

export async function submitNotify(_previous: FormState, formData: FormData): Promise<FormState> {
  const state = await handleSubmission({
    formData,
    schema: notifyFormSchema,
    toLead: ({ productSlug, email, phone }, base) => {
      const product = getProductBySlug(productSlug);
      if (!product) return 'forms.unknownProduct';
      return {
        ...base,
        kind: 'notify',
        purpose: 'notify',
        email,
        phone,
        ...productFields(product),
      };
    },
  });
  return respond(state);
}
