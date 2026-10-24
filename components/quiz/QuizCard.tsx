'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';
import { type KeyboardEvent, useEffect, useId, useRef } from 'react';

import { choiceClasses } from '@/components/forms/Field';
import { QuizResult } from '@/components/quiz/QuizResult';
import { useQuizContext } from '@/components/quiz/QuizProvider';
import { useQuiz } from '@/components/quiz/useQuiz';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const HEADING = 'QuizCard__heading text-lg leading-7 font-bold focus-visible:outline-none';
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Choice = ({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <label className="QuizCard__choice flex min-h-12 items-center gap-3">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className={cn(choiceClasses, 'checked:border-[7px]')}
    />
    {children}
  </label>
);

/** Small non-modal quiz card (D-23, O-03); loaded on first open. */
export default function QuizCard() {
  const t = useTranslations('quiz');
  const { options, closeQuiz } = useQuizContext();
  const vibeStep = options.vibes.length >= 2;
  const quiz = useQuiz({ vibeStep });
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const headingId = useId();
  // Vibe tags are catalog data; a tag without a message falls back to the tag itself.
  const vibeLabel = (vibe: string) => {
    const key = `vibes.${vibe}` as 'vibes.art';
    return t.has(key) ? t(key) : vibe;
  };

  // Each step moves focus to its heading so screen readers announce where they are.
  useEffect(() => {
    headingRef.current?.focus();
  }, [quiz.step.name]);

  // Escape closes; Tab stays inside the card while it is open.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeQuiz();
      return;
    }
    if (event.key !== 'Tab' || !cardRef.current) return;
    const focusable = [...cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const heading = (text: string) => (
    <h2 ref={headingRef} id={headingId} tabIndex={-1} className={HEADING}>
      {text}
    </h2>
  );

  const body = (() => {
    switch (quiz.step.name) {
      case 'color':
        return (
          <>
            {heading(t('stepColor'))}
            <div role="radiogroup" aria-labelledby={headingId} className="flex flex-col">
              {options.colors.map((color) => (
                <Choice
                  key={color.id}
                  name="quiz-color"
                  value={color.id}
                  checked={quiz.answer.color === color.id}
                  onChange={quiz.chooseColor}
                >
                  <span
                    aria-hidden="true"
                    className="QuizCard__swatch border-line size-6 shrink-0 border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.label}</span>
                </Choice>
              ))}
            </div>
            <Button size="md" disabled={!quiz.answer.color} onClick={quiz.confirmColor}>
              {vibeStep ? t('continue') : t('showResult')}
            </Button>
          </>
        );
      case 'vibe':
        return (
          <>
            {heading(t('stepVibe'))}
            <div role="radiogroup" aria-labelledby={headingId} className="flex flex-col">
              {options.vibes.map((vibe) => (
                <Choice
                  key={vibe}
                  name="quiz-vibe"
                  value={vibe}
                  checked={quiz.answer.vibe === vibe}
                  onChange={quiz.chooseVibe}
                >
                  <span>{vibeLabel(vibe)}</span>
                </Choice>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="md" onClick={quiz.confirmVibe}>
                {t('showResult')}
              </Button>
              <Button size="md" variant="secondary" onClick={quiz.back}>
                {t('back')}
              </Button>
            </div>
          </>
        );
      case 'loading':
        return (
          <>
            {heading(t('title'))}
            <p role="status" className="text-ink-muted text-sm">
              {t('loading')}
            </p>
            <div aria-hidden="true" className="bg-placeholder aspect-[4/5] w-24" />
          </>
        );
      case 'error':
        return (
          <>
            {heading(t('title'))}
            <p role="alert" className="text-error text-sm font-medium">
              {t('error')}
            </p>
            <Button size="md" onClick={quiz.retry}>
              {t('retry')}
            </Button>
          </>
        );
      case 'result':
        return (
          <>
            {heading(t('resultTitle'))}
            <QuizResult
              result={quiz.step.result}
              rationale={quiz.rationale}
              onNavigate={closeQuiz}
            />
            <Button size="md" variant="ghost" className="self-start" onClick={quiz.restart}>
              {t('restart')}
            </Button>
          </>
        );
    }
  })();

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      className="QuizCard bg-canvas border-ink fixed right-4 z-50 flex max-h-[70vh] w-[min(360px,calc(100vw-2rem))] flex-col gap-4 overflow-y-auto border p-6 md:right-8"
    >
      <div className="flex items-start justify-between gap-4">
        <p id={titleId} className="text-ink-muted text-xs tracking-wide uppercase">
          {t('title')}
        </p>
        <button
          type="button"
          onClick={closeQuiz}
          aria-label={t('close')}
          className="QuizCard__close focus-visible:outline-ink -m-2 inline-flex size-10 items-center justify-center focus-visible:outline-2"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} aria-hidden="true" />
        </button>
      </div>
      {body}
    </div>
  );
}
