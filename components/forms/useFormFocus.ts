'use client';

import { useEffect, useRef } from 'react';

import type { FormState } from '@/lib/leads/formState';

/** Moves focus to the error summary or success message after each submission. */
export const useFormFocus = (state: FormState) => {
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'error' || state.status === 'disabled') errorRef.current?.focus();
    if (state.status === 'success') successRef.current?.focus();
  }, [state]);

  return { errorRef, successRef };
};
