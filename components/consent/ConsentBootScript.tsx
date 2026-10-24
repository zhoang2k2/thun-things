import { CONSENT_KEY, CONSENT_VERSION } from '@/lib/analytics/consent';

// Runs while the HTML is parsed, before the consent bar paints: a visitor who already decided
// gets `data-consent-decided` on <html>, which hides the prerendered bar (globals.css). Visitors
// without a decision see the bar in the first paint instead of after hydration (P6, LCP).
export const consentBootScript = `try{var r=localStorage.getItem(${JSON.stringify(
  CONSENT_KEY,
)});var c=r&&JSON.parse(r);if(c&&c.version===${CONSENT_VERSION}&&typeof c.analytics==='boolean')document.documentElement.setAttribute('data-consent-decided','')}catch(e){}`;

// Without JavaScript GA can never load and the bar's buttons cannot work, so the bar is hidden.
export const ConsentBootScript = () => (
  <>
    <script id="consent-boot" dangerouslySetInnerHTML={{ __html: consentBootScript }} />
    <noscript>
      <style>{'.ConsentBanner { display: none; }'}</style>
    </noscript>
  </>
);
