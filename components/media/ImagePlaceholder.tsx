import { Image01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

interface ImagePlaceholderProps {
  alt: string;
  width: number;
  height: number;
  /** Fill the parent box instead of reserving the image's aspect ratio. */
  fill?: boolean;
  className?: string;
}

// V-26: temporary stand-in for photos the owner has not supplied yet.
export const ImagePlaceholder = ({
  alt,
  width,
  height,
  fill,
  className,
}: ImagePlaceholderProps) => {
  const t = useTranslations('media');
  return (
    <div
      role="img"
      aria-label={alt}
      // Runtime aspect ratio from the image's real dimensions.
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
      className={cn(
        'ImagePlaceholder bg-placeholder text-placeholder-ink flex flex-col items-center justify-center gap-2',
        fill ? 'h-full w-full' : 'w-full',
        className,
      )}
    >
      <HugeiconsIcon icon={Image01Icon} size={24} aria-hidden="true" />
      <span className="ImagePlaceholder__label text-sm font-bold tracking-wide uppercase">
        {t('placeholderLabel')}
      </span>
    </div>
  );
};
