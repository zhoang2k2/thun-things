/**
 * Global and shared domain types for Thun Things
 *
 * Source: thun-things.md Part 1 §9
 */

export type Locale = 'vi' | 'en';

export type Localized<T = string> = Record<Locale, T>;

export type ProductStatus = 'available' | 'limited' | 'sold_out' | 'coming_soon' | 'preorder';

export type ContactPurpose = 'order' | 'notify' | 'other';
