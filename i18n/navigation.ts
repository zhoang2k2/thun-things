import { createNavigation } from 'next-intl/navigation';

import { routing } from '@/i18n/routing';

/** Locale-aware wrappers around Next's navigation APIs: hrefs are app paths without a locale. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
