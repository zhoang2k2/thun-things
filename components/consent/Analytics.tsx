'use client';

import Script from 'next/script';
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { useConsent } from '@/components/consent/ConsentProvider';
import { clearAnalyticsCookies } from '@/lib/analytics/consent';
import { analyticsMode, readDebugFlag } from '@/lib/analytics/env';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const sessionStore = () => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

const noSubscription = () => () => {};
const useDebugFlag = () =>
  useSyncExternalStore(
    noSubscription,
    () => readDebugFlag(window.location.search, sessionStore()),
    () => false,
  );

// Consent Mode "Basic" (P6-4): this inline script and gtag.js are only rendered after the visitor
// accepted analytics, so no Google request happens before. Ad signals are always denied.
const initScript = (gaId: string, debug: boolean) => `
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(){ window.dataLayer.push(arguments); };
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)}${debug ? ', { debug_mode: true }' : ''});
`;

interface AnalyticsProps {
  /** `NEXT_PUBLIC_GA_ID`, validated as `G-…` by `lib/env`. */
  gaId: string | undefined;
  /** Vercel's `VERCEL_ENV` at build time. */
  vercelEnv: string | undefined;
}

export const Analytics = ({ gaId, vercelEnv }: AnalyticsProps) => {
  const { ready, analytics } = useConsent();
  const debugFlag = useDebugFlag();
  const mode = analyticsMode({ gaId, vercelEnv, debugFlag });
  const granted = useRef(false);

  // Revoking after accepting: deny storage for the already-loaded tag and drop its cookies.
  // Accepting again on the same page view re-grants without loading the tag twice.
  useEffect(() => {
    if (!ready) return;
    if (analytics && !granted.current) {
      granted.current = true;
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    } else if (!analytics && granted.current) {
      granted.current = false;
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
    }
  }, [ready, analytics]);

  if (!ready || !analytics || mode === 'off' || !gaId) return null;

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {initScript(gaId, mode === 'debug')}
      </Script>
      <Script
        id="ga-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
      />
    </>
  );
};
