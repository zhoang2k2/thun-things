import type { Locale } from '@/i18n/routing';
import { rawProducts } from '@/lib/catalog/data';
import { formatPriceVND } from '@/lib/catalog/format';
import {
  catalogSchema,
  type ImageAsset,
  type Product,
  type ProductStatus,
} from '@/lib/catalog/schema';

// The only entry point for catalog data (AGENTS.md). Parsing at module load makes the build
// fail on any invalid product, duplicate id, or duplicate slug.
const products: Product[] = catalogSchema.parse(rawProducts);

export const PAGE_SIZE = 20;

export interface ProductPage {
  items: Product[];
  page: number;
  pageCount: number;
  total: number;
}

/** Serialisable view model for the client-side grid. */
export interface ProductCardModel {
  id: string;
  slug: string;
  name: string;
  priceLabel: string;
  status: ProductStatus;
  image: ImageAsset;
}

const parsePage = (value: string | string[] | undefined, pageCount: number): number => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, pageCount);
};

export const listProducts = (pageParam?: string | string[]): ProductPage => {
  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = parsePage(pageParam, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: products.slice(start, start + PAGE_SIZE),
    page,
    pageCount,
    total: products.length,
  };
};

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);

export const getAllSlugs = (): string[] => products.map((product) => product.slug);

export const getRelatedProducts = (product: Product, limit = 4): Product[] => {
  const colourIds = new Set(product.colors.map((colour) => colour.id));
  const others = products.filter((candidate) => candidate.id !== product.id);
  const sharesColour = (candidate: Product) =>
    candidate.colors.some((colour) => colourIds.has(colour.id));
  return [
    ...others.filter(sharesColour),
    ...others.filter((candidate) => !sharesColour(candidate)),
  ].slice(0, limit);
};

export const toCardModel = (product: Product, locale: Locale = 'vi'): ProductCardModel => ({
  id: product.id,
  slug: product.slug,
  name: product.name[locale],
  priceLabel: formatPriceVND(product.priceVND, locale),
  status: product.status,
  image: product.media.front,
});
