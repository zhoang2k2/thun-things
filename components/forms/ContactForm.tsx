'use client';

import { Suspense, useActionState } from 'react';

import { ConsentField } from '@/components/forms/ConsentField';
import {
  FALLBACK_PURPOSE,
  PrefilledProductInput,
  PrefilledPurpose,
  PrefilledSize,
  PurposeChoices,
  SizeControl,
} from '@/components/forms/ContactPrefillFields';
import { controlClasses, Field, RequiredMark } from '@/components/forms/Field';
import {
  FormDisabledNote,
  FormErrorSummary,
  FormSuccess,
  Honeypot,
} from '@/components/forms/FormStatus';
import { useFormFocus } from '@/components/forms/useFormFocus';
import { Button } from '@/components/ui/Button';
import { copy } from '@/content/copy/vi';
import { cn } from '@/lib/cn';
import { submitContact } from '@/lib/leads/actions';
import { HONEYPOT_FIELD, initialFormState } from '@/lib/leads/formState';
import type { ContactFormPrefill } from '@/lib/leads/prefill';

const { forms } = copy;
const { fields } = forms;
const ID = 'contact';

const INPUT = cn(controlClasses, 'h-12');

interface ContactFormProps {
  enabled: boolean;
  /** Resolves from the query string; the form renders (and works) before it does. */
  prefill: Promise<ContactFormPrefill>;
  contactEmail?: string;
}

// V-13 order form (P3-1): email and phone/Zalo required, everything else optional.
export const ContactForm = ({ enabled, prefill, contactEmail }: ContactFormProps) => {
  const [state, formAction, pending] = useActionState(submitContact, initialFormState);
  const { errorRef, successRef } = useFormFocus(state);

  if (state.status === 'success') {
    return (
      <FormSuccess ref={successRef} title={forms.contact.successTitle}>
        {forms.contact.successBody}
      </FormSuccess>
    );
  }

  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const hasSummary = state.status === 'error' || state.status === 'disabled';
  const isEnabled = enabled && state.status !== 'disabled';

  return (
    <form
      action={formAction}
      noValidate
      className="ContactForm relative flex max-w-3xl flex-col gap-8"
    >
      {hasSummary && (
        <FormErrorSummary
          ref={errorRef}
          idPrefix={ID}
          fieldErrors={state.fieldErrors}
          message={state.message}
        />
      )}
      {!isEnabled && <FormDisabledNote contactEmail={contactEmail} />}

      <fieldset disabled={!isEnabled} className="ContactForm__fields flex flex-col gap-8">
        <p className="ContactForm__legend text-ink-muted text-sm leading-5">
          <RequiredMark /> {forms.required}
        </p>

        <fieldset className="ContactForm__purpose flex flex-col gap-4">
          <legend className="Field__label mb-4 text-xs font-medium tracking-wide uppercase">
            {fields.purpose}
          </legend>
          <Suspense fallback={<PurposeChoices purpose={values.purpose ?? FALLBACK_PURPOSE} />}>
            <PrefilledPurpose prefill={prefill} submitted={values.purpose} />
          </Suspense>
        </fieldset>

        <div className="ContactForm__row grid gap-8 md:grid-cols-2">
          <Field idPrefix={ID} name="email" label={fields.email} required error={errors.email}>
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
          <Field idPrefix={ID} name="phone" label={fields.phone} required error={errors.phone}>
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
        </div>

        <div className="ContactForm__row grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <Field idPrefix={ID} name="name" label={fields.name} error={errors.name}>
            {(control) => (
              <input
                {...control}
                type="text"
                autoComplete="name"
                maxLength={80}
                defaultValue={values.name}
                className={INPUT}
              />
            )}
          </Field>
          <Field idPrefix={ID} name="size" label={fields.size} error={errors.size}>
            {(control) => (
              <Suspense fallback={<SizeControl control={control} value={values.size} />}>
                <PrefilledSize prefill={prefill} control={control} value={values.size} />
              </Suspense>
            )}
          </Field>
          <Field idPrefix={ID} name="quantity" label={fields.quantity} error={errors.quantity}>
            {(control) => (
              <input
                {...control}
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                defaultValue={values.quantity ?? '1'}
                className={INPUT}
              />
            )}
          </Field>
        </div>

        <Field idPrefix={ID} name="address" label={fields.address} error={errors.address}>
          {(control) => (
            <input
              {...control}
              type="text"
              autoComplete="street-address"
              maxLength={300}
              defaultValue={values.address}
              className={INPUT}
            />
          )}
        </Field>

        <Field idPrefix={ID} name="message" label={fields.message} error={errors.message}>
          {(control) => (
            <textarea
              {...control}
              rows={4}
              maxLength={1000}
              defaultValue={values.message}
              className={cn(controlClasses, 'min-h-32 py-3')}
            />
          )}
        </Field>

        <ConsentField
          idPrefix={ID}
          error={errors.consent}
          defaultChecked={values.consent === 'on'}
        />
        <Honeypot idPrefix={ID} name={HONEYPOT_FIELD} />
        <Suspense fallback={null}>
          <PrefilledProductInput prefill={prefill} />
        </Suspense>
      </fieldset>

      {isEnabled && (
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="ContactForm__submit self-start"
        >
          {pending ? forms.sending : forms.submit}
        </Button>
      )}
    </form>
  );
};
