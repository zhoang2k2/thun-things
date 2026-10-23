import { copy } from '@/content/copy/vi';
import { OG_SIZE, renderWordmarkImage } from '@/lib/seo/ogImage';

export const alt = copy.site.name;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderWordmarkImage();
}
