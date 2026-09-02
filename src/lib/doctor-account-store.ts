import type { DoctorAccount } from "@/types/doctorAccount";

const KEY = "schedula:doctor-account";

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * This is a single-doctor demo: only one registered doctor account is kept
 * in localStorage at a time, representing "the doctor currently using this
 * browser." A real backend would look up accounts by email instead.
 */
export function getDoctorAccount(): DoctorAccount | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DoctorAccount) : null;
  } catch {
    return null;
  }
}

export function saveDoctorAccount(account: DoctorAccount): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(account));
}

export function matchesDoctorAccount(identifier: string): DoctorAccount | null {
  const account = getDoctorAccount();
  if (!account) return null;
  const value = identifier.trim().toLowerCase();
  return account.email.toLowerCase() === value || account.phone === identifier.trim()
    ? account
    : null;
}