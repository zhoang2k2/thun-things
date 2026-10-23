import type { MetadataRoute } from 'next';

import { copy } from '@/content/copy/vi';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.site.name,
    short_name: copy.site.name,
    description: copy.site.description,
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
