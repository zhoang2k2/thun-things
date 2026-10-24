'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import { StatusBadge } from '@/components/product/StatusBadge';
import { QuizRationaleText } from '@/components/quiz/QuizRationaleText';
import type { QuizRationale } from '@/components/quiz/useQuiz';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/events';
import type { QuizRecommendation } from '@/lib/recommend/recommend';

const LINK =
  'focus-visible:outline-ink font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';

interface QuizResultProps {
  result: QuizRecommendation;
  rationale: QuizRationale;
  /** Called before following a product or contact link (closes the card). */
  onNavigate: () => void;
}

/** One featured design and, on request, up to three more (O-03, P7-1). */
export const QuizResult = ({ result, rationale, onNavigate }: QuizResultProps) => {
  const t = useTranslations('quiz');
  const locale = useLocale();
  const [showMore, setShowMore] = useState(false);
  const { featured, more, match } = result;
  const follow = (slug: string, position: number) => () => {
    trackEvent('quiz_result_click', { product_id: slug, position });
    onNavigate();
  };

  return (
    <div className="QuizResult flex flex-col gap-4">
      {match === 'none' && (
        <p className="text-ink-muted text-sm leading-6">
          {t('noMatch')}{' '}
          <Link href="/contact" onClick={onNavigate} className={LINK}>
            {t('noMatchContact')}
          </Link>
        </p>
      )}
      <div className="QuizResult__featured flex gap-4">
        <div className="w-24 shrink-0">
          <MediaImage
            src={featured.image.src}
            alt={featured.image.alt[locale]}
            width={featured.image.width}
            height={featured.image.height}
            sizes="96px"
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <Link
            href={`/products/${featured.slug}`}
            onClick={follow(featured.slug, 0)}
            className={LINK}
          >
            {featured.name}
          </Link>
          <p className="text-sm">{featured.priceLabel}</p>
          <StatusBadge status={featured.status} />
        </div>
      </div>
      <QuizRationaleText rationale={rationale} />
      {more.length > 0 &&
        (showMore ? (
          <ul
            aria-label={t('moreTitle')}
            className="QuizResult__more border-line flex flex-col gap-2 border-t pt-4"
          >
            {more.map((item, index) => (
              <li key={item.slug} className="flex items-baseline justify-between gap-4 text-sm">
                <Link
                  href={`/products/${item.slug}`}
                  onClick={follow(item.slug, index + 1)}
                  className={LINK}
                >
                  {item.name}
                </Link>
                <span className="text-ink-muted shrink-0">{item.priceLabel}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Button
            size="md"
            variant="secondary"
            className="self-start"
            onClick={() => setShowMore(true)}
          >
            {t('seeMore')}
          </Button>
        ))}
    </div>
  );
};
