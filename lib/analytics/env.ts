// When GA may run at all (P6-3): production collects; previews and local builds only with
// `?ga_debug=1`, which also turns on GA4 debug mode for DebugView. Consent is checked separately.

export type AnalyticsMode = 'off' | 'production' | 'debug';

export const DEBUG_KEY = 'thun-things.ga-debug';

interface ModeInput {
  gaId: string | undefined;
  /** Vercel's `VERCEL_ENV`, read on the server at build time. */
  vercelEnv: string | undefined;
  debugFlag: boolean;
}

export const analyticsMode = ({ gaId, vercelEnv, debugFlag }: ModeInput): AnalyticsMode => {
  if (!gaId) return 'off';
  if (debugFlag) return 'debug';
  return vercelEnv === 'production' ? 'production' : 'off';
};

type FlagStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** `?ga_debug=1` turns the flag on for the rest of the tab (sessionStorage). */
export const readDebugFlag = (search: string, storage: FlagStorage | undefined): boolean => {
  const requested = new URLSearchParams(search).get('ga_debug') === '1';
  try {
    if (requested) storage?.setItem(DEBUG_KEY, '1');
    return requested || storage?.getItem(DEBUG_KEY) === '1';
  } catch {
    return requested;
  }
};
