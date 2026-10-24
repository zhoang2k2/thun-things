'use client';

import { useTranslations } from 'next-intl';

import type { QuizRationale } from '@/components/quiz/useQuiz';

/**
 * AI rationale under the featured product (P8): a quiet two-line skeleton while it loads, then
 * the text with an "AI" label. Nothing at all when it is unavailable.
 */
export const QuizRationaleText = ({ rationale }: { rationale: QuizRationale }) => {
  const t = useTranslations('quiz');

  if (rationale.status === 'loading') {
    return (
      <div aria-hidden="true" className="QuizRationale__skeleton flex flex-col gap-2 py-1">
        <span className="bg-placeholder h-4 w-full" />
        <span className="bg-placeholder h-4 w-2/3" />
      </div>
    );
  }
  if (rationale.status !== 'shown') return null;
  return (
    <div className="QuizRationale flex flex-col gap-1">
      <p className="QuizRationale__text text-sm leading-6">{rationale.text}</p>
      <p className="QuizRationale__label text-ink-muted text-xs tracking-wide uppercase">
        {t('rationaleLabel')}
      </p>
    </div>
  );
};
