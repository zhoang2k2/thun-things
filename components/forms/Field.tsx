import type { ReactNode } from 'react';

// Square native controls (DR-1); `appearance: none` is reset globally in globals.css.
const FOCUS = 'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2';

export const controlClasses = `Field__control border-ink bg-canvas aria-invalid:border-error w-full border px-4 text-base disabled:opacity-40 ${FOCUS}`;

export const choiceClasses = `Choice__control border-ink bg-canvas aria-invalid:border-error size-6 shrink-0 border disabled:opacity-40 ${FOCUS}`;

export const fieldId = (idPrefix: string, name: string): string => `${idPrefix}-${name}`;

export interface FieldControlProps {
  id: string;
  name: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-required'?: true;
}

interface FieldProps {
  idPrefix: string;
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, optional hint, control and error, with the ARIA wiring done once. */
export const Field = ({ idPrefix, name, label, required, error, hint, children }: FieldProps) => {
  const id = fieldId(idPrefix, name);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="Field flex flex-col gap-2">
      <label htmlFor={id} className="Field__label text-xs font-medium tracking-wide uppercase">
        {label}
        {required && <RequiredMark />}
      </label>
      {hint && (
        <p id={hintId} className="Field__hint text-ink-muted text-sm leading-5">
          {hint}
        </p>
      )}
      {children({
        id,
        name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required ? true : undefined,
      })}
      {error && <FieldError id={errorId!}>{error}</FieldError>}
    </div>
  );
};

export const RequiredMark = () => (
  <span aria-hidden="true" className="RequiredMark text-error">
    {' *'}
  </span>
);

export const FieldError = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} className="FieldError text-error text-sm leading-5 font-medium">
    {children}
  </p>
);
