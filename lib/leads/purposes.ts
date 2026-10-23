// Lead purposes, kept free of Zod so client components can import them without pulling the
// schema library into the browser bundle.
export const LEAD_PURPOSES = ['order', 'notify', 'other'] as const;
export type LeadPurpose = (typeof LEAD_PURPOSES)[number];
