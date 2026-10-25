'use client';

import { useLocale } from 'next-intl';
import { type FocusEvent, type FormEvent, useEffect, useRef } from 'react';

import { trackEvent } from '@/lib/analytics/events';
import type { FormState } from '@/lib/leads/formState';
import { LEAD_PURPOSES, type LeadPurpose } from '@/lib/leads/purposes';

type FormName = 'contact';

interface FormContext {
  purpose: LeadPurpose;
  product_id?: string;
}

const isPurpose = (value: unknown): value is LeadPurpose =>
  LEAD_PURPOSES.some((purpose) => purpose === value);

// Only the purpose and the product slug are read from the form — never contact fields.
const readContext = (form: HTMLFormElement): FormContext => {
  const data = new FormData(form);
  const purpose = data.get('purpose');
  const slug = data.get('productSlug');
  return {
    purpose: isPurpose(purpose) ? purpose : 'other',
    ...(typeof slug === 'string' && slug ? { product_id: slug } : {}),
  };
};

/** `contact_start` on the first interaction per page view, `contact_submit` on success. */
export const useFormAnalytics = (name: FormName, state: FormState) => {
  const locale = useLocale();
  const started = useRef(false);
  const submitted = useRef<FormContext | null>(null);

  useEffect(() => {
    if (state.status !== 'success' || !submitted.current) return;
    trackEvent('contact_submit', { ...submitted.current, form: name, locale });
    submitted.current = null;
  }, [state, name, locale]);

  const onFocusCapture = (event: FocusEvent<HTMLFormElement>) => {
    if (started.current) return;
    started.current = true;
    trackEvent('contact_start', { ...readContext(event.currentTarget), form: name });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    submitted.current = readContext(event.currentTarget);
  };

  return { onFocusCapture, onSubmit };
};
