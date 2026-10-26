import { MediaImage } from '@/components/media/MediaImage';
import { ProductAction } from '@/components/product/ProductAction';
import { StatusBadge } from '@/components/product/StatusBadge';
import { Link } from '@/i18n/navigation';
import type { ImageAsset } from '@/lib/catalog/schema';
import type { ProductCardModel } from '@/lib/catalog';

interface ProductCardFaceProps {
  product: ProductCardModel;
  /** The photo on this face: the front for the hover card, the back for the x-ray. */
  image: ImageAsset;
  /** Set for the hover card (the photo links to the product); omitted for the x-ray copy. */
  href?: string;
}

// 16px photo-print frame (8-point grid): the card sits 16px outside the cell on every side but the
// bottom, so its image lands exactly on the cell image. 1px border + 15px padding = 16px.
export const FRAME_PX = 16;

// The card look: white sheet, 1px border, 15px padding (1 + 15 = the 16px frame).
export const CARD_CLASSES = 'bg-canvas border-line border p-[15px]';

// The hover card body: photo, name, price, status and action.
export const ProductCardFace = ({ product, image, href }: ProductCardFaceProps) => {
  const photo = (
    <div className="relative aspect-[4/5]">
      <MediaImage src={image.src} alt="" width={image.width} height={image.height} fill />
    </div>
  );

  return (
    <>
      {href ? (
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="ProductHoverCard__image block"
        >
          {photo}
        </Link>
      ) : (
        <div className="ProductHoverCard__image block">{photo}</div>
      )}
      <div className="ProductHoverCard__info flex flex-col pt-4">
        <p className="ProductHoverCard__name text-base leading-6 font-bold">{product.name}</p>
        <div className="ProductHoverCard__meta mt-2 flex items-center justify-between gap-2">
          <p className="ProductHoverCard__price text-sm leading-6">{product.priceLabel}</p>
          <StatusBadge status={product.status} />
        </div>
        <ProductAction
          slug={product.slug}
          status={product.status}
          size="lg"
          className="mt-4 w-full"
        />
      </div>
    </>
  );
};
