import type { Locale } from '@/i18n/routing';

const priceFormatters = {
  vi: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
  en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }),
};

export const formatPriceVND = (value: number, locale: Locale = 'vi'): string =>
  priceFormatters[locale].format(value);
