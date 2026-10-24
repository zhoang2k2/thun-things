import { describe, expect, it } from 'vitest';

import { buildMetadata } from '@/lib/seo/metadata';

describe('buildMetadata', () => {
  it('builds canonical and open graph from path', () => {
    const metadata = buildMetadata({
      title: 'Giới thiệu',
      description: 'd',
      locale: 'vi',
      path: '/about',
    });
    expect(metadata.title).toBe('Giới thiệu');
    expect(metadata.description).toBe('d');
    expect(metadata.alternates?.canonical).toBe('/vi/about');
    expect(String(metadata.metadataBase)).toBe('http://localhost:3000/');
    expect(metadata.openGraph).toMatchObject({
      title: 'Giới thiệu',
      url: '/vi/about',
      siteName: 'Thun Things',
      locale: 'vi_VN',
      type: 'website',
    });
  });

  it('prefixes canonical and open graph URLs with the locale', () => {
    const metadata = buildMetadata({ description: 'd', locale: 'en', path: '/?page=2' });
    expect(metadata.alternates?.canonical).toBe('/en?page=2');
    expect(metadata.openGraph).toMatchObject({ url: '/en?page=2' });
  });

  it('requests the large summary card for Twitter', () => {
    expect(buildMetadata({ description: 'd', locale: 'vi', path: '/' }).twitter).toMatchObject({
      card: 'summary_large_image',
    });
  });

  it('gives open graph and Twitter the default 1200x630 share image', () => {
    const metadata = buildMetadata({ description: 'd', locale: 'vi', path: '/about' });
    const image = { url: '/opengraph-image', width: 1200, height: 630, alt: 'Thun Things' };
    expect(metadata.openGraph).toMatchObject({ images: [image] });
    expect(metadata.twitter).toMatchObject({ images: [image] });
  });

  it('lets a page supply its own share image and alt', () => {
    const image = { url: '/products/x/opengraph-image', alt: 'X' };
    const metadata = buildMetadata({ description: 'd', locale: 'vi', path: '/products/x', image });
    const expected = [{ ...image, width: 1200, height: 630 }];
    expect(metadata.openGraph).toMatchObject({ images: expected });
    expect(metadata.twitter).toMatchObject({ images: expected });
  });

  it('omits the title when none is given so the root default applies', () => {
    expect(buildMetadata({ description: 'd', locale: 'vi', path: '/' })).not.toHaveProperty(
      'title',
    );
  });
});

it.each(['vi', 'en'] as const)('sets bilingual alternates and OG locale for %s', (locale) => {
  for (const path of ['/', '/?page=2', '/products/hoang-hon-01', '/contact']) {
    const metadata = buildMetadata({ description: 'd', locale, path });
    const suffix = path === '/' ? '' : path.startsWith('/?') ? path.slice(1) : path;
    expect(metadata.alternates?.languages).toEqual({
      vi: `/vi${suffix}`,
      en: `/en${suffix}`,
      'x-default': `/vi${suffix}`,
    });
    expect(metadata.openGraph).toMatchObject({
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: [locale === 'vi' ? 'en_US' : 'vi_VN'],
    });
  }
});
