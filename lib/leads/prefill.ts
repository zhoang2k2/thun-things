import { getProductBySlug } from '@/lib/catalog';
import type { Product } from '@/lib/catalog/schema';
import { LEAD_PURPOSES, type LeadPurpose } from '@/lib/leads/schema';

type SearchParamValue = string | string[] | undefined;

export interface ContactPrefill {
  product?: Product;
  purpose: LeadPurpose;
}

const first = (value: SearchParamValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const isPurpose = (value: string | undefined): value is LeadPurpose =>
  LEAD_PURPOSES.some((purpose) => purpose === value);

/** `?product=<slug>&purpose=<order|notify|other>`; unknown slugs and purposes are ignored. */
export const resolveContactPrefill = (params: Record<string, SearchParamValue>): ContactPrefill => {
  const slug = first(params.product);
  const product = slug ? getProductBySlug(slug) : undefined;
  const purpose = first(params.purpose);
  if (isPurpose(purpose)) return { product, purpose };
  return { product, purpose: product ? 'order' : 'other' };
};

/** The serialisable part the client form needs. */
export interface ContactFormPrefill {
  purpose: LeadPurpose;
  productSlug?: string;
  sizes?: string[];
}

export const toFormPrefill = ({ product, purpose }: ContactPrefill): ContactFormPrefill => ({
  purpose,
  productSlug: product?.slug,
  sizes: product?.sizes,
});
