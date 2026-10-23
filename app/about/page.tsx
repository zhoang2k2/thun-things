import { MediaImage } from '@/components/media/MediaImage';
import { PageShell } from '@/components/layout/PageShell';
import { about } from '@/content/about';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.about;

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: '/about',
});

// O-05 / V-12: one text block and one photo.
export default function AboutPage() {
  const { photo, paragraphs } = about;

  return (
    <PageShell title={page.title}>
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
