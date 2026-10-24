import { useLocale, useTranslations } from 'next-intl';

import { MediaImage } from '@/components/media/MediaImage';
import { Link } from '@/i18n/navigation';
import { formatPriceVND } from '@/lib/catalog/format';
import type { Product } from '@/lib/catalog/schema';

/** The product the visitor came from, shown above the contact form. */
export const ContactProductSummary = ({ product }: { product: Product }) => {
  const locale = useLocale();
  const t = useTranslations('forms.contact');
  const { front } = product.media;

  return (
    <section
      aria-label={t('productLabel')}
      className="ContactProductSummary border-line flex max-w-3xl items-center gap-4 border p-4"
    >
      <div className="ContactProductSummary__image w-16 shrink-0">
        <MediaImage
          src={front.src}
          alt={front.alt[locale]}
          width={front.width}
          height={front.height}
          sizes="64px"
        />
      </div>
      <div className="ContactProductSummary__text flex flex-col gap-1">
        <p className="text-ink-muted text-xs tracking-wide uppercase">{t('productLabel')}</p>
        <Link
          href={`/products/${product.slug}`}
          className="focus-visible:outline-ink font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {product.name[locale]}
        </Link>
        <p className="text-sm">{formatPriceVND(product.priceVND, locale)}</p>
      </div>
    </section>
  );
};
