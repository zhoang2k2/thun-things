'use client';

import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useActionState } from 'react';

import { ConsentField } from '@/components/forms/ConsentField';
import { choiceClasses, controlClasses, Field, RequiredMark } from '@/components/forms/Field';
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
import { LEAD_PURPOSES, type LeadPurpose } from '@/lib/leads/schema';

const { forms } = copy;
const { fields } = forms;
const ID = 'contact';

const INPUT = cn(controlClasses, 'h-12');

interface ContactFormProps {
  enabled: boolean;
  defaultPurpose: LeadPurpose;
  /** Set when the visitor came from a product; sizes then come from that product. */
  productSlug?: string;
  sizes?: readonly string[];
  contactEmail?: string;
}

// V-13 order form (P3-1): email and phone/Zalo required, everything else optional.
export const ContactForm = ({
  enabled,
  defaultPurpose,
  productSlug,
  sizes,
  contactEmail,
}: ContactFormProps) => {
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
  const purpose = values.purpose ?? defaultPurpose;
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
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            {LEAD_PURPOSES.map((option) => (
              <label key={option} className="ContactForm__choice flex min-h-12 items-center gap-4">
                <input
                  type="radio"
                  name="purpose"
                  value={option}
                  defaultChecked={purpose === option}
                  className={cn(choiceClasses, 'checked:border-[7px]')}
                />
                <span className="text-base">{forms.purposes[option]}</span>
              </label>
            ))}
          </div>
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
            {(control) =>
              sizes && sizes.length > 0 ? (
                <span className="relative block">
                  <select
                    {...control}
                    defaultValue={values.size ?? ''}
                    className={cn(INPUT, 'pr-12')}
                  >
                    <option value="">{fields.sizePlaceholder}</option>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 right-4"
                  />
                </span>
              ) : (
                <input
                  {...control}
                  type="text"
                  maxLength={10}
                  defaultValue={values.size}
                  className={INPUT}
                />
              )
            }
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
        {productSlug && <input type="hidden" name="productSlug" value={productSlug} />}
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
