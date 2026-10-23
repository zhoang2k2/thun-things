import { z } from 'zod';

// Catalog model from thun-things.md §9. Deviations (P2 spec): `ImageAsset.src` is optional
// (absent = V-26 placeholder) and `Product.care` is added.

export const localeSchema = z.enum(['vi', 'en']);

export const localizedSchema = z.object({
  vi: z.string().min(1),
  en: z.string().min(1),
});

export const productStatusSchema = z.enum([
  'available',
  'limited',
  'sold_out',
  'coming_soon',
  'preorder',
]);

export const imageAssetSchema = z.object({
  src: z.string().min(1).optional(),
  width: z.int().positive(),
  height: z.int().positive(),
  alt: localizedSchema,
});

export const colorSchema = z.object({
  id: z.string().min(1),
  label: localizedSchema,
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'must be #RRGGBB'),
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case'),
  name: localizedSchema,
  description: localizedSchema,
  priceVND: z.int().positive(),
  status: productStatusSchema,
  statusNote: localizedSchema.optional(),
  colors: z.array(colorSchema).min(1),
  vibes: z.array(z.string().min(1)),
  sizes: z.array(z.string().min(1)).optional(),
  material: localizedSchema.optional(),
  care: localizedSchema.optional(),
  media: z.object({
    front: imageAssetSchema,
    back: imageAssetSchema.optional(),
    lifestyle: z.array(imageAssetSchema).optional(),
    hoverVideo: z.object({ src: z.string().min(1), poster: imageAssetSchema }).optional(),
  }),
  dropId: z.string().min(1).optional(),
  releasedAt: z.iso.date().optional(),
  seo: z
    .object({ title: localizedSchema.optional(), description: localizedSchema.optional() })
    .optional(),
});

const hasUnique = (values: string[]) => new Set(values).size === values.length;

export const catalogSchema = z
  .array(productSchema)
  .refine((products) => hasUnique(products.map((product) => product.id)), 'duplicate product id')
  .refine((products) => hasUnique(products.map((product) => product.slug)), 'duplicate slug');

export type Locale = z.infer<typeof localeSchema>;
export type Localized = z.infer<typeof localizedSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type ProductColor = z.infer<typeof colorSchema>;
export type Product = z.infer<typeof productSchema>;
