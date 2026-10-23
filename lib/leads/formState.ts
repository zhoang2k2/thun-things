// Shared between the server functions and the form components ('use server' files may only
// export async functions, so the state shape lives here).

export interface FormState {
  status: 'idle' | 'success' | 'error' | 'disabled';
  /** First error per field name. */
  fieldErrors?: Record<string, string>;
  /** Form-level message (rate limit, delivery failure, disabled). */
  message?: string;
  /** Submitted values, echoed back so fields keep their input after an error. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: 'idle' };

/** Honeypot field name; real visitors never see or fill it. */
export const HONEYPOT_FIELD = 'website';
