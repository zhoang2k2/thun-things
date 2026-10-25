import { CARD_CLASSES, FRAME_PX, ProductCardFace } from '@/components/product/ProductCardFace';
import { cn } from '@/lib/cn';
import type { ProductCardModel } from '@/lib/catalog';

// One x-ray cell (P11): the neighbour's card as the single hover card draws it, showing the back
// photo. Same classes and the same 16px frame, so both sit on one geometry. The `inert` cell cannot
// be clicked or focused; the real tile underneath opens the card.
export const XrayCell = ({
  product,
  placeholderLabel,
  hovered,
}: {
  product: ProductCardModel;
  placeholderLabel: string;
  /** The design under the pointer: its copy sits on top, as the real hover card does. */
  hovered: boolean;
}) => (
  <li className="XrayCell relative aspect-[4/5]" inert>
    <div
      className={cn(
        CARD_CLASSES,
        'XrayCell__card absolute',
        hovered && 'XrayCell__card--hovered z-30',
      )}
      style={{ left: -FRAME_PX, top: -FRAME_PX, width: `calc(100% + ${FRAME_PX * 2}px)` }}
    >
      <ProductCardFace
        product={product}
        image={product.backImage}
        placeholderLabel={placeholderLabel}
      />
    </div>
  </li>
);
