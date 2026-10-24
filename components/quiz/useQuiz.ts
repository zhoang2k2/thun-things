'use client';

import { useLocale } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

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

/** AI rationale under the result (P8): optional, so every failure simply hides it. */
export type QuizRationale =
  | { status: 'idle' | 'loading' | 'hidden' }
  | { status: 'shown'; text: string; provider: 'gemini' | 'anthropic' };

export const RATIONALE_TIMEOUT_MS = 4_000;

const isRationale = (body: unknown): body is { text: string; provider: 'gemini' | 'anthropic' } => {
  const value = body as { text?: unknown; provider?: unknown } | null;
  return (
    typeof value?.text === 'string' &&
    value.text.length > 0 &&
    (value.provider === 'gemini' || value.provider === 'anthropic')
  );
};

/** Colour → vibe (skipped with fewer than two vibes) → result, fetched from the quiz API. */
export const useQuiz = ({ vibeStep }: { vibeStep: boolean }) => {
  const locale = useLocale();
  const [step, setStep] = useState<QuizStep>({ name: 'color' });
  const [answer, setAnswer] = useState<QuizAnswerState>({});
  const [rationale, setRationale] = useState<QuizRationale>({ status: 'idle' });
  const rationaleRequest = useRef<AbortController | null>(null);

  const cancelRationale = useCallback(() => {
    rationaleRequest.current?.abort();
    rationaleRequest.current = null;
    setRationale({ status: 'idle' });
  }, []);

  // Closing the card unmounts the quiz: drop any pending rationale.
  useEffect(() => () => rationaleRequest.current?.abort(), []);

  const fetchRationale = useCallback(
    async (final: QuizAnswerState, slug: string) => {
      rationaleRequest.current?.abort();
      const controller = new AbortController();
      rationaleRequest.current = controller;
      const timer = window.setTimeout(() => controller.abort(), RATIONALE_TIMEOUT_MS);
      setRationale({ status: 'loading' });
      try {
        const response = await fetch('/api/quiz/explain', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            locale,
            color: final.color,
            ...(vibeStep && final.vibe ? { vibe: final.vibe } : {}),
            slug,
          }),
          signal: controller.signal,
        });
        const body: unknown = response.status === 200 ? await response.json() : null;
        if (controller.signal.aborted) return;
        if (isRationale(body)) {
          setRationale({ status: 'shown', text: body.text, provider: body.provider });
          trackEvent('quiz_rationale_shown', { provider: body.provider, product_id: slug });
        } else {
          setRationale({ status: 'hidden' });
        }
      } catch {
        if (rationaleRequest.current === controller) setRationale({ status: 'hidden' });
      } finally {
        window.clearTimeout(timer);
        if (rationaleRequest.current === controller) rationaleRequest.current = null;
      }
    },
    [locale, vibeStep],
  );

  const fetchResult = useCallback(
    async (final: QuizAnswerState) => {
      cancelRationale();
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
          void fetchRationale(final, result.featured.slug);
        }
      } catch {
        setStep({ name: 'error' });
      }
    },
    [cancelRationale, fetchRationale, locale, vibeStep],
  );

  return {
    step,
    answer,
    rationale,
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
      cancelRationale();
      setAnswer({});
      setStep({ name: 'color' });
    },
  };
};
