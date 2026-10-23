import { MediaImage } from '@/components/media/MediaImage';
import { copy } from '@/content/copy/vi';
import type { Product } from '@/lib/catalog/schema';

// V-11: stacked images in the left column; the first one is the LCP image.
export const ProductGallery = ({ product }: { product: Product }) => {
  const { front, back, lifestyle = [] } = product.media;
  const images = [front, ...(back ? [back] : []), ...lifestyle];

  return (
    <ul aria-label={copy.product.galleryLabel} className="ProductGallery flex flex-col gap-1">
      {images.map((image, position) => (
        <li key={`${image.alt.vi}-${position}`} className="ProductGallery__item">
          <MediaImage
            src={image.src}
            alt={image.alt.vi}
            width={image.width}
            height={image.height}
            sizes="(min-width: 768px) 58vw, 100vw"
            preload={position === 0}
          />
        </li>
      ))}
    </ul>
  );
};
