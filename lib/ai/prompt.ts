import type { Locale } from '@/i18n/routing';
import { getProductBySlug } from '@/lib/catalog';
import type { ProductStatus } from '@/lib/catalog/schema';
import en from '@/messages/en.json';
import vi from '@/messages/vi.json';

// Prompt for the quiz rationale (P8, spec section 1). Built only from catalog data and the
// visitor's enum answers: no free text, no price, nothing that identifies the visitor.

export interface ExplainInput {
  locale: Locale;
  color: string;
  vibe?: string;
  slug: string;
}

const LANGUAGE: Record<Locale, string> = { vi: 'Vietnamese', en: 'English' };
const VIBE_LABELS: Record<Locale, Record<string, string>> = {
  vi: vi.quiz.vibes,
  en: en.quiz.vibes,
};
const STATUS: Record<ProductStatus, string> = {
  available: 'in stock',
  limited: 'limited run',
  preorder: 'open for pre-order',
  coming_soon: 'coming soon',
  sold_out: 'sold out',
};

const system = (locale: Locale) =>
  [
    'You write for Thun Things, a small Vietnamese brand of graphic T-shirts.',
    `Write in ${LANGUAGE[locale]}: one or two short sentences (at most two sentences, under 280 characters) telling the visitor why this T-shirt suits the colour and style they chose.`,
    'Speak to the visitor directly, warm and plain. Use only the facts given; do not invent materials, discounts, deliveries or stock.',
    'No prices, no links, no hashtags, no markdown, no emoji. Reply with the sentences only.',
  ].join('\n');

/** Returns the system instruction and prompt for a catalog product, or null if it is unknown. */
export const buildPrompt = ({
  locale,
  color,
  vibe,
  slug,
}: ExplainInput): { system: string; prompt: string } | null => {
  const product = getProductBySlug(slug);
  if (!product) return null;
  const vibeLabel = (tag: string) => VIBE_LABELS[locale][tag] ?? tag;
  const chosenColor = product.colors.find((entry) => entry.id === color);
  const lines = [
    `T-shirt: ${product.name[locale]}`,
    `About it: ${product.description[locale]}`,
    `Colours: ${product.colors.map((entry) => entry.label[locale]).join(', ')}`,
    `Styles: ${product.vibes.map(vibeLabel).join(', ') || '—'}`,
    `Availability: ${STATUS[product.status]}`,
    `Colour the visitor chose: ${chosenColor?.label[locale] ?? color}`,
  ];
  if (vibe) lines.push(`Style they chose: ${vibeLabel(vibe)}`);
  return { system: system(locale), prompt: lines.join('\n') };
};
