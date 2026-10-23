import type { LeadPurpose } from '@/lib/leads/schema';

export interface Lead {
  kind: 'contact' | 'notify';
  purpose: LeadPurpose;
  email?: string;
  /** Normalised to +84xxxxxxxxx. */
  phone?: string;
  name?: string;
  size?: string;
  quantity?: number;
  address?: string;
  message?: string;
  productId?: string;
  productSlug?: string;
  locale: 'vi';
  consent: true;
  createdAt: string;
}

export interface LeadSink {
  deliver(lead: Lead): Promise<void>;
}

/** Carries only a short reason code, never lead data, so it is safe to log. */
export class LeadDeliveryError extends Error {
  constructor(readonly reason: string) {
    super(`Lead delivery failed: ${reason}`);
    this.name = 'LeadDeliveryError';
  }
}
