import type { DoctorAccount } from "@/types/doctorAccount";
import { getSharedSingleton, setSharedSingleton } from "@/lib/redux-data";
export function getDoctorAccount(): DoctorAccount | null { return getSharedSingleton<DoctorAccount>("doctorAccount"); }
export function saveDoctorAccount(account: DoctorAccount, password?: string): void { setSharedSingleton("doctorAccount", account); if (password) setSharedSingleton("doctorPassword", password); }
export function matchesDoctorAccount(identifier: string, password?: string): DoctorAccount | null {
  const account = getDoctorAccount(); if (!account) return null;
  const value = identifier.trim().toLowerCase();
  if (account.email.toLowerCase() !== value && account.phone !== identifier.trim()) return null;
  return password !== undefined && getSharedSingleton<string>("doctorPassword") !== password ? null : account;
}
export function resetDoctorPassword(identifier: string, newPassword: string): boolean {
  const account = getDoctorAccount(); if (!account) return false;
  if (account.email.toLowerCase() !== identifier.trim().toLowerCase() && account.phone !== identifier.trim()) return false;
  setSharedSingleton("doctorPassword", newPassword); return true;
}
