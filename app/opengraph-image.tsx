import { DEFAULT_LOCALE, getMessagesFor } from '@/i18n/messages';
import { OG_SIZE, renderWordmarkImage } from '@/lib/seo/ogImage';

export const alt = getMessagesFor(DEFAULT_LOCALE).site.name;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderWordmarkImage();
}
