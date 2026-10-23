// Every user-facing string lives here until i18n (P5) moves them to next-intl messages.
export const copy = {
  site: {
    name: 'Thun Things',
    description: 'Thun Things — áo thun nghệ thuật.',
  },
  nav: {
    label: 'Điều hướng chính',
    home: 'Trang chủ',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
  },
  footer: {
    policyLabel: 'Chính sách',
    privacy: 'Bảo mật',
    returns: 'Đổi trả',
    emailLabel: 'Email',
    socialLabel: 'Mạng xã hội',
  },
  a11y: {
    skipToContent: 'Chuyển đến nội dung',
  },
  media: {
    placeholderLabel: 'Image',
  },
  pagination: {
    label: 'Phân trang',
    previous: 'Trước',
    next: 'Sau',
    page: 'Trang',
  },
  hero: {
    label: 'Banner',
    pause: 'Tạm dừng',
    play: 'Tiếp tục',
  },
  product: {
    gridHeading: 'Sản phẩm',
    galleryLabel: 'Ảnh sản phẩm',
    relatedHeading: 'Có thể bạn cũng thích',
    details: {
      sizes: 'Size',
      material: 'Chất liệu',
      care: 'Bảo quản',
    },
    status: {
      available: 'Còn hàng',
      limited: 'Số lượng giới hạn',
      sold_out: 'Hết hàng',
      coming_soon: 'Sắp ra mắt',
      preorder: 'Đặt trước',
    },
    actions: {
      order: 'Đặt mua',
      preorder: 'Đặt trước',
      askFirst: 'Hỏi trước',
      notify: 'Báo khi có hàng',
    },
  },
  pages: {
    home: {
      title: 'Thun Things',
      description: 'Áo thun Thun Things.',
      heroAlt: 'Banner Thun Things',
    },
    about: {
      title: 'Giới thiệu',
      description: 'Câu chuyện của Thun Things.',
      body: 'Nội dung đang được cập nhật.',
    },
    contact: {
      title: 'Liên hệ',
      description: 'Liên hệ đặt áo Thun Things.',
      body: 'Form liên hệ sẽ có mặt tại đây.',
    },
    privacy: {
      title: 'Chính sách bảo mật',
      description: 'Cách Thun Things xử lý thông tin của bạn.',
      body: 'Nội dung chính sách đang được cập nhật.',
    },
    returns: {
      title: 'Chính sách đổi trả',
      description: 'Điều kiện đổi trả và đặt trước tại Thun Things.',
      body: 'Nội dung chính sách đang được cập nhật.',
    },
  },
} as const;
