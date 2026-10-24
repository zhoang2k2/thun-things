import { type ConsentRecord, readConsent, writeConsent } from '@/lib/analytics/consent';

// Browser-side consent store for useSyncExternalStore. The decision lives in localStorage; an
// in-memory copy keeps a choice made where storage throws (private modes) for the page view.
let memoryRecord: ConsentRecord | null = null;
const listeners = new Set<() => void>();

export const subscribeConsent = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Snapshots are strings so React can compare them. */
export const consentSnapshot = () => JSON.stringify(currentConsent());

/** The decision for this page view: the in-memory choice, else the stored one. */
export const currentConsent = (): ConsentRecord | null => memoryRecord ?? readConsent();

export const commitConsent = (analytics: boolean) => {
  memoryRecord = writeConsent(analytics);
  for (const listener of listeners) listener();
};

/** Test-only: forget the in-memory decision between tests. */
export const resetConsentStoreForTests = () => {
  memoryRecord = null;
};
