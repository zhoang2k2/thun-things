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
  /** Sold out: show "up to 10% off when you pre-order" under the button (off in the mobile bar). */
  showOffer?: boolean;
}

// V-16/V-20 (P9a2): every design has a button. Chat channel when configured, otherwise the Contact
// page with the product and purpose prefilled.
export const ProductAction = ({
  slug,
  status,
  size = 'sm',
  className,
  showOffer = true,
}: ProductActionProps) => {
  const t = useTranslations('product');
  const { action, preorderOffer } = presentStatus(status);
  const label = t(`actions.${action.labelKey}`);
  const classes = buttonClasses({ size, className: `ProductAction ${className ?? ''}` });
  const { chatChannel } = siteConfig;

  const button = chatChannel ? (
    <a href={chatChannel.href} target="_blank" rel="noopener noreferrer" className={classes}>
      {label}
    </a>
  ) : (
    <Link href={contactHref(slug, action.purpose)} className={classes}>
      {label}
    </Link>
  );

  if (!preorderOffer || !showOffer) return button;
  return (
    <div className="ProductAction__offer flex flex-col items-start gap-2">
      {button}
      <p className="ProductAction__offerText text-ink-muted text-sm leading-5">
        {t('preorderOffer')}
      </p>
    </div>
  );
};
