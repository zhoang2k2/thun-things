'use client';

import { useLocale } from 'next-intl';
import { useCallback, useState } from 'react';

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
        setStep({ name: 'result', result: (await response.json()) as QuizRecommendation });
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
    confirmColor: () => (vibeStep ? setStep({ name: 'vibe' }) : fetchResult(answer)),
    confirmVibe: () => fetchResult(answer),
    back: () => setStep({ name: 'color' }),
    retry: () => fetchResult(answer),
    restart: () => {
      setAnswer({});
      setStep({ name: 'color' });
    },
  };
};
