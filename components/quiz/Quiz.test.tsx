import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizLauncher } from '@/components/quiz/QuizLauncher';
import { QuizProvider, type QuizOptions } from '@/components/quiz/QuizProvider';
import en from '@/messages/en.json';
import { messages } from '@/test/renderWithIntl';
import { renderWithClientIntl } from '@/test/renderWithIntl';

const { quiz } = messages;

const OPTIONS: QuizOptions = {
  colors: [
    { id: 'black', label: 'Đen', hex: '#111111' },
    { id: 'white', label: 'Trắng ngà', hex: '#F5F5F2' },
  ],
  vibes: ['art', 'minimal'],
};

const product = (slug: string, name: string) => ({
  slug,
  name,
  priceLabel: '390.000 ₫',
  status: 'available',
  image: { width: 4, height: 5, alt: { vi: name, en: name } },
});

const RESULT = {
  match: 'exact',
  featured: product('dem-trang', 'Đêm Trắng'),
  more: [product('hem-sau', 'Hẻm Sau'), product('pho-cu', 'Phố Cũ'), product('am-ban', 'Âm Bản')],
};

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );

const renderQuiz = (options: QuizOptions = OPTIONS, locale: 'vi' | 'en' = 'vi') =>
  renderWithClientIntl(
    <QuizProvider options={options}>
      <QuizLauncher />
    </QuizProvider>,
    { locale },
  );

const openCard = async () => {
  await userEvent.click(screen.getByRole('button', { name: quiz.launcher }));
  // The card is loaded with next/dynamic on first open.
  return screen.findByRole('dialog', { name: quiz.title }, { timeout: 5_000 });
};

const requestBody = () =>
  JSON.parse(String((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body)) as Record<
    string,
    unknown
  >;

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('quiz card', () => {
  it('opens with focus on its heading and closes with Escape back to the launcher', async () => {
    renderQuiz();
    const card = await openCard();
    await waitFor(() =>
      expect(within(card).getByRole('heading', { name: quiz.stepColor })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: quiz.launcher })).toHaveFocus();
  });

  it('closes with the close button', async () => {
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('button', { name: quiz.close }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('goes colour → vibe → result and posts the answer', async () => {
    respond(RESULT);
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.continue }));
    await userEvent.click(within(card).getByRole('radio', { name: quiz.vibes.art }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    expect(
      await within(card).findByRole('heading', { name: quiz.resultTitle }),
    ).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Đêm Trắng' })).toHaveAttribute(
      'href',
      '/vi/products/dem-trang',
    );
    expect(requestBody()).toEqual({ locale: 'vi', color: 'black', vibe: 'art' });
  });

  it('skips the vibe step when the catalog has fewer than two vibes', async () => {
    respond(RESULT);
    renderQuiz({ ...OPTIONS, vibes: ['art'] });
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Trắng ngà' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    await within(card).findByRole('heading', { name: quiz.resultTitle });
    expect(requestBody()).toEqual({ locale: 'vi', color: 'white' });
  });

  it('reveals up to three more designs and starts over', async () => {
    respond(RESULT);
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.continue }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    await within(card).findByRole('heading', { name: quiz.resultTitle });
    expect(within(card).queryByRole('link', { name: 'Hẻm Sau' })).not.toBeInTheDocument();
    await userEvent.click(within(card).getByRole('button', { name: quiz.seeMore }));
    const more = within(card).getByRole('list', { name: quiz.moreTitle });
    expect(within(more).getAllByRole('link')).toHaveLength(3);
    await userEvent.click(within(card).getByRole('button', { name: quiz.restart }));
    expect(within(card).getByRole('heading', { name: quiz.stepColor })).toBeInTheDocument();
  });

  it('cannot continue without choosing a colour', async () => {
    renderQuiz();
    const card = await openCard();
    expect(within(card).getByRole('button', { name: quiz.continue })).toBeDisabled();
  });

  it('shows the closest design with a contact link when nothing matches', async () => {
    respond({ ...RESULT, match: 'none' });
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.continue }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    expect(await within(card).findByText(quiz.noMatch)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: quiz.noMatchContact })).toHaveAttribute(
      'href',
      '/vi/contact',
    );
  });

  it('shows an error with retry when the API fails, then recovers', async () => {
    const fetchMock = respond({ error: 'Too many requests', code: 'RATE_LIMITED' }, 429);
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.continue }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    expect(await within(card).findByRole('alert')).toHaveTextContent(quiz.error);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(RESULT), { headers: { 'content-type': 'application/json' } }),
    );
    await userEvent.click(within(card).getByRole('button', { name: quiz.retry }));
    expect(
      await within(card).findByRole('heading', { name: quiz.resultTitle }),
    ).toBeInTheDocument();
  });

  it('renders English copy', async () => {
    renderQuiz(OPTIONS, 'en');
    await userEvent.click(screen.getByRole('button', { name: en.quiz.launcher }));
    const card = await screen.findByRole('dialog', { name: en.quiz.title });
    expect(within(card).getByRole('heading', { name: en.quiz.stepColor })).toBeInTheDocument();
  });
});

describe('quiz events', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      'thun-things.consent',
      JSON.stringify({ version: 1, analytics: true, decidedAt: '2026-10-24T00:00:00.000Z' }),
    );
    window.gtag = vi.fn();
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.gtag;
  });

  const events = () =>
    vi
      .mocked(window.gtag!)
      .mock.calls.filter(([kind]) => kind === 'event')
      .map(([, name, params]) => [name, params]);

  it('tracks open, steps, completion and the result click with enum params only', async () => {
    respond(RESULT);
    renderQuiz();
    const card = await openCard();
    await userEvent.click(within(card).getByRole('radio', { name: 'Đen' }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.continue }));
    await userEvent.click(within(card).getByRole('radio', { name: quiz.vibes.art }));
    await userEvent.click(within(card).getByRole('button', { name: quiz.showResult }));
    await within(card).findByRole('heading', { name: quiz.resultTitle });
    await userEvent.click(within(card).getByRole('button', { name: quiz.seeMore }));
    await userEvent.click(within(card).getByRole('link', { name: 'Phố Cũ' }));
    expect(events()).toEqual([
      ['quiz_open', { source: 'launcher' }],
      ['quiz_step', { step: 'color', value: 'black' }],
      ['quiz_step', { step: 'vibe', value: 'art' }],
      ['quiz_complete', { color: 'black', vibe: 'art', match: 'exact' }],
      ['quiz_result_click', { product_id: 'pho-cu', position: 2 }],
    ]);
  });
});
