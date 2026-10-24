// Analytics consent (P6): stored in localStorage, never in a cookie of our own. A missing,
// unreadable or older record means "no decision yet", so the banner asks again.

export const CONSENT_KEY = 'thun-things.consent';
/** Bump when the categories change; everyone is asked again. */
export const CONSENT_VERSION = 1;

export interface ConsentRecord {
  version: typeof CONSENT_VERSION;
  analytics: boolean;
  decidedAt: string;
}

type ConsentStorage = Pick<Storage, 'getItem' | 'setItem'>;

const browserStorage = (): ConsentStorage | undefined =>
  typeof window === 'undefined' ? undefined : window.localStorage;

const isRecord = (value: unknown): value is ConsentRecord => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === CONSENT_VERSION &&
    typeof record.analytics === 'boolean' &&
    typeof record.decidedAt === 'string'
  );
};

export const readConsent = (storage: ConsentStorage | undefined = browserStorage()) => {
  try {
    const raw = storage?.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    // Private modes throw on storage access; corrupt JSON throws on parse.
    return null;
  }
};

export const writeConsent = (
  analytics: boolean,
  storage: ConsentStorage | undefined = browserStorage(),
  now: () => Date = () => new Date(),
): ConsentRecord => {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    analytics,
    decidedAt: now().toISOString(),
  };
  try {
    storage?.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Unavailable storage: the choice still applies for this page view.
  }
  return record;
};

const ANALYTICS_COOKIE = /^_ga(_[A-Za-z0-9]+)?$/;

/** Domains GA may have set its cookies on: the host and every parent with at least two labels. */
const cookieDomains = (hostname: string): string[] => {
  const labels = hostname.split('.');
  if (labels.length < 2) return [];
  return labels.slice(0, -1).map((_, index) => `.${labels.slice(index).join('.')}`);
};

/** Expires GA's `_ga` and `_ga_<id>` cookies after consent is withdrawn. */
export const clearAnalyticsCookies = (hostname: string = window.location.hostname) => {
  const names = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0]?.trim() ?? '')
    .filter((name) => ANALYTICS_COOKIE.test(name));
  for (const name of names) {
    document.cookie = `${name}=; max-age=0; path=/`;
    for (const domain of cookieDomains(hostname)) {
      document.cookie = `${name}=; max-age=0; path=/; domain=${domain}`;
    }
  }
};
