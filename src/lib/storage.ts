import type { User } from "@/types/user";

const SESSION_KEY =
  "schedula:session";

const PATIENT_ACCOUNT_KEY =
  "schedula:patient-account";

export type PatientAccount = {
  id: string;
  name: string;
  emailOrMobile: string;
  password: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function emitSessionUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(
      "schedula:session-updated",
    ),
  );
}

export function getSession(): User | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        SESSION_KEY,
      );

    return raw
      ? (JSON.parse(raw) as User)
      : null;
  } catch {
    return null;
  }
}

export function setSession(
  user: User,
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user),
  );

  emitSessionUpdated();
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(
    SESSION_KEY,
  );

  emitSessionUpdated();
}

export function getPatientAccount(
  identifier?: string,
): PatientAccount | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        PATIENT_ACCOUNT_KEY,
      );

    if (!raw) {
      return null;
    }

    const account =
      JSON.parse(raw) as PatientAccount;

    if (!identifier) {
      return account;
    }

    return account.emailOrMobile
      .trim()
      .toLowerCase() ===
      identifier.trim().toLowerCase()
      ? account
      : null;
  } catch {
    return null;
  }
}

export function savePatientAccount(
  account: PatientAccount,
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    PATIENT_ACCOUNT_KEY,
    JSON.stringify(account),
  );
}