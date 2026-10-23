import Image from 'next/image';

import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';
import { cn } from '@/lib/cn';

interface MediaImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  /** Next 16 replacement for `priority`; set on the LCP image only. */
  preload?: boolean;
  className?: string;
}

// Single entry point for banners and product photos so missing images never block a phase.
export const MediaImage = ({
  src,
  alt,
  width,
  height,
  sizes,
  preload,
  className,
}: MediaImageProps) => {
  if (!src) {
    return <ImagePlaceholder alt={alt} width={width} height={height} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      className={cn('MediaImage h-auto w-full object-cover', className)}
    />
  );
};
