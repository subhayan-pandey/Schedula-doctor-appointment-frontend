import type { User } from "@/types/user";
import { store } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
export type PatientAccount = { id: string; name: string; emailOrMobile: string; password: string; isActive?: boolean };
const norm = (value: string) => value.trim().toLowerCase();
export function getSession(): User | null { return store.getState().auth.user; }
export function setSession(user: User): void { store.dispatch(setUser(user)); emitLegacyViewEvent("schedula:session-updated"); }
export function clearSession(): void { store.dispatch(setUser(null)); emitLegacyViewEvent("schedula:session-updated"); }
export function getPatientAccount(identifier?: string): PatientAccount | null { const accounts = getSharedCollection<PatientAccount>("patientAccounts"); return identifier ? accounts.find((x) => norm(x.emailOrMobile) === norm(identifier)) ?? null : accounts[0] ?? null; }
export function getAllPatientAccounts(): PatientAccount[] { return getSharedCollection<PatientAccount>("patientAccounts"); }
export function savePatientAccount(account: PatientAccount): void { updateSharedCollection<PatientAccount>("patientAccounts", (items) => items.some((x) => norm(x.emailOrMobile) === norm(account.emailOrMobile)) ? items.map((x) => norm(x.emailOrMobile) === norm(account.emailOrMobile) ? account : x) : [...items, account]); }
