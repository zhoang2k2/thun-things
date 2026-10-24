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

import type { ConsentRecord } from '@/lib/analytics/consent';
import { commitConsent, consentSnapshot, subscribeConsent } from '@/lib/analytics/consentStore';

// The server snapshot marks "not hydrated yet": nothing consent-driven renders before the client
// has read the stored decision.
const SERVER_SNAPSHOT = 'server';
const getServerSnapshot = () => SERVER_SNAPSHOT;

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
  const snapshot = useSyncExternalStore(subscribeConsent, consentSnapshot, getServerSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const ready = snapshot !== SERVER_SNAPSHOT;
  const record = useMemo(
    () => (ready ? (JSON.parse(snapshot) as ConsentRecord | null) : null),
    [ready, snapshot],
  );

  const save = useCallback((analytics: boolean) => {
    commitConsent(analytics);
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
