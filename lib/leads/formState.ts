import type { Messages } from '@/i18n/messages';

// Shared between the server functions and the form components ('use server' files may only
// export async functions, so the state shape lives here).

/** Message keys a server function returns; the form components translate them. */
export type FormMessageKey =
  | `forms.errors.${keyof Messages['forms']['errors']}`
  | 'forms.disabled'
  | 'forms.rateLimited'
  | 'forms.deliveryFailed';

export interface FormState {
  status: 'idle' | 'success' | 'error' | 'disabled';
  /** First error per field name, as a message key. */
  fieldErrors?: Record<string, FormMessageKey>;
  /** Form-level message key (rate limit, delivery failure, disabled). */
  message?: FormMessageKey;
  /** Submitted values, echoed back so fields keep their input after an error. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: 'idle' };

/** Honeypot field name; real visitors never see or fill it. */
export const HONEYPOT_FIELD = 'website';
