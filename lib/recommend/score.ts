import type { Product, ProductStatus } from '@/lib/catalog/schema';

// Deterministic quiz scoring (P7, spec section 3). Pure: same catalog and answer, same ranking.

export interface QuizAnswer {
  color: string;
  /** Absent when the vibe step was skipped (fewer than two vibes in the catalog). */
  vibe?: string;
}

export type MatchKind = 'exact' | 'color' | 'vibe' | 'none';

const COLOR_WEIGHT = 3;
const VIBE_WEIGHT = 2;

// In stock is preferred slightly (P9a2-4): +1 stays below the vibe weight, so an exact sold-out
// match (it can still be pre-ordered) outranks an in-stock colour-only one.
const STATUS_BONUS: Record<ProductStatus, number> = {
  available: 1,
  sold_out: 0,
};

// Tie-break order among equal scores.
const STATUS_RANK: Record<ProductStatus, number> = {
  available: 0,
  sold_out: 1,
};

const matchesColor = (product: Product, color: string) =>
  product.colors.some((entry) => entry.id === color);
const matchesVibe = (product: Product, vibe: string | undefined) =>
  vibe !== undefined && product.vibes.includes(vibe);

export const scoreProduct = (product: Product, { color, vibe }: QuizAnswer): number =>
  (matchesColor(product, color) ? COLOR_WEIGHT : 0) +
  (matchesVibe(product, vibe) ? VIBE_WEIGHT : 0) +
  STATUS_BONUS[product.status];

const matchKind = (product: Product, { color, vibe }: QuizAnswer): MatchKind => {
  const colorMatch = matchesColor(product, color);
  const vibeMatch = matchesVibe(product, vibe);
  if (colorMatch && vibeMatch) return 'exact';
  if (colorMatch) return 'color';
  if (vibeMatch) return 'vibe';
  return 'none';
};

const compareReleased = (a: Product, b: Product) => {
  if (a.releasedAt === b.releasedAt) return 0;
  if (!a.releasedAt) return 1;
  if (!b.releasedAt) return -1;
  return a.releasedAt < b.releasedAt ? 1 : -1;
};

/** Ranks the catalog for an answer; `match` describes the featured (first) product. */
export const rankProducts = (products: Product[], answer: QuizAnswer) => {
  const ranked = [...products].sort(
    (a, b) =>
      scoreProduct(b, answer) - scoreProduct(a, answer) ||
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      compareReleased(a, b) ||
      a.slug.localeCompare(b.slug),
  );
  const match: MatchKind = ranked[0] ? matchKind(ranked[0], answer) : 'none';
  return { match, ranked };
};
