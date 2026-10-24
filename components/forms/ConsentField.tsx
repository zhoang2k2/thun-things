import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';

import { choiceClasses, FieldError, fieldId, RequiredMark } from '@/components/forms/Field';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

interface ConsentFieldProps {
  idPrefix: string;
  error?: string;
  defaultChecked?: boolean;
}

// P3-4: required consent, linking the privacy policy (opens a new tab so the form keeps its input).
export const ConsentField = ({ idPrefix, error, defaultChecked }: ConsentFieldProps) => {
  const t = useTranslations('forms.fields');
  const id = fieldId(idPrefix, 'consent');
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="ConsentField flex flex-col gap-2">
      <div className="ConsentField__row flex items-start gap-4">
        <span className="ConsentField__box relative inline-flex shrink-0">
          <input
            type="checkbox"
            id={id}
            name="consent"
            defaultChecked={defaultChecked}
            aria-required
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(choiceClasses, 'peer checked:bg-ink')}
          />
          <HugeiconsIcon
            icon={Tick02Icon}
            size={16}
            aria-hidden="true"
            className="ConsentField__tick text-canvas pointer-events-none absolute top-1 left-1 hidden peer-checked:block"
          />
        </span>
        <label htmlFor={id} className="ConsentField__label text-sm leading-6">
          {t('consentBefore')}
          <Link
            href="/policy/privacy"
            target="_blank"
            className="focus-visible:outline-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t('consentLink')}
          </Link>
          <RequiredMark />
        </label>
      </div>
      {error && <FieldError id={errorId!}>{error}</FieldError>}
    </div>
  );
};
