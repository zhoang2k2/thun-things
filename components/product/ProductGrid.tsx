'use client';

import { ProductTile } from '@/components/product/ProductTile';
import type { ProductCardModel } from '@/lib/catalog';

interface ProductGridProps {
  products: ProductCardModel[];
}

// V-09: 2 columns on mobile, 4 from md, no gaps.
export const ProductGrid = ({ products }: ProductGridProps) => (
  <ul className="ProductGrid relative grid grid-cols-2 md:grid-cols-4">
    {products.map((product) => (
      <ProductTile key={product.id} product={product} />
    ))}
  </ul>
);
