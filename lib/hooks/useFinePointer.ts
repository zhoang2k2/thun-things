'use client';

import { useSyncExternalStore } from 'react';

// A mouse or trackpad that hovers; false on touch and on the server.
const QUERY = '(hover: hover) and (pointer: fine)';

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

export const useFinePointer = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
