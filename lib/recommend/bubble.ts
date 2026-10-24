// Quiz invitation bubble (D-24, D-24a, O-04): when it may appear and how often. The counter
// lives in sessionStorage so the cap holds across pages for the browser session.

export const BUBBLE = {
  firstDelayMs: 20_000,
  intervalMs: 45_000,
  maxShows: 3,
  /** How long each appearance stays before hiding itself. */
  visibleMs: 10_000,
} as const;

const STORAGE_KEY = 'thun-things.quiz-bubble';

export interface BubbleState {
  shown: number;
  dismissed: boolean;
}

const FRESH: BubbleState = { shown: 0, dismissed: false };

const session = () => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

export const readBubbleState = (): BubbleState => {
  try {
    const raw = session()?.getItem(STORAGE_KEY);
    if (!raw) return FRESH;
    const parsed = JSON.parse(raw) as Partial<BubbleState>;
    return typeof parsed.shown === 'number' && typeof parsed.dismissed === 'boolean'
      ? { shown: parsed.shown, dismissed: parsed.dismissed }
      : FRESH;
  } catch {
    return FRESH;
  }
};

const write = (state: BubbleState): BubbleState => {
  try {
    session()?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: the cap then holds for this page only.
  }
  return state;
};

export const recordBubbleShown = () => {
  const state = readBubbleState();
  return write({ ...state, shown: state.shown + 1 });
};

export const recordBubbleDismissed = () => write({ ...readBubbleState(), dismissed: true });

/** Milliseconds until the next appearance, or null when the bubble should stay silent. */
export const nextBubbleDelay = ({ shown, dismissed }: BubbleState): number | null => {
  if (dismissed || shown >= BUBBLE.maxShows) return null;
  return shown === 0 ? BUBBLE.firstDelayMs : BUBBLE.intervalMs;
};

const SILENT_PREFIXES = ['/contact', '/policy'];

/** `pathname` without the locale prefix. Contact (incl. result pages) and Policy stay quiet. */
export const bubbleAllowedOn = (pathname: string): boolean =>
  !SILENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
