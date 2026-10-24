'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { type ConsentRecord, readConsent, writeConsent } from '@/lib/analytics/consent';

// The decision lives in localStorage; this store adds an in-memory copy so a choice made where
// storage throws (private modes) still holds for the rest of the page view.
let memoryRecord: ConsentRecord | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Snapshots are strings so React can compare them; the server snapshot marks "not hydrated yet".
const SERVER_SNAPSHOT = 'server';
const getSnapshot = () => JSON.stringify(memoryRecord ?? readConsent());
const getServerSnapshot = () => SERVER_SNAPSHOT;

const commit = (analytics: boolean) => {
  memoryRecord = writeConsent(analytics);
  for (const listener of listeners) listener();
};

/** Test-only: forget the in-memory decision between tests. */
export const resetConsentStoreForTests = () => {
  memoryRecord = null;
};

interface ConsentState {
  /** False until the client has read the stored decision; nothing consent-driven renders before. */
  ready: boolean;
  decided: boolean;
  analytics: boolean;
  settingsOpen: boolean;
  accept(): void;
  reject(): void;
  save(analytics: boolean): void;
  openSettings(): void;
  closeSettings(): void;
}

const ConsentContext = createContext<ConsentState | null>(null);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const ready = snapshot !== SERVER_SNAPSHOT;
  const record = useMemo(
    () => (ready ? (JSON.parse(snapshot) as ConsentRecord | null) : null),
    [ready, snapshot],
  );

  const save = useCallback((analytics: boolean) => {
    commit(analytics);
    setSettingsOpen(false);
  }, []);

  const value = useMemo<ConsentState>(
    () => ({
      ready,
      decided: record !== null,
      analytics: record?.analytics ?? false,
      settingsOpen,
      accept: () => save(true),
      reject: () => save(false),
      save,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [ready, record, settingsOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useConsent = (): ConsentState => {
  const state = useContext(ConsentContext);
  if (!state) throw new Error('useConsent must be used inside <ConsentProvider>');
  return state;
};
