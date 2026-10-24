'use client';

import { useLocale } from 'next-intl';
import { useCallback, useState } from 'react';

import { trackEvent } from '@/lib/analytics/events';
import type { QuizRecommendation } from '@/lib/recommend/recommend';

export type QuizStep =
  | { name: 'color' }
  | { name: 'vibe' }
  | { name: 'loading' }
  | { name: 'result'; result: QuizRecommendation }
  | { name: 'error' };

interface QuizAnswerState {
  color?: string;
  vibe?: string;
}

/** Colour → vibe (skipped with fewer than two vibes) → result, fetched from the quiz API. */
export const useQuiz = ({ vibeStep }: { vibeStep: boolean }) => {
  const locale = useLocale();
  const [step, setStep] = useState<QuizStep>({ name: 'color' });
  const [answer, setAnswer] = useState<QuizAnswerState>({});

  const fetchResult = useCallback(
    async (final: QuizAnswerState) => {
      setStep({ name: 'loading' });
      try {
        const response = await fetch('/api/quiz/recommend', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            locale,
            color: final.color,
            ...(vibeStep && final.vibe ? { vibe: final.vibe } : {}),
          }),
        });
        if (!response.ok) throw new Error(`quiz ${response.status}`);
        const result = (await response.json()) as QuizRecommendation;
        setStep({ name: 'result', result });
        if (final.color) {
          trackEvent('quiz_complete', {
            color: final.color,
            ...(vibeStep && final.vibe ? { vibe: final.vibe } : {}),
            match: result.match,
          });
        }
      } catch {
        setStep({ name: 'error' });
      }
    },
    [locale, vibeStep],
  );

  return {
    step,
    answer,
    chooseColor: (color: string) => setAnswer((current) => ({ ...current, color })),
    chooseVibe: (vibe: string) => setAnswer((current) => ({ ...current, vibe })),
    confirmColor: () => {
      if (!answer.color) return;
      trackEvent('quiz_step', { step: 'color', value: answer.color });
      if (vibeStep) setStep({ name: 'vibe' });
      else void fetchResult(answer);
    },
    confirmVibe: () => {
      if (answer.vibe) trackEvent('quiz_step', { step: 'vibe', value: answer.vibe });
      void fetchResult(answer);
    },
    back: () => setStep({ name: 'color' }),
    retry: () => fetchResult(answer),
    restart: () => {
      setAnswer({});
      setStep({ name: 'color' });
    },
  };
};
