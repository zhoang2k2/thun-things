import { getProductBySlug } from '@/lib/catalog';
import type { Product } from '@/lib/catalog/schema';
import { LEAD_PURPOSES, type LeadPurpose } from '@/lib/leads/purposes';

type SearchParamValue = string | string[] | undefined;

export interface ContactPrefill {
  product?: Product;
  purpose: LeadPurpose;
}

const first = (value: SearchParamValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const isPurpose = (value: string | undefined): value is LeadPurpose =>
  LEAD_PURPOSES.some((purpose) => purpose === value);

// Links shared before P9a2 used `purpose=notify`; they now open the pre-order form.
const RETIRED_PURPOSES: Record<string, LeadPurpose> = { notify: 'preorder' };

/** `?product=<slug>&purpose=<order|preorder|other>`; unknown slugs and purposes are ignored. */
export const resolveContactPrefill = (params: Record<string, SearchParamValue>): ContactPrefill => {
  const slug = first(params.product);
  const product = slug ? getProductBySlug(slug) : undefined;
  const raw = first(params.purpose);
  const purpose = raw && Object.hasOwn(RETIRED_PURPOSES, raw) ? RETIRED_PURPOSES[raw] : raw;
  if (isPurpose(purpose)) return { product, purpose };
  if (!product) return { product, purpose: 'other' };
  return { product, purpose: product.status === 'sold_out' ? 'preorder' : 'order' };
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
