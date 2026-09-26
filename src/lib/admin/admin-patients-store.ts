import {
  getAllPatientAccounts as getAllPatientAccountsRaw,
  savePatientAccount,
  type PatientAccount,
} from "@/lib/storage";

export type AdminPatientView = PatientAccount & {
  isActive: boolean;
};

/**
 * Pre-existing patient accounts have no isActive (that field didn't
 * exist before Phase 3A) — treated as already active, same convention
 * as Doctor's isActive default from Phase 2A.
 */
export function normalizePatientForAdmin(
  account: PatientAccount,
): AdminPatientView {
  return {
    ...account,
    isActive: account.isActive ?? true,
  };
}

export function getAllPatientAccounts(): AdminPatientView[] {
  return getAllPatientAccountsRaw().map(normalizePatientForAdmin);
}

export function getPatientAccountById(id: string): AdminPatientView | null {
  const account = getAllPatientAccountsRaw().find(
    (candidate) => candidate.id === id,
  );

  return account ? normalizePatientForAdmin(account) : null;
}

/**
 * Persists through the same savePatientAccount() the registration/
 * profile-update flows already use (it upserts by emailOrMobile), so
 * this goes through the one real write path rather than a parallel
 * one.
 */
export function setPatientActiveStatus(
  id: string,
  isActive: boolean,
): AdminPatientView | null {
  const account = getAllPatientAccountsRaw().find(
    (candidate) => candidate.id === id,
  );

  if (!account) {
    return null;
  }

  const updated: PatientAccount = { ...account, isActive };

  savePatientAccount(updated);

  return normalizePatientForAdmin(updated);
}
