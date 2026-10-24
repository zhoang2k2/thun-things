import type { PolicyDocument } from '@/content/policies/types';

// TODO(owner): replace this structured placeholder with the reviewed privacy text before launch
// (P9). Keep the processors list in sync with the code: Resend (email), Upstash (rate limit),
// Vercel (hosting), Google (GA4, only after consent), Google Gemini / Anthropic (quiz rationale). Change both locales together.
export const privacyPolicy: PolicyDocument = {
  updatedAt: '2026-10-24',
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
          'Google (Google Analytics 4): thống kê lượt xem trang, chỉ khi bạn đồng ý cookie phân tích.',
          'Google (Gemini API) và Anthropic (Claude): viết vài câu gợi ý cho kết quả trắc nghiệm chọn áo.',
        ],
      },
      {
        heading: 'Gợi ý bằng AI trong trắc nghiệm chọn áo',
        paragraphs: [
          'Khi bạn làm trắc nghiệm "Tìm áo hợp bạn", màu và phong cách bạn chọn cùng thông tin của mẫu áo được gợi ý sẽ được gửi tới Google (Gemini API) hoặc, nếu dịch vụ này không phản hồi, tới Anthropic (Claude) để viết một hai câu giải thích. Không có tên, email, địa chỉ IP hay thông tin nào giúp nhận ra bạn được gửi đi.',
          'Câu gợi ý có nhãn "Viết bởi AI" và có thể được lưu tạm tối đa 7 ngày để dùng lại cho cùng lựa chọn.',
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
        heading: 'Cookie và phân tích',
        paragraphs: [
          'Website chỉ bật Google Analytics 4 sau khi bạn bấm Đồng ý trên thanh cookie hoặc bật mục Phân tích trong Cài đặt cookie. Nếu bạn từ chối, không có dữ liệu nào được gửi tới Google.',
          'Lựa chọn của bạn được lưu trên trình duyệt này. Bạn có thể đổi lại bất cứ lúc nào bằng nút "Cài đặt cookie" ở cuối trang; khi tắt, cookie phân tích sẽ bị xoá.',
        ],
        items: [
          'Google Analytics ghi nhận các trang bạn xem, những thao tác như mở xem nhanh hay chọn một mẫu áo, cùng vị trí gần đúng và loại thiết bị do Google ước tính. Không có email, số điện thoại hay nội dung bạn nhập vào form được gửi đi.',
          'Cookie _ga và _ga_<mã> do Google đặt để phân biệt lượt truy cập, có hiệu lực tối đa 2 năm.',
          'Google lưu dữ liệu phân tích trong [Chủ shop cập nhật: 2 hoặc 14 tháng, theo cài đặt Data retention trong GA4].',
          'Thun Things không dùng cookie quảng cáo và không chia sẻ dữ liệu này để quảng cáo.',
        ],
      },
    ],
    en: [
      {
        heading: 'What we collect',
        paragraphs: [
          'When you send the Contact form or the "Notify me when it\'s available" form, Thun Things receives:',
        ],
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
          'Google (Google Analytics 4): measures page views, only if you accept analytics cookies.',
          'Google (Gemini API) and Anthropic (Claude): write a short explanation for your style-quiz result.',
        ],
      },
      {
        heading: 'AI suggestions in the style quiz',
        paragraphs: [
          'When you take the "Find your shirt" quiz, the colour and style you pick and the details of the suggested design are sent to Google (Gemini API) or, if it does not respond, to Anthropic (Claude) to write a one- or two-sentence explanation. Nothing that identifies you, such as your name, email or IP address, is sent.',
          'The explanation is labelled "Written by AI" and may be kept for up to 7 days so the same choice gets the same answer.',
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
        heading: 'Cookies and analytics',
        paragraphs: [
          'Google Analytics 4 only turns on after you click Accept on the cookie bar or switch on Analytics in Cookie settings. If you reject, nothing is sent to Google.',
          'Your choice is stored in this browser. You can change it any time with the "Cookie settings" button at the bottom of the page; switching analytics off deletes its cookies.',
        ],
        items: [
          'Google Analytics records the pages you view, actions such as opening a quick preview or choosing a design, and the approximate location and device type Google estimates. No email, phone number or anything you type into a form is sent.',
          'The _ga and _ga_<id> cookies are set by Google to tell visits apart and last up to 2 years.',
          'Google keeps analytics data for [Owner to update: 2 or 14 months, as set under Data retention in GA4].',
          'Thun Things uses no advertising cookies and does not share this data for advertising.',
        ],
      },
    ],
  },
};
