import type { ImageAsset } from '@/lib/catalog/schema';

// Owner-designed hero banners (V-08). No `src` yet → V-26 placeholders.
export interface Banner {
  id: string;
  desktop: ImageAsset;
  mobile: ImageAsset;
}

const banner = (id: string, vi: string, en: string): Banner => ({
  id,
  desktop: { width: 2400, height: 1350, alt: { vi, en } },
  mobile: { width: 1080, height: 1350, alt: { vi, en } },
});

export const banners: Banner[] = [
  banner('drop-hoang-hon', 'Bộ sưu tập Hoàng Hôn', 'The Hoàng Hôn collection'),
  banner('pho-cu', 'Phố Cũ — những con phố vẽ tay', 'Phố Cũ — streets drawn by hand'),
  banner(
    'am-ban',
    'Âm Bản — dải phim 35mm trên áo',
    'Âm Bản — a strip of 35mm film printed on a tee',
  ),
  banner('mua-nang', 'Mùa Nắng — sắp ra mắt', 'Mùa Nắng — coming soon'),
];
