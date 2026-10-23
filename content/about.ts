import type { ImageAsset } from '@/lib/catalog/schema';

// TODO(owner): replace the text with the real brand story and add the photo `src` (V-12).
// Until then the photo renders the V-26 placeholder.
export const about: { paragraphs: string[]; photo: ImageAsset } = {
  paragraphs: [
    'Thun Things làm áo thun như làm tranh: mỗi mẫu bắt đầu từ một bức ảnh, một màu, một cảm giác, rồi được in với số lượng nhỏ.',
    '[Chủ shop cập nhật: câu chuyện thương hiệu, người đứng sau Thun Things và cách mỗi drop ra đời.]',
  ],
  photo: {
    width: 1200,
    height: 1500,
    alt: { vi: 'Xưởng in của Thun Things', en: 'The Thun Things print studio' },
  },
};
