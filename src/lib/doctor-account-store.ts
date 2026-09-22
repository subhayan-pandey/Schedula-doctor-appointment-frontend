import type { DoctorAccount } from "@/types/doctorAccount";

const KEY = "schedula:doctor-account";
const PASSWORD_KEY =
  "schedula:doctor-password";

function isBrowser() {
  return typeof window !== "undefined";
}

function getStoredPassword(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(
    PASSWORD_KEY,
  );
}

export function getDoctorAccount(): DoctorAccount | null {
  if (!isBrowser()) return null;

  try {
    const raw =
      window.localStorage.getItem(KEY);

    return raw
      ? (JSON.parse(raw) as DoctorAccount)
      : null;
  } catch {
    return null;
  }
}

export function saveDoctorAccount(
  account: DoctorAccount,
  password?: string,
): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    KEY,
    JSON.stringify(account),
  );

  if (password) {
    window.localStorage.setItem(
      PASSWORD_KEY,
      password,
    );
  }
}

export function matchesDoctorAccount(
  identifier: string,
  password?: string,
): DoctorAccount | null {
  const account =
    getDoctorAccount();

  if (!account) {
    return null;
  }

  const value =
    identifier.trim().toLowerCase();

  const matchesIdentifier =
    account.email.toLowerCase() ===
      value ||
    account.phone ===
      identifier.trim();

  if (!matchesIdentifier) {
    return null;
  }

  if (
    password !== undefined &&
    getStoredPassword() !== password
  ) {
    return null;
  }

  return account;
}

export function resetDoctorPassword(
  identifier: string,
  newPassword: string,
): boolean {
  const account =
    getDoctorAccount();

  if (!account) {
    return false;
  }

  const value =
    identifier.trim().toLowerCase();

  const matchesIdentifier =
    account.email.toLowerCase() ===
      value ||
    account.phone ===
      identifier.trim();

  if (!matchesIdentifier) {
    return false;
  }

  if (!isBrowser()) {
    return false;
  }

  window.localStorage.setItem(
    PASSWORD_KEY,
    newPassword,
  );

  return true;
}