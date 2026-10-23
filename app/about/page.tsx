import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { MediaImage } from '@/components/media/MediaImage';
import { PageShell } from '@/components/layout/PageShell';
import { about } from '@/content/about';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.about');
  return buildMetadata({ title: t('title'), description: t('description'), path: '/about' });
}

// O-05 / V-12: one text block and one photo.
export default function AboutPage() {
  const t = useTranslations('pages.about');
  const { photo, paragraphs } = about;

  return (
    <PageShell title={t('title')}>
      <div className="AboutPage grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="AboutPage__text flex flex-col gap-6 text-lg leading-8 md:col-span-5">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <figure className="AboutPage__photo md:col-span-6 md:col-start-7">
          <MediaImage
            src={photo.src}
            alt={photo.alt.vi}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </figure>
      </div>
    </PageShell>
  );
}
