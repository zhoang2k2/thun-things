import type { z } from 'zod';

import type { productSchema } from '@/lib/catalog/schema';

// Mock catalog (P2-1 → P2-3): realistic Vietnamese content, typed exactly like the schema.
// Images have no `src`, so every photo renders the V-26 placeholder until the owner supplies files.

type ProductInput = z.input<typeof productSchema>;
type ColorInput = ProductInput['colors'][number];
type ImageInput = ProductInput['media']['front'];

const COLORS = {
  white: { id: 'white', label: { vi: 'Trắng ngà', en: 'Off-white' }, hex: '#F5F5F2' },
  black: { id: 'black', label: { vi: 'Đen', en: 'Black' }, hex: '#111111' },
  ash: { id: 'ash', label: { vi: 'Xám tro', en: 'Ash grey' }, hex: '#8A8A85' },
  cream: { id: 'cream', label: { vi: 'Kem', en: 'Cream' }, hex: '#EDE6D6' },
  sunset: { id: 'sunset', label: { vi: 'Cam hoàng hôn', en: 'Sunset orange' }, hex: '#E8662E' },
  brick: { id: 'brick', label: { vi: 'Đỏ gạch', en: 'Brick red' }, hex: '#A63A2B' },
  moss: { id: 'moss', label: { vi: 'Xanh rêu', en: 'Moss green' }, hex: '#4F5B3A' },
  navy: { id: 'navy', label: { vi: 'Xanh đêm', en: 'Night blue' }, hex: '#1E2A44' },
  turmeric: { id: 'turmeric', label: { vi: 'Vàng nghệ', en: 'Turmeric' }, hex: '#D9A21B' },
} satisfies Record<string, ColorInput>;

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const MATERIAL = { vi: 'Cotton 100%, 250gsm, cổ bo dày', en: '100% cotton, 250gsm, ribbed collar' };
const CARE = {
  vi: 'Giặt lộn trái, nước lạnh; không sấy nóng; ủi mặt trái.',
  en: 'Wash inside out in cold water; no tumble dry; iron on reverse.',
};

const photo = (name: string, view: { vi: string; en: string }): ImageInput => ({
  width: 1600,
  height: 2000,
  alt: { vi: `Áo thun ${name} — ${view.vi}`, en: `${name} T-shirt — ${view.en}` },
});

interface TeeSeed {
  n: number;
  slug: string;
  name: { vi: string; en: string };
  description: { vi: string; en: string };
  priceVND: number;
  status: ProductInput['status'];
  colors: ColorInput[];
  vibes: string[];
  statusNote?: { vi: string; en: string };
  releasedAt?: string;
}

const tee = (seed: TeeSeed): ProductInput => ({
  id: `tt-${String(seed.n).padStart(3, '0')}`,
  slug: seed.slug,
  name: seed.name,
  description: seed.description,
  priceVND: seed.priceVND,
  status: seed.status,
  statusNote: seed.statusNote,
  colors: seed.colors,
  vibes: seed.vibes,
  sizes: SIZES,
  material: MATERIAL,
  care: CARE,
  media: {
    front: photo(seed.name.vi, { vi: 'mặt trước', en: 'front' }),
    back: photo(seed.name.vi, { vi: 'mặt sau', en: 'back' }),
    lifestyle: [
      photo(seed.name.vi, { vi: 'người mẫu mặc', en: 'worn by a model' }),
      photo(seed.name.vi, { vi: 'cận chất vải', en: 'fabric close-up' }),
    ],
  },
  releasedAt: seed.releasedAt,
});

export const rawProducts = [
  tee({
    n: 1,
    slug: 'hoang-hon-01',
    name: { vi: 'Hoàng Hôn 01', en: 'Sunset 01' },
    description: {
      vi: 'Dải cam cuối ngày in lụa một màu, đặt lệch về vai trái như vệt nắng qua cửa sổ.',
      en: 'A single-colour screen-printed band of late light, set off-centre like sun through a window.',
    },
    priceVND: 390000,
    status: 'available',
    colors: [COLORS.white, COLORS.sunset],
    vibes: ['minimal', 'art'],
  }),
  tee({
    n: 2,
    slug: 'pho-cu',
    name: { vi: 'Phố Cũ', en: 'Old Street' },
    description: {
      vi: 'Bản đồ tay vẽ những con phố Hà Nội, nét mảnh như phác thảo trên giấy dó.',
      en: 'A hand-drawn map of old Hanoi streets, fine as a sketch on dó paper.',
    },
    priceVND: 350000,
    status: 'available',
    colors: [COLORS.cream],
    vibes: ['retro', 'art'],
  }),
  tee({
    n: 3,
    slug: 'tem-thu',
    name: { vi: 'Tem Thư', en: 'Postage Stamp' },
    description: {
      vi: 'Con tem răng cưa phóng lớn, dấu bưu điện mờ in đè lên ngực áo.',
      en: 'An oversized perforated stamp with a faded postmark across the chest.',
    },
    priceVND: 320000,
    status: 'limited',
    colors: [COLORS.white, COLORS.brick],
    vibes: ['retro', 'graphic'],
    statusNote: { vi: 'Chỉ còn vài chiếc mỗi size.', en: 'Only a few left per size.' },
  }),
  tee({
    n: 4,
    slug: 'am-ban',
    name: { vi: 'Âm Bản', en: 'Negative' },
    description: {
      vi: 'Dải phim âm bản 35mm chạy dọc thân áo, số khung hình in nhỏ ở mép.',
      en: 'A 35mm negative strip down the body, frame numbers printed along the edge.',
    },
    priceVND: 420000,
    status: 'sold_out',
    colors: [COLORS.black],
    vibes: ['art', 'street'],
  }),
  tee({
    n: 5,
    slug: 'ngo-nho',
    name: { vi: 'Ngõ Nhỏ', en: 'Little Alley' },
    description: {
      vi: 'Ô cửa và dây điện chằng chịt, in một nét liền không nhấc bút.',
      en: 'Doorways and tangled power lines drawn in one unbroken line.',
    },
    priceVND: 340000,
    status: 'available',
    colors: [COLORS.ash],
    vibes: ['street', 'art'],
  }),
  tee({
    n: 6,
    slug: 'gio-bac',
    name: { vi: 'Gió Bấc', en: 'North Wind' },
    description: {
      vi: 'Chữ nghiêng như bị gió thổi lệch, đặt ở gấu áo phía sau.',
      en: 'Lettering tilted as if pushed by the wind, placed on the back hem.',
    },
    priceVND: 310000,
    status: 'available',
    colors: [COLORS.navy],
    vibes: ['minimal', 'graphic'],
  }),
  tee({
    n: 7,
    slug: 'mua-nang',
    name: { vi: 'Mùa Nắng', en: 'Dry Season' },
    description: {
      vi: 'Vệt vàng nghệ loang như nắng trưa trên tường vôi.',
      en: 'A turmeric smear like noon light on a limewashed wall.',
    },
    priceVND: 360000,
    status: 'coming_soon',
    colors: [COLORS.cream, COLORS.turmeric],
    vibes: ['art'],
    releasedAt: '2026-12-01',
  }),
  tee({
    n: 8,
    slug: 'khung-03',
    name: { vi: 'Khung 03', en: 'Frame 03' },
    description: {
      vi: 'Khung ảnh in trống ở ngực, để người mặc tự là bức ảnh.',
      en: 'An empty print frame on the chest so the wearer becomes the picture.',
    },
    priceVND: 300000,
    status: 'available',
    colors: [COLORS.white],
    vibes: ['minimal', 'art'],
  }),
  tee({
    n: 9,
    slug: 'reu-phong',
    name: { vi: 'Rêu Phong', en: 'Mossbound' },
    description: {
      vi: 'Áo nhuộm xanh rêu, chữ thêu nổi cùng màu chỉ thấy khi nghiêng.',
      en: 'Moss-dyed tee with tonal raised embroidery that shows only at an angle.',
    },
    priceVND: 450000,
    status: 'preorder',
    colors: [COLORS.moss],
    vibes: ['minimal'],
    statusNote: { vi: 'Giao hàng sau 3 tuần.', en: 'Ships in 3 weeks.' },
  }),
  tee({
    n: 10,
    slug: 'gach-do',
    name: { vi: 'Gạch Đỏ', en: 'Red Brick' },
    description: {
      vi: 'Lưới gạch đỏ in lệch nhịp, một viên bị thiếu ở giữa.',
      en: 'An off-beat red brick grid with one brick missing in the middle.',
    },
    priceVND: 370000,
    status: 'limited',
    colors: [COLORS.brick],
    vibes: ['graphic', 'street'],
  }),
  tee({
    n: 11,
    slug: 'dem-trang',
    name: { vi: 'Đêm Trắng', en: 'White Night' },
    description: {
      vi: 'Áo đen với một chấm trăng duy nhất ở vai phải.',
      en: 'A black tee with a single moon dot on the right shoulder.',
    },
    priceVND: 330000,
    status: 'available',
    colors: [COLORS.black, COLORS.white],
    vibes: ['minimal'],
  }),
  tee({
    n: 12,
    slug: 'so-tay',
    name: { vi: 'Sổ Tay', en: 'Notebook' },
    description: {
      vi: 'Dòng kẻ ô li và chữ viết tay nguệch ngoạc phía sau lưng.',
      en: 'School-ruled lines and scribbled handwriting across the back.',
    },
    priceVND: 320000,
    status: 'sold_out',
    colors: [COLORS.white],
    vibes: ['retro'],
  }),
  tee({
    n: 13,
    slug: 'ban-cong',
    name: { vi: 'Ban Công', en: 'Balcony' },
    description: {
      vi: 'Chậu cây và quần áo phơi, nhìn từ dưới lên như một bức ảnh phố.',
      en: 'Potted plants and drying laundry, seen from below like a street photo.',
    },
    priceVND: 380000,
    status: 'available',
    colors: [COLORS.cream, COLORS.moss],
    vibes: ['street', 'art'],
  }),
  tee({
    n: 14,
    slug: 'tia-x',
    name: { vi: 'Tia X', en: 'X-Ray' },
    description: {
      vi: 'Hình chụp X-quang một chiếc áo thun, in trắng trên nền xanh đêm.',
      en: 'An X-ray of a T-shirt, printed white on night blue.',
    },
    priceVND: 410000,
    status: 'preorder',
    colors: [COLORS.navy],
    vibes: ['art', 'graphic'],
  }),
  tee({
    n: 15,
    slug: 'loang',
    name: { vi: 'Loang', en: 'Bleed' },
    description: {
      vi: 'Mực cam loang tự nhiên, không chiếc nào giống chiếc nào.',
      en: 'Orange ink left to bleed; no two pieces are alike.',
    },
    priceVND: 440000,
    status: 'limited',
    colors: [COLORS.white, COLORS.sunset],
    vibes: ['art'],
    statusNote: { vi: 'Mỗi chiếc là duy nhất.', en: 'Each piece is one of a kind.' },
  }),
  tee({
    n: 16,
    slug: 'hem-sau',
    name: { vi: 'Hẻm Sau', en: 'Back Alley' },
    description: {
      vi: 'Biển số nhà và mũi tên chỉ đường in kiểu bảng hiệu cũ.',
      en: 'House numbers and arrows in the style of old shop signs.',
    },
    priceVND: 340000,
    status: 'available',
    colors: [COLORS.ash, COLORS.black],
    vibes: ['street', 'retro'],
  }),
  tee({
    n: 17,
    slug: 'vang-nghe',
    name: { vi: 'Vàng Nghệ', en: 'Turmeric' },
    description: {
      vi: 'Áo nhuộm củ nghệ thủ công, màu đậm dần theo từng lần giặt đầu.',
      en: 'Hand-dyed with turmeric; the colour deepens over the first washes.',
    },
    priceVND: 430000,
    status: 'coming_soon',
    colors: [COLORS.turmeric],
    vibes: ['minimal', 'art'],
    releasedAt: '2026-12-15',
  }),
  tee({
    n: 18,
    slug: 've-so',
    name: { vi: 'Vé Số', en: 'Lottery Ticket' },
    description: {
      vi: 'Tờ vé số phóng to với dãy số may mắn của riêng bạn.',
      en: 'An enlarged lottery ticket with your own lucky numbers.',
    },
    priceVND: 290000,
    status: 'sold_out',
    colors: [COLORS.cream, COLORS.brick],
    vibes: ['retro', 'graphic'],
  }),
  tee({
    n: 19,
    slug: 'mat-ho',
    name: { vi: 'Mặt Hồ', en: 'Lake Surface' },
    description: {
      vi: 'Gợn sóng in chuyển nét mảnh, như mặt hồ Tây lúc sáng sớm.',
      en: 'Fine-line ripples like West Lake at dawn.',
    },
    priceVND: 360000,
    status: 'available',
    colors: [COLORS.white, COLORS.navy],
    vibes: ['minimal', 'art'],
  }),
  tee({
    n: 20,
    slug: 'khoi-den',
    name: { vi: 'Khối Đen', en: 'Black Block' },
    description: {
      vi: 'Một khối đen vuông lớn in tràn, cạnh sắc như cắt bằng dao.',
      en: 'A large black square printed edge to edge, cut knife-sharp.',
    },
    priceVND: 350000,
    status: 'preorder',
    colors: [COLORS.white, COLORS.black],
    vibes: ['graphic', 'minimal'],
  }),
  tee({
    n: 21,
    slug: 'cho-som',
    name: { vi: 'Chợ Sớm', en: 'Morning Market' },
    description: {
      vi: 'Danh sách đi chợ viết tay của mẹ, in nguyên nét bút bi.',
      en: "Mum's handwritten market list, printed in its original ballpoint.",
    },
    priceVND: 330000,
    status: 'available',
    colors: [COLORS.white],
    vibes: ['retro', 'street'],
  }),
  tee({
    n: 22,
    slug: 'ngu-trua',
    name: { vi: 'Ngủ Trưa', en: 'Siesta' },
    description: {
      vi: 'Chiếc võng in mờ ở vạt áo, dành cho những buổi trưa không vội.',
      en: 'A faint hammock on the hem, for unhurried afternoons.',
    },
    priceVND: 310000,
    status: 'coming_soon',
    colors: [COLORS.cream],
    vibes: ['minimal'],
  }),
  tee({
    n: 23,
    slug: 'tan-ca',
    name: { vi: 'Tan Ca', en: 'Shift End' },
    description: {
      vi: 'Đồng hồ chấm công dừng ở 17:30, in kiểu tem phiếu cũ.',
      en: 'A time clock stopped at 17:30, printed like an old ration stamp.',
    },
    priceVND: 340000,
    status: 'sold_out',
    colors: [COLORS.ash],
    vibes: ['retro', 'graphic'],
  }),
  tee({
    n: 24,
    slug: 'hoang-hon-02',
    name: { vi: 'Hoàng Hôn 02', en: 'Sunset 02' },
    description: {
      vi: 'Phiên bản đỏ gạch của Hoàng Hôn, dải màu nằm ngang ngực.',
      en: 'The brick-red edition of Sunset, with the band across the chest.',
    },
    priceVND: 400000,
    status: 'limited',
    colors: [COLORS.cream, COLORS.brick],
    vibes: ['art', 'minimal'],
  }),
] satisfies ProductInput[];
