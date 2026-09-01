const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function isValidEmailOrMobile(value: string): boolean {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) || MOBILE_PATTERN.test(trimmed);
}

export function isValidPassword(value: string): boolean {
  return value.length >= 6;
}