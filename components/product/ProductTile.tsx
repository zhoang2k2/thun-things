import Link from 'next/link';

import { MediaImage } from '@/components/media/MediaImage';
import type { ProductCardModel } from '@/lib/catalog';

interface ProductTileProps {
  product: ProductCardModel;
}

export const GRID_IMAGE_SIZES = '(min-width: 768px) 25vw, 50vw';

// V-10: the cell shows only the image; its alt text names the product for the link.
export const ProductTile = ({ product }: ProductTileProps) => (
  <li className="ProductTile relative aspect-[4/5]">
    <Link
      href={`/products/${product.slug}`}
      className="ProductTile__link focus-visible:outline-ink block h-full focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
      <MediaImage
        src={product.image.src}
        alt={product.image.alt.vi}
        width={product.image.width}
        height={product.image.height}
        sizes={GRID_IMAGE_SIZES}
        fill
      />
    </Link>
  </li>
);
