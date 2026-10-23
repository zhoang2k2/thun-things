import { describe, expect, it } from 'vitest';

import { buildMetadata } from '@/lib/seo/metadata';

describe('buildMetadata', () => {
  it('builds canonical and open graph from path', () => {
    const metadata = buildMetadata({ title: 'Giới thiệu', description: 'd', path: '/about' });
    expect(metadata.title).toBe('Giới thiệu');
    expect(metadata.description).toBe('d');
    expect(metadata.alternates?.canonical).toBe('/about');
    expect(String(metadata.metadataBase)).toBe('http://localhost:3000/');
    expect(metadata.openGraph).toMatchObject({
      title: 'Giới thiệu',
      url: '/about',
      siteName: 'Thun Things',
      locale: 'vi_VN',
      type: 'website',
    });
  });

  it('requests the large summary card for Twitter', () => {
    expect(buildMetadata({ description: 'd', path: '/' }).twitter).toMatchObject({
      card: 'summary_large_image',
    });
  });

  it('omits the title when none is given so the root default applies', () => {
    expect(buildMetadata({ description: 'd', path: '/' })).not.toHaveProperty('title');
  });
});
