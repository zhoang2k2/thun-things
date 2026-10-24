'use client';

import { useTranslations } from 'next-intl';

import type { FormState } from '@/lib/leads/formState';

/** Translates the message keys a server function returned into the visitor's language. */
export const useFormMessages = ({ fieldErrors, message }: FormState) => {
  const t = useTranslations();
  const errors: Record<string, string> = {};
  for (const [field, key] of Object.entries(fieldErrors ?? {})) errors[field] = t(key);
  return { errors, message: message && t(message) };
};
