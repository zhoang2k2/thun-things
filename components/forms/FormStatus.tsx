import { useTranslations } from 'next-intl';
import type { ReactNode, Ref } from 'react';

import { fieldId } from '@/components/forms/Field';

const LINK = 'underline underline-offset-4';

interface FormErrorSummaryProps {
  ref?: Ref<HTMLDivElement>;
  idPrefix: string;
  /** Translated first error per field. */
  fieldErrors?: Record<string, string>;
  /** Translated form-level message. */
  message?: string;
}

/** Top-of-form summary; receives focus after a failed submit, each item links to its field. */
export const FormErrorSummary = ({
  ref,
  idPrefix,
  fieldErrors,
  message,
}: FormErrorSummaryProps) => {
  const t = useTranslations('forms');
  const entries = Object.entries(fieldErrors ?? {});
  const headingId = `${idPrefix}-error-summary`;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-labelledby={headingId}
      className="FormErrorSummary border-error border-2 p-4 focus-visible:outline-none"
    >
      <p id={headingId} className="FormErrorSummary__title text-error font-medium">
        {entries.length > 0 ? t('errorSummary') : message}
      </p>
      {entries.length > 0 && (
        <ul className="FormErrorSummary__list mt-2 flex flex-col gap-1 text-sm leading-6">
          {entries.map(([field, error]) => (
            <li key={field}>
              <a href={`#${fieldId(idPrefix, field)}`} className={LINK}>
                {error}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Shown instead of the submit button when email or rate limiting is not configured. */
export const FormDisabledNote = ({ contactEmail }: { contactEmail?: string }) => {
  const t = useTranslations('forms');
  return (
    <div className="FormDisabledNote border-ink border p-4 text-sm leading-6">
      <p>{t('disabled')}</p>
      {contactEmail && (
        <p>
          {t('disabledEmail')}{' '}
          <a href={`mailto:${contactEmail}`} className={LINK}>
            {contactEmail}
          </a>
        </p>
      )}
    </div>
  );
};

interface FormSuccessProps {
  ref?: Ref<HTMLDivElement>;
  title?: string;
  children: ReactNode;
}

export const FormSuccess = ({ ref, title, children }: FormSuccessProps) => (
  <div
    ref={ref}
    tabIndex={-1}
    role="status"
    className="FormSuccess border-ink border-l-4 py-2 pl-4 focus-visible:outline-none"
  >
    {title && <h2 className="FormSuccess__title text-2xl leading-8 font-bold">{title}</h2>}
    <p className="FormSuccess__body mt-2 leading-6">{children}</p>
  </div>
);

/** Off-screen honeypot: hidden from people and assistive tech, filled by naive bots. */
export const Honeypot = ({ idPrefix, name }: { idPrefix: string; name: string }) => {
  const t = useTranslations('forms');
  return (
    <div aria-hidden="true" className="Honeypot absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={fieldId(idPrefix, name)}>{t('honeypotLabel')}</label>
      <input
        type="text"
        id={fieldId(idPrefix, name)}
        name={name}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};
