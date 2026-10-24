import type { Locale } from '@/i18n/routing';

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface PolicyDocument {
  /** ISO date of the last text change (either locale). */
  updatedAt: string;
  /** The same sections per locale; English is written for English readers, not translated word by word. */
  sections: Record<Locale, PolicySection[]>;
}
