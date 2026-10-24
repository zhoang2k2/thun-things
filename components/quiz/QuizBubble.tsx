'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useQuizContext } from '@/components/quiz/QuizProvider';
import { usePathname } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/events';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import {
  BUBBLE,
  bubbleAllowedOn,
  nextBubbleDelay,
  readBubbleState,
  recordBubbleDismissed,
  recordBubbleShown,
} from '@/lib/recommend/bubble';

const FOCUS = 'focus-visible:outline-ink focus-visible:outline-2 focus-visible:outline-offset-2';

/**
 * Speech bubble inviting visitors to the quiz (D-24 with the D-24a/O-04 guardrails): first after
 * 20 s, then every 45 s, at most 3 times per session; silent after dismissal, while the quiz is
 * open, on Contact/Policy pages and under reduced motion. Announced politely; never takes focus.
 */
export const QuizBubble = () => {
  const t = useTranslations('quiz');
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const { open, openQuiz } = useQuizContext();
  const [visible, setVisible] = useState(false);
  const allowed = bubbleAllowedOn(pathname) && !reducedMotion && !open;

  // Schedule the next appearance while allowed; navigation or opening the quiz cancels it.
  useEffect(() => {
    if (!allowed || visible) return;
    const delay = nextBubbleDelay(readBubbleState());
    if (delay === null) return;
    const timer = window.setTimeout(() => {
      const { shown } = recordBubbleShown();
      setVisible(true);
      trackEvent('quiz_bubble_shown', { count: shown });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [allowed, visible]);

  // Each appearance hides itself after a while.
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), BUBBLE.visibleMs);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const shown = visible && allowed;

  return (
    // The live region stays mounted so each appearance is announced. No `status` role: pages keep
    // their own status messages (form confirmations) unambiguous.
    <div aria-live="polite" className="QuizBubble__region">
      {shown && (
        <div className="QuizBubble bg-canvas border-ink fixed right-4 z-40 flex max-w-[min(320px,calc(100vw-2rem))] items-start gap-2 border p-3 md:right-8">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              openQuiz('bubble');
            }}
            className={`QuizBubble__text text-left text-sm leading-6 ${FOCUS}`}
          >
            {t('bubble')}
          </button>
          <button
            type="button"
            aria-label={t('bubbleClose')}
            onClick={() => {
              recordBubbleDismissed();
              setVisible(false);
              trackEvent('quiz_bubble_dismiss', {});
            }}
            className={`QuizBubble__close -m-1 inline-flex size-8 shrink-0 items-center justify-center ${FOCUS}`}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
