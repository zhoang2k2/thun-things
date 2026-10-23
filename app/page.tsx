import { copy } from '@/content/copy/vi';
import { buildMetadata } from '@/lib/seo/metadata';

const page = copy.pages.home;

export const metadata = buildMetadata({ description: page.description, path: '/' });

export default function HomePage() {
  return (
    <div className="HomePage">
      <h1 className="sr-only">{page.title}</h1>
      {/* Reserved for the P2 hero slideshow (V-08) so it lands without layout shift. */}
      <div className="HomePage__hero bg-placeholder min-h-[70vh]" aria-hidden="true" />
    </div>
  );
}
