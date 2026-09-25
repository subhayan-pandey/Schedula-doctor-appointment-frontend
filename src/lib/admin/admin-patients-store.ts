import type { PatientAccount } from "@/lib/storage";

const PATIENT_ACCOUNTS_KEY = "schedula:patient-accounts";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isPatientAccount(value: unknown): value is PatientAccount {
  if (!value || typeof value !== "object") {
    return false;
  }

  const account = value as Partial<PatientAccount>;

  return (
    typeof account.id === "string" &&
    typeof account.name === "string" &&
    typeof account.emailOrMobile === "string" &&
    typeof account.password === "string"
  );
}

/**
 * Reads the same "schedula:patient-accounts" localStorage key that
 * src/lib/storage.ts writes to. That file only exposes a single-account
 * lookup (getPatientAccount), so this adds the list view the Admin Portal
 * needs (dashboard totals now, Patient Management in Phase 3A) without
 * touching storage.ts's write path or its legacy single-account migration.
 */
export function getAllPatientAccounts(): PatientAccount[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PATIENT_ACCOUNTS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? parsed.filter(isPatientAccount) : [];
  } catch {
    return [];
  }
}
