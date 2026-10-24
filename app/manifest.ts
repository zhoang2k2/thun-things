import type { MetadataRoute } from 'next';

import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';

export default function manifest(): MetadataRoute.Manifest {
  const { site } = getMessagesFor(DEFAULT_LOCALE);
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
