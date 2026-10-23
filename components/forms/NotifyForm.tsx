'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { ConsentField } from '@/components/forms/ConsentField';
import { controlClasses, Field } from '@/components/forms/Field';
import {
  FormDisabledNote,
  FormErrorSummary,
  FormSuccess,
  Honeypot,
} from '@/components/forms/FormStatus';
import { useFormFocus } from '@/components/forms/useFormFocus';
import { useFormMessages } from '@/components/forms/useFormMessages';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { submitNotify } from '@/lib/leads/actions';
import { HONEYPOT_FIELD, initialFormState } from '@/lib/leads/formState';

const ID = 'notify';
const INPUT = cn(controlClasses, 'h-12');

interface NotifyFormProps {
  productSlug: string;
  enabled: boolean;
  contactEmail?: string;
}

// V-22 / P3-2: sold-out products ask for email or phone (at least one) right on the page.
export const NotifyForm = ({ productSlug, enabled, contactEmail }: NotifyFormProps) => {
  const [state, formAction, pending] = useActionState(submitNotify, initialFormState);
  const { errorRef, successRef } = useFormFocus(state);
  const t = useTranslations('forms');
  const { errors, message } = useFormMessages(state);

  const values = state.values ?? {};
  const hasSummary = state.status === 'error' || state.status === 'disabled';
  const isEnabled = enabled && state.status !== 'disabled';

  return (
    <section
      id="notify"
      aria-labelledby="notify-heading"
      className="NotifyForm border-line flex scroll-mt-24 flex-col gap-4 border-t pt-6"
    >
      <h2
        id="notify-heading"
        className="NotifyForm__title text-sm font-medium tracking-wide uppercase"
      >
        {t('notify.title')}
      </h2>
      {state.status === 'success' ? (
        <FormSuccess ref={successRef}>{t('notify.success')}</FormSuccess>
      ) : (
        <form
          action={formAction}
          noValidate
          className="NotifyForm__form relative flex flex-col gap-6"
        >
          <p className="NotifyForm__intro text-ink-muted text-sm leading-6">
            {t('notify.intro')} {t('notify.hint')}
          </p>
          {hasSummary && (
            <FormErrorSummary ref={errorRef} idPrefix={ID} fieldErrors={errors} message={message} />
          )}
          {!isEnabled && <FormDisabledNote contactEmail={contactEmail} />}
          <fieldset disabled={!isEnabled} className="NotifyForm__fields flex flex-col gap-6">
            <Field idPrefix={ID} name="email" label={t('fields.email')} error={errors.email}>
              {(control) => (
                <input
                  {...control}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  defaultValue={values.email}
                  className={INPUT}
                />
              )}
            </Field>
            <Field idPrefix={ID} name="phone" label={t('fields.phone')} error={errors.phone}>
              {(control) => (
                <input
                  {...control}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  defaultValue={values.phone}
                  className={INPUT}
                />
              )}
            </Field>
            <ConsentField
              idPrefix={ID}
              error={errors.consent}
              defaultChecked={values.consent === 'on'}
            />
            <Honeypot idPrefix={ID} name={HONEYPOT_FIELD} />
            <input type="hidden" name="productSlug" value={productSlug} />
          </fieldset>
          {isEnabled && (
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={pending}
              className="self-start"
            >
              {pending ? t('sending') : t('notify.submit')}
            </Button>
          )}
        </form>
      )}
    </section>
  );
};
