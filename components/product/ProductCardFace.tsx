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
  /** Shown instead of the photo when it has no source yet (x-ray back placeholder). */
  placeholderLabel?: string;
}

// The one card body shared by the hover card and the x-ray copies (P11), so the revealed card of a
// neighbour is the same markup, type and spacing as the card that opens when it is hovered directly.
export const ProductCardFace = ({
  product,
  image,
  href,
  placeholderLabel,
}: ProductCardFaceProps) => {
  const photo =
    !image.src && placeholderLabel ? (
      <div className="bg-placeholder text-ink relative flex aspect-[4/5] items-center justify-center text-sm font-bold tracking-wide">
        {placeholderLabel}
      </div>
    ) : (
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
