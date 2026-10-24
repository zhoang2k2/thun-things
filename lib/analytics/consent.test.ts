import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearAnalyticsCookies,
  CONSENT_KEY,
  CONSENT_VERSION,
  readConsent,
  writeConsent,
} from '@/lib/analytics/consent';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    raw: data,
  };
};

const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('readConsent', () => {
  it('returns null without a stored decision', () => {
    expect(readConsent(memoryStorage())).toBeNull();
  });

  it('returns null for corrupt or older records', () => {
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: '{not json' }))).toBeNull();
    expect(
      readConsent(
        memoryStorage({
          [CONSENT_KEY]: JSON.stringify({ version: 0, analytics: true, decidedAt: 'x' }),
        }),
      ),
    ).toBeNull();
    expect(
      readConsent(
        memoryStorage({ [CONSENT_KEY]: JSON.stringify({ version: 1, analytics: 'yes' }) }),
      ),
    ).toBeNull();
  });

  it('returns null when storage throws (private mode)', () => {
    expect(readConsent(throwingStorage)).toBeNull();
  });

  it('reads a valid record', () => {
    const record = {
      version: CONSENT_VERSION,
      analytics: true,
      decidedAt: '2026-10-24T00:00:00.000Z',
    };
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: JSON.stringify(record) }))).toEqual(record);
  });
});

describe('writeConsent', () => {
  it('persists and returns the record', () => {
    const storage = memoryStorage();
    const record = writeConsent(false, storage, () => new Date('2026-10-24T01:00:00Z'));
    expect(record).toEqual({
      version: CONSENT_VERSION,
      analytics: false,
      decidedAt: '2026-10-24T01:00:00.000Z',
    });
    expect(readConsent(storage)).toEqual(record);
  });

  it('still returns the record when storage throws', () => {
    expect(writeConsent(true, throwingStorage).analytics).toBe(true);
  });
});

describe('clearAnalyticsCookies', () => {
  afterEach(() => {
    for (const name of ['_ga', '_ga_ABC123', 'keep']) {
      document.cookie = `${name}=; max-age=0; path=/`;
    }
  });

  it('removes _ga cookies and keeps others', () => {
    document.cookie = '_ga=GA1.1.1; path=/';
    document.cookie = '_ga_ABC123=GS1.1; path=/';
    document.cookie = 'keep=1; path=/';
    clearAnalyticsCookies();
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toContain('keep=1');
  });

  it('expires the cookies on the parent domain too', () => {
    const writes: string[] = [];
    const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
      writes.push(value);
    });
    vi.spyOn(document, 'cookie', 'get').mockReturnValue('_ga=1');
    clearAnalyticsCookies('shop.thunthings.vn');
    expect(writes).toContain('_ga=; max-age=0; path=/; domain=.thunthings.vn');
    expect(writes).toContain('_ga=; max-age=0; path=/; domain=.shop.thunthings.vn');
    spy.mockRestore();
  });
});
