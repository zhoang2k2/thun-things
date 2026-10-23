import type { PolicyDocument } from '@/content/policies/types';

// TODO(owner): replace every bracketed placeholder with the real terms before launch (P9).
export const returnsPolicy: PolicyDocument = {
  updatedAt: '2026-10-23',
  sections: [
    {
      heading: 'Điều kiện đổi trả',
      items: [
        '[Chủ shop cập nhật: áo còn tem, chưa giặt, chưa qua sử dụng.]',
        '[Chủ shop cập nhật: trường hợp được đổi size, đổi mẫu hoặc hoàn tiền.]',
      ],
    },
    {
      heading: 'Thời hạn',
      paragraphs: ['[Chủ shop cập nhật: số ngày kể từ khi nhận hàng, ví dụ 7 ngày.]'],
    },
    {
      heading: 'Phí vận chuyển',
      paragraphs: ['[Chủ shop cập nhật: ai trả phí gửi lại và phí gửi áo mới.]'],
    },
    {
      heading: 'Hàng đặt trước',
      paragraphs: [
        '[Chủ shop cập nhật: thời gian giao dự kiến, đặt cọc và điều kiện hủy đơn đặt trước.]',
      ],
    },
    {
      heading: 'Cách yêu cầu đổi trả',
      paragraphs: [
        'Gửi yêu cầu qua trang Liên hệ, kèm tên sản phẩm và ảnh áo. Thun Things trả lời trong 1–2 ngày.',
      ],
    },
  ],
};
