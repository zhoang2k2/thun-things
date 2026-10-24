// Vietnamese mobile numbers: 0xxxxxxxxx, +84xxxxxxxxx or 84xxxxxxxxx, where the first
// subscriber digit is a mobile prefix (3, 5, 7, 8, 9). Spaces, dots, dashes and brackets are ignored.
const SEPARATORS = /[\s.\-()]/g;
const MOBILE = /^(?:\+?84|0)([35789]\d{8})$/;

/** Returns the number as +84xxxxxxxxx, or null when it is not a Vietnamese mobile number. */
export const normalizeVietnamesePhone = (input: string): string | null => {
  const match = MOBILE.exec(input.replace(SEPARATORS, ''));
  return match ? `+84${match[1]}` : null;
};
