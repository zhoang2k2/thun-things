// Lead purposes, kept free of Zod so client components can import them without pulling the
// schema library into the browser bundle.
// P9a2: `preorder` (sold-out designs, up to 10% off) replaced the notify-me purpose.
export const LEAD_PURPOSES = ['order', 'preorder', 'other'] as const;
export type LeadPurpose = (typeof LEAD_PURPOSES)[number];
