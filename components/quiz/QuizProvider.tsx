'use client';

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface QuizColorOption {
  id: string;
  /** Already in the page locale. */
  label: string;
  hex: string;
}

export interface QuizOptions {
  colors: QuizColorOption[];
  vibes: string[];
}

export type QuizSource = 'launcher' | 'bubble';

interface QuizState {
  options: QuizOptions;
  open: boolean;
  source: QuizSource;
  openQuiz(source: QuizSource): void;
  closeQuiz(): void;
  launcherRef: RefObject<HTMLButtonElement | null>;
}

const QuizContext = createContext<QuizState | null>(null);

/** Shared open state for the launcher, the card and the bubble (P7). */
export const QuizProvider = ({
  options,
  children,
}: {
  options: QuizOptions;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<QuizSource>('launcher');
  const launcherRef = useRef<HTMLButtonElement>(null);

  const openQuiz = useCallback((from: QuizSource) => {
    setSource(from);
    setOpen(true);
  }, []);

  const closeQuiz = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  const value = useMemo(
    () => ({ options, open, source, openQuiz, closeQuiz, launcherRef }),
    [options, open, source, openQuiz, closeQuiz],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuizContext = (): QuizState => {
  const state = useContext(QuizContext);
  if (!state) throw new Error('useQuizContext must be used inside <QuizProvider>');
  return state;
};
