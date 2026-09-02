const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function isValidEmailOrMobile(value: string): boolean {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) || MOBILE_PATTERN.test(trimmed);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 6;
}