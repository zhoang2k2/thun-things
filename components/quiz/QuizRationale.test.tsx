import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { QuizLauncher } from '@/components/quiz/QuizLauncher';
import { QuizProvider, type QuizOptions } from '@/components/quiz/QuizProvider';
import { RATIONALE_TIMEOUT_MS } from '@/components/quiz/useQuiz';
import { messages, renderWithClientIntl } from '@/test/renderWithIntl';

const { quiz } = messages;
const OPTIONS: QuizOptions = { colors: [{ id: 'black', label: 'Đen', hex: '#111111' }], vibes: [] };
const RESULT = {
  match: 'color',
  featured: {
    slug: 'dem-trang',
    name: 'Đêm Trắng',
    priceLabel: '390.000 ₫',
    status: 'available',
    image: { width: 4, height: 5, alt: { vi: 'Đêm Trắng', en: 'Đêm Trắng' } },
  },
  more: [],
};
const TEXT = 'Màu đen tối giản hợp với gu của bạn.';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

type ExplainReply = Response | 'hang' | 'network';

/** Quiz API answers RESULT; the explain call answers `explain`. Returns the explain signals. */
const mockApi = (explain: ExplainReply) => {
  const signals: AbortSignal[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.endsWith('/api/quiz/recommend')) return json(RESULT);
    signals.push(init!.signal!);
    if (explain === 'network') throw new TypeError('offline');
    if (explain === 'hang') {
      return new Promise<Response>((_, reject) => {
        init!.signal!.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    }
    return explain;
  });
  return signals;
};

const explainCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith('/api/quiz/explain'));

const showResult = async () => {
  renderWithClientIntl(
    <QuizProvider options={OPTIONS}>
      <QuizLauncher />
    </QuizProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: quiz.launcher }));
  const card = await screen.findByRole('dialog', { name: quiz.title }, { timeout: 5_000 });
  await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
  await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
  await within(card).findByRole('heading', { name: quiz.resultTitle });
  return card;
};

const skeleton = (card: HTMLElement) => card.querySelector('.QuizRationale__skeleton');

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
  delete window.gtag;
});

describe('quiz rationale', () => {
  it('asks for the featured product and shows the text with an AI label', async () => {
    mockApi(json({ text: TEXT, provider: 'gemini' }));
    const card = await showResult();
    expect(await within(card).findByText(TEXT)).toBeInTheDocument();
    expect(within(card).getByText(quiz.rationaleLabel)).toBeInTheDocument();
    expect(skeleton(card)).toBeNull();
    const [, init] = explainCalls()[0]!;
    expect(JSON.parse(String(init!.body))).toEqual({
      locale: 'vi',
      color: 'black',
      slug: 'dem-trang',
    });
  });

  it('shows a hidden skeleton while waiting', async () => {
    mockApi('hang');
    const card = await showResult();
    expect(skeleton(card)).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['204', () => new Response(null, { status: 204 })],
    ['429', () => json({ error: 'Too many requests', code: 'RATE_LIMITED' }, 429)],
    ['a body without text', () => json({ provider: 'gemini' })],
  ])('hides quietly on %s', async (_name, reply) => {
    mockApi(reply());
    const card = await showResult();
    await waitFor(() => expect(skeleton(card)).toBeNull());
    expect(within(card).queryByText(quiz.rationaleLabel)).not.toBeInTheDocument();
    expect(within(card).queryByRole('alert')).not.toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Đêm Trắng' })).toBeInTheDocument();
  });

  it('hides quietly on a network error', async () => {
    mockApi('network');
    const card = await showResult();
    await waitFor(() => expect(skeleton(card)).toBeNull());
    expect(within(card).queryByRole('alert')).not.toBeInTheDocument();
  });

  it(`gives up after ${RATIONALE_TIMEOUT_MS} ms`, async () => {
    // Real time keeps flowing (dynamic import, user events); the 4 s abort can be jumped to.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const signals = mockApi('hang');
    const card = await showResult();
    expect(signals[0]!.aborted).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RATIONALE_TIMEOUT_MS);
    });
    expect(signals[0]!.aborted).toBe(true);
    expect(skeleton(card)).toBeNull();
  });

  it('aborts the request on start over and on close', async () => {
    const signals = mockApi('hang');
    const card = await showResult();
    await userEvent.click(within(card).getByRole('button', { name: quiz.restart }));
    expect(signals[0]!.aborted).toBe(true);
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    await within(card).findByRole('heading', { name: quiz.resultTitle });
    await userEvent.click(within(card).getByRole('button', { name: quiz.close }));
    expect(signals[1]!.aborted).toBe(true);
  });

  it('tracks the provider and product once, never the text', async () => {
    window.localStorage.setItem(
      'thun-things.consent',
      JSON.stringify({ version: 1, analytics: true, decidedAt: '2026-10-24T00:00:00.000Z' }),
    );
    window.gtag = vi.fn();
    mockApi(json({ text: TEXT, provider: 'anthropic' }));
    const card = await showResult();
    await within(card).findByText(TEXT);
    const calls = vi
      .mocked(window.gtag)
      .mock.calls.filter(([kind, name]) => kind === 'event' && name === 'quiz_rationale_shown');
    expect(calls).toEqual([
      ['event', 'quiz_rationale_shown', { provider: 'anthropic', product_id: 'dem-trang' }],
    ]);
    expect(JSON.stringify(vi.mocked(window.gtag).mock.calls)).not.toContain(TEXT);
  });
});
