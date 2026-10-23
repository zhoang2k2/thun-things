'use client';

import { useRef, useState } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import { copy } from '@/content/copy/vi';
import type { ImageAsset } from '@/lib/catalog/schema';

const plate = (value: number) => String(value).padStart(2, '0');

// V-11 (P2-10): stacked images on desktop; on mobile a swipeable, snap-scrolling carousel with a
// plate-number counter so the product info and order bar are reached quickly.
export const ProductGallery = ({ images }: { images: ImageAsset[] }) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={copy.product.galleryLabel}
      className="ProductGallery relative"
    >
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        // Scrollable region must be keyboard reachable on mobile.
        tabIndex={0}
        className="ProductGallery__track focus-visible:outline-ink flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 md:snap-none md:flex-col md:gap-1 md:overflow-visible"
      >
        {images.map((image, position) => (
          <li
            key={`${image.alt.vi}-${position}`}
            className="ProductGallery__item w-full shrink-0 snap-start md:w-auto"
          >
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
      <p
        aria-live="polite"
        className="ProductGallery__counter bg-canvas absolute right-4 bottom-4 px-2 text-xs leading-6 tracking-wide md:hidden"
      >
        {plate(current + 1)} / {plate(images.length)}
      </p>
    </section>
  );
};
