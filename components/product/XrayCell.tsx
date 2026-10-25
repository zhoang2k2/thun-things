import { ProductCardFace } from '@/components/product/ProductCardFace';
import type { ProductCardModel } from '@/lib/catalog';

// One x-ray cell (P11 rev 2): the neighbour's card exactly as it opens on hover, but showing the back
// photo. The `inert` cell can be neither clicked nor focused, so the copy never takes input; the
// real tile underneath opens the card. Same offsets as the hover card (16px outside the cell).
export const XrayCell = ({
  product,
  placeholderLabel,
}: {
  product: ProductCardModel;
  placeholderLabel: string;
}) => (
  <li className="XrayCell relative aspect-[4/5]" inert>
    <div className="XrayCell__card bg-canvas border-line absolute -top-4 -left-4 z-30 w-[calc(100%+32px)] border p-[15px]">
      <ProductCardFace
        product={product}
        image={product.backImage}
        placeholderLabel={placeholderLabel}
      />
    </div>
  </li>
);
