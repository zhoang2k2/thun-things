import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';
import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.home;

export const metadata = buildMetadata({ description: page.description, path: '/' });

export default function HomePage() {
  return (
    <div className="HomePage">
      <h1 className="sr-only">{page.title}</h1>
      {/* Reserved for the P2 hero slideshow (V-08: ~70% of the viewport). */}
      <ImagePlaceholder
        alt={page.heroAlt}
        width={2400}
        height={1350}
        className="HomePage__hero h-[70vh]"
      />
    </div>
  );
}
