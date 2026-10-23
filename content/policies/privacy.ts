import type { PolicyDocument } from '@/content/policies/types';

// TODO(owner): replace this structured placeholder with the reviewed privacy text before launch
// (P9). Keep the processors list in sync with the code: Resend (email), Upstash (rate limit),
// Vercel (hosting); GA4 joins at P6.
export const privacyPolicy: PolicyDocument = {
  updatedAt: '2026-10-23',
  sections: [
    {
      heading: 'Thông tin Thun Things thu thập',
      paragraphs: ['Khi bạn gửi form Liên hệ hoặc Báo khi có hàng, Thun Things nhận:'],
      items: [
        'Email và số điện thoại / Zalo để liên hệ lại với bạn.',
        'Tên, size, số lượng, địa chỉ giao hàng và lời nhắn nếu bạn tự điền.',
        'Sản phẩm bạn quan tâm và thời điểm gửi.',
        'Việc bạn đã đồng ý với chính sách này.',
      ],
    },
    {
      heading: 'Mục đích sử dụng',
      paragraphs: [
        'Thông tin chỉ dùng để trả lời yêu cầu, xác nhận đơn đặt áo và báo cho bạn khi sản phẩm có hàng. Thun Things không bán hay chia sẻ thông tin của bạn cho bên khác để quảng cáo.',
      ],
    },
    {
      heading: 'Bên xử lý dữ liệu',
      items: [
        'Resend: gửi email thông báo yêu cầu đến Thun Things và email xác nhận đến bạn.',
        'Upstash: giới hạn số lần gửi form, dùng địa chỉ IP của bạn trong tối đa 10 phút.',
        'Vercel: lưu trữ và vận hành website.',
      ],
    },
    {
      heading: 'Thời gian lưu trữ',
      paragraphs: [
        '[Chủ shop cập nhật: thời gian giữ email yêu cầu trong hộp thư, ví dụ 12 tháng.]',
      ],
    },
    {
      heading: 'Quyền của bạn',
      paragraphs: [
        'Bạn có thể yêu cầu xem, sửa hoặc xóa thông tin đã gửi bằng cách liên hệ Thun Things qua trang Liên hệ. [Chủ shop cập nhật: email nhận yêu cầu về dữ liệu.]',
      ],
    },
    {
      heading: 'Cookie',
      paragraphs: [
        'Hiện tại website không dùng cookie quảng cáo hay phân tích. Chính sách sẽ được cập nhật trước khi bật công cụ phân tích.',
      ],
    },
  ],
};
