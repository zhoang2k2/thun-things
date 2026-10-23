import type { Locale } from '@/i18n/routing';
import type { ImageAsset } from '@/lib/catalog/schema';

// TODO(owner): replace the text with the real brand story and add the photo `src` (V-12).
// Until then the photo renders the V-26 placeholder.
export const about: { paragraphs: Record<Locale, string[]>; photo: ImageAsset } = {
  paragraphs: {
    vi: [
      'Thun Things làm áo thun như làm tranh: mỗi mẫu bắt đầu từ một bức ảnh, một màu, một cảm giác, rồi được in với số lượng nhỏ.',
      '[Chủ shop cập nhật: câu chuyện thương hiệu, người đứng sau Thun Things và cách mỗi drop ra đời.]',
    ],
    en: [
      "Thun Things makes T-shirts the way you'd make a picture. Each design starts from a photograph, a color or a feeling, then goes to print in a small run.",
      '[Owner to update: the brand story, the people behind Thun Things and how each drop comes together.]',
    ],
  },
  photo: {
    width: 1200,
    height: 1500,
    alt: { vi: 'Xưởng in của Thun Things', en: 'The Thun Things print studio' },
  },
};
