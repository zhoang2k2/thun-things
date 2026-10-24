import type { Locale } from '@/i18n/routing';
import { listAllProducts, toCardModel } from '@/lib/catalog';
import type { QuizRequest } from '@/lib/recommend/schema';
import { type MatchKind, rankProducts } from '@/lib/recommend/score';

export type QuizProduct = Pick<
  ReturnType<typeof toCardModel>,
  'slug' | 'name' | 'priceLabel' | 'status' | 'image'
>;

export interface QuizRecommendation {
  match: MatchKind;
  featured: QuizProduct;
  more: QuizProduct[];
}

const MORE_COUNT = 3;

const toQuizProduct = (product: Parameters<typeof toCardModel>[0], locale: Locale) => {
  const { slug, name, priceLabel, status, image } = toCardModel(product, locale);
  return { slug, name, priceLabel, status, image };
};

/** Ranks the catalog for the visitor's answer: one featured product and the next three. */
export const recommend = ({ locale, color, vibe }: QuizRequest): QuizRecommendation | null => {
  const { match, ranked } = rankProducts(listAllProducts(), { color, vibe });
  const [first, ...rest] = ranked;
  if (!first) return null;
  return {
    match,
    featured: toQuizProduct(first, locale),
    more: rest.slice(0, MORE_COUNT).map((product) => toQuizProduct(product, locale)),
  };
};
