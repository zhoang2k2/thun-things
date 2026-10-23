import { Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { copy } from '@/content/copy/vi';
import { cn } from '@/lib/cn';

interface ImagePlaceholderProps {
  alt: string;
  width: number;
  height: number;
  className?: string;
}

// V-26: temporary stand-in for photos the owner has not supplied yet.
export const ImagePlaceholder = ({ alt, width, height, className }: ImagePlaceholderProps) => (
  <div
    role="img"
    aria-label={alt}
    // Runtime aspect ratio from the image's real dimensions.
    style={{ aspectRatio: `${width} / ${height}` }}
    className={cn(
      'ImagePlaceholder bg-placeholder text-placeholder-ink flex w-full flex-col items-center justify-center gap-2',
      className,
    )}
  >
    <HugeiconsIcon icon={Image01Icon} size={24} aria-hidden="true" />
    <span className="ImagePlaceholder__label text-sm font-bold tracking-wide uppercase">
      {copy.media.placeholderLabel}
    </span>
  </div>
);
