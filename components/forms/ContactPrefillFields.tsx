'use client';

import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';
import { use } from 'react';

import { choiceClasses, controlClasses, type FieldControlProps } from '@/components/forms/Field';
import { cn } from '@/lib/cn';
import type { ContactFormPrefill } from '@/lib/leads/prefill';
import { LEAD_PURPOSES, type LeadPurpose } from '@/lib/leads/purposes';

// Contact form parts that depend on `?product=&purpose=`. Each renders inside <Suspense> whose
// fallback is the same control without a product, so the form works before the query streams
// in and without JavaScript.

const INPUT = cn(controlClasses, 'h-12');

type PrefillPromise = Promise<ContactFormPrefill>;

export const PurposeChoices = ({ purpose }: { purpose: string }) => {
  const t = useTranslations('forms.purposes');
  return (
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
          <span className="text-base">{t(option)}</span>
        </label>
      ))}
    </div>
  );
};

/** `submitted` wins over the prefill so a failed submit keeps the visitor's choice. */
export const PrefilledPurpose = ({
  prefill,
  submitted,
}: {
  prefill: PrefillPromise;
  submitted?: string;
}) => {
  const { purpose } = use(prefill);
  return <PurposeChoices purpose={submitted ?? purpose} />;
};

export const FALLBACK_PURPOSE: LeadPurpose = 'other';

interface SizeControlProps {
  control: FieldControlProps;
  sizes?: string[];
  value?: string;
}

export const SizeControl = ({ control, sizes, value }: SizeControlProps) => {
  const t = useTranslations('forms.fields');
  if (!sizes || sizes.length === 0) {
    return <input {...control} type="text" maxLength={10} defaultValue={value} className={INPUT} />;
  }

  return (
    <span className="relative block">
      <select {...control} defaultValue={value ?? ''} className={cn(INPUT, 'pr-12')}>
        <option value="">{t('sizePlaceholder')}</option>
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
  );
};

export const PrefilledSize = ({
  prefill,
  ...props
}: Omit<SizeControlProps, 'sizes'> & { prefill: PrefillPromise }) => {
  const { sizes } = use(prefill);
  return <SizeControl {...props} sizes={sizes} />;
};

export const PrefilledProductInput = ({ prefill }: { prefill: PrefillPromise }) => {
  const { productSlug } = use(prefill);
  if (!productSlug) return null;
  return <input type="hidden" name="productSlug" value={productSlug} />;
};
