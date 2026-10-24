'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { useQuizContext } from '@/components/quiz/QuizProvider';
import { buttonClasses } from '@/components/ui/Button';

// The card (steps, fetch, results) loads only when a visitor opens the quiz (spec section 1).
const QuizCard = dynamic(() => import('@/components/quiz/QuizCard'), { ssr: false });

/** Corner launcher (D-23). Sits above the consent bar and the mobile order bar (globals.css). */
export const QuizLauncher = () => {
  const t = useTranslations('quiz');
  const { open, openQuiz, launcherRef } = useQuizContext();

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => openQuiz('launcher')}
        className={buttonClasses({
          size: 'md',
          variant: 'secondary',
          className: 'QuizLauncher fixed right-4 z-40 md:right-8',
        })}
      >
        {t('launcher')}
      </button>
      {open && <QuizCard />}
    </>
  );
};
