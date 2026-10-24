import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { CONSENT_KEY } from '@/lib/analytics/consent';
import { resetConsentStoreForTests } from '@/lib/analytics/consentStore';
import { type AnalyticsEvent, trackEvent } from '@/lib/analytics/events';

const grant = (analytics: boolean) =>
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ version: 1, analytics, decidedAt: '2026-10-24T00:00:00.000Z' }),
  );

beforeEach(() => {
  window.localStorage.clear();
  resetConsentStoreForTests();
  window.gtag = vi.fn();
});

afterEach(() => {
  delete window.gtag;
});

describe('trackEvent', () => {
  it('sends the event with its params when analytics is granted and gtag is loaded', () => {
    grant(true);
    trackEvent('locale_switch', { from: 'vi', to: 'en' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'locale_switch', { from: 'vi', to: 'en' });
  });

  it('is a no-op without consent', () => {
    trackEvent('locale_switch', { from: 'vi', to: 'en' });
    grant(false);
    trackEvent('locale_switch', { from: 'vi', to: 'en' });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('is a no-op when GA is not loaded', () => {
    grant(true);
    delete window.gtag;
    expect(() => trackEvent('locale_switch', { from: 'vi', to: 'en' })).not.toThrow();
  });
});

describe('event params', () => {
  it('allow no personal data keys', () => {
    type ParamKeys = { [K in keyof AnalyticsEvent]: keyof AnalyticsEvent[K] }[keyof AnalyticsEvent];
    expectTypeOf<ParamKeys>().toEqualTypeOf<
      'product_id' | 'status' | 'locale' | 'purpose' | 'form' | 'from' | 'to'
    >();
  });
});
