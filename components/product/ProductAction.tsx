import { useTranslations } from 'next-intl';

import type { ButtonSize } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';
import type { ProductStatus } from '@/lib/catalog/schema';
import { contactHref, presentStatus } from '@/lib/catalog/status';

interface ProductActionProps {
  slug: string;
  status: ProductStatus;
  size?: ButtonSize;
  className?: string;
}

// V-16/V-20: chat channel when configured, otherwise the Contact page with the product prefilled.
export const ProductAction = ({ slug, status, size = 'sm', className }: ProductActionProps) => {
  const t = useTranslations('product.actions');
  const { action } = presentStatus(status);
  if (!action) return null;

  const label = t(action.labelKey);

  const classes = buttonClasses({ size, className: `ProductAction ${className ?? ''}` });
  const { chatChannel } = siteConfig;

  if (chatChannel) {
    return (
      <a href={chatChannel.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={contactHref(slug, action.purpose)} className={classes}>
      {label}
    </Link>
  );
};
