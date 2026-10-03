import type { AdminRole, AdminUser } from "@/types/admin/admin-user";
import { getSharedCollection, updateSharedCollection } from "@/lib/redux-data";
export type AdminAccount = AdminUser & { password: string };
const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [{ id: "admin-1", name: "Alex Morgan", email: "admin@schedula.com", password: "Admin@123", role: "super_admin" }];
const accounts = (): AdminAccount[] => { const saved = getSharedCollection<AdminAccount>("adminAccounts"); return saved.length ? saved : DEFAULT_ADMIN_ACCOUNTS; };
export function getAdminAccounts(): AdminAccount[] { return accounts(); }
export function getAdminAccountById(id: string): AdminAccount | null { return accounts().find((x) => x.id === id) ?? null; }
export function verifyAdminCredentials(email: string, password: string): AdminUser | null { const item = accounts().find((x) => x.email.trim().toLowerCase() === email.trim().toLowerCase() && x.password === password); if (!item || item.isActive === false) return null; const { password: _password, ...user } = item; return user; }
export function addAdminAccount(account: AdminAccount): void { updateSharedCollection<AdminAccount>("adminAccounts", (items) => [...(items.length ? items : DEFAULT_ADMIN_ACCOUNTS), account]); }
/** Phase 6A: edit/deactivate/role-assignment all go through this. Returns the updated account, or null if no admin with that id exists. */
export function updateAdminAccount(id: string, patch: Partial<AdminAccount>): AdminAccount | null {
  const existing = accounts().find((x) => x.id === id);
  if (!existing) return null;
  const updated: AdminAccount = { ...existing, ...patch };
  updateSharedCollection<AdminAccount>("adminAccounts", (items) => (items.length ? items : DEFAULT_ADMIN_ACCOUNTS).map((item) => (item.id === id ? updated : item)));
  return updated;
}
export function isAdminEmailTaken(email: string, excludingId?: string): boolean {
  const normalized = email.trim().toLowerCase();
  return accounts().some((x) => x.id !== excludingId && x.email.trim().toLowerCase() === normalized);
}
export function generateAdminAccountId(): string { return `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "support"];
