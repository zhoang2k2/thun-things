import { beforeEach, describe, expect, it } from 'vitest';

import {
  BUBBLE,
  bubbleAllowedOn,
  nextBubbleDelay,
  readBubbleState,
  recordBubbleDismissed,
  recordBubbleShown,
} from '@/lib/recommend/bubble';

beforeEach(() => {
  window.sessionStorage.clear();
});

describe('bubble schedule', () => {
  it('first appears after 20 s, then every 45 s, at most 3 times', () => {
    expect(BUBBLE).toMatchObject({ firstDelayMs: 20_000, intervalMs: 45_000, maxShows: 3 });
    expect(nextBubbleDelay({ shown: 0, dismissed: false })).toBe(20_000);
    expect(nextBubbleDelay({ shown: 1, dismissed: false })).toBe(45_000);
    expect(nextBubbleDelay({ shown: 2, dismissed: false })).toBe(45_000);
    expect(nextBubbleDelay({ shown: 3, dismissed: false })).toBeNull();
  });

  it('stays silent after a dismissal', () => {
    expect(nextBubbleDelay({ shown: 1, dismissed: true })).toBeNull();
  });
});

describe('bubble session state', () => {
  it('counts appearances and dismissal for the browser session', () => {
    expect(readBubbleState()).toEqual({ shown: 0, dismissed: false });
    expect(recordBubbleShown()).toEqual({ shown: 1, dismissed: false });
    expect(recordBubbleShown()).toEqual({ shown: 2, dismissed: false });
    expect(recordBubbleDismissed()).toEqual({ shown: 2, dismissed: true });
    expect(readBubbleState()).toEqual({ shown: 2, dismissed: true });
  });

  it('treats corrupt storage as a fresh session', () => {
    window.sessionStorage.setItem('thun-things.quiz-bubble', '{oops');
    expect(readBubbleState()).toEqual({ shown: 0, dismissed: false });
  });
});

describe('bubbleAllowedOn', () => {
  it.each([
    ['/', true],
    ['/products/hoang-hon-01', true],
    ['/about', true],
    ['/contact', false],
    ['/contact/sent', false],
    ['/contact/retry', false],
    ['/policy/privacy', false],
    ['/policy/returns', false],
  ])('%s → %s', (pathname, allowed) => {
    expect(bubbleAllowedOn(pathname)).toBe(allowed);
  });
});
