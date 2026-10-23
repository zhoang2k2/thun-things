import type { PolicyDocument } from '@/content/policies/types';

// TODO(owner): replace this structured placeholder with the reviewed privacy text before launch
// (P9). Keep the processors list in sync with the code: Resend (email), Upstash (rate limit),
// Vercel (hosting); GA4 joins at P6. Change both locales together.
export const privacyPolicy: PolicyDocument = {
  updatedAt: '2026-10-23',
  sections: {
    vi: [
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
    en: [
      {
        heading: 'What we collect',
        paragraphs: ['When you send the Contact form or the Notify me form, Thun Things receives:'],
        items: [
          'Your email and phone / Zalo number, so we can get back to you.',
          'Your name, size, quantity, delivery address and message, if you fill them in.',
          'The product you asked about and when you sent the form.',
          'The fact that you agreed to this policy.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use this information only to answer your request, confirm your order and tell you when a product is available. Thun Things does not sell your information or share it with anyone for advertising.',
        ],
      },
      {
        heading: 'Who processes your data',
        items: [
          'Resend: sends your request to Thun Things and a confirmation email to you.',
          'Upstash: limits how often the forms can be sent, using your IP address for up to 10 minutes.',
          'Vercel: hosts and runs the website.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          '[Owner to update: how long request emails stay in the inbox, for example 12 months.]',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can ask to see, correct or delete the information you sent by contacting Thun Things through the Contact page. [Owner to update: the email address for data requests.]',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'The website does not currently use advertising or analytics cookies. This policy will be updated before any analytics tool is turned on.',
        ],
      },
    ],
  },
};
