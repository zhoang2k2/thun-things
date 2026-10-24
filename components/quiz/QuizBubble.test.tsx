import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizBubble } from '@/components/quiz/QuizBubble';
import { QuizLauncher } from '@/components/quiz/QuizLauncher';
import { QuizProvider } from '@/components/quiz/QuizProvider';
import { messages, renderWithClientIntl } from '@/test/renderWithIntl';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('@/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/navigation')>()),
  usePathname: () => nav.pathname,
}));

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('@/lib/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => motion.reduced,
}));

const { quiz } = messages;
const OPTIONS = { colors: [{ id: 'black', label: 'Đen', hex: '#111111' }], vibes: [] };

const renderBubble = () =>
  renderWithClientIntl(
    <QuizProvider options={OPTIONS}>
      <QuizLauncher />
      <QuizBubble />
    </QuizProvider>,
  );

const bubble = () => screen.queryByText(quiz.bubble);
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  nav.pathname = '/';
  motion.reduced = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('QuizBubble', () => {
  // React re-renders between timer stages, so the clock moves one stage per call.
  const cycle = () => {
    advance(10_000); // hide
    advance(45_000); // next appearance
  };

  it('appears after 20 s, hides after 10 s, returns every 45 s, at most 3 times', () => {
    renderBubble();
    advance(19_999);
    expect(bubble()).not.toBeInTheDocument();
    advance(1);
    expect(bubble()).toBeInTheDocument();
    advance(10_000);
    expect(bubble()).not.toBeInTheDocument();
    advance(45_000);
    expect(bubble()).toBeInTheDocument();
    cycle();
    expect(bubble()).toBeInTheDocument();
    cycle();
    expect(bubble()).not.toBeInTheDocument();
    advance(200_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it('keeps the cap across remounts within the session', () => {
    const { unmount } = renderBubble();
    advance(20_000);
    cycle();
    cycle();
    advance(10_000);
    unmount();
    renderBubble();
    advance(200_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it('stays silent for the session after dismissal', () => {
    renderBubble();
    advance(20_000);
    fireEvent.click(screen.getByRole('button', { name: quiz.bubbleClose }));
    expect(bubble()).not.toBeInTheDocument();
    advance(500_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it('opens the quiz when clicked', async () => {
    renderBubble();
    advance(20_000);
    fireEvent.click(screen.getByRole('button', { name: quiz.bubble }));
    vi.useRealTimers();
    expect(
      await screen.findByRole('dialog', { name: quiz.title }, { timeout: 5_000 }),
    ).toBeInTheDocument();
    expect(bubble()).not.toBeInTheDocument();
  });

  it('does not appear while the quiz is open', () => {
    renderBubble();
    fireEvent.click(screen.getByRole('button', { name: quiz.launcher }));
    advance(100_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it.each(['/contact', '/contact/sent', '/policy/privacy'])('stays quiet on %s', (pathname) => {
    nav.pathname = pathname;
    renderBubble();
    advance(100_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it('stays quiet under reduced motion', () => {
    motion.reduced = true;
    renderBubble();
    advance(100_000);
    expect(bubble()).not.toBeInTheDocument();
  });

  it('is announced politely and never takes focus', () => {
    renderBubble();
    const before = document.activeElement;
    advance(20_000);
    expect(screen.getByText(quiz.bubble).closest('[aria-live="polite"]')).not.toBeNull();
    expect(document.activeElement).toBe(before);
  });
});
