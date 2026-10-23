const priceFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export const formatPriceVND = (value: number): string => priceFormatter.format(value);
