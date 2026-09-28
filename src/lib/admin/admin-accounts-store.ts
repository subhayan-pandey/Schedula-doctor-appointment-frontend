import type { AdminRole, AdminUser } from "@/types/admin/admin-user";
import { getSharedCollection, updateSharedCollection } from "@/lib/redux-data";
export type AdminAccount = AdminUser & { password: string };
const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [{ id: "admin-1", name: "Alex Morgan", email: "admin@schedula.com", password: "Admin@123", role: "super_admin" }];
const accounts = (): AdminAccount[] => { const saved = getSharedCollection<AdminAccount>("adminAccounts"); return saved.length ? saved : DEFAULT_ADMIN_ACCOUNTS; };
export function getAdminAccounts(): AdminAccount[] { return accounts(); }
export function verifyAdminCredentials(email: string, password: string): AdminUser | null { const item = accounts().find((x) => x.email.trim().toLowerCase() === email.trim().toLowerCase() && x.password === password); if (!item) return null; const { password: _password, ...user } = item; return user; }
export function addAdminAccount(account: AdminAccount): void { updateSharedCollection<AdminAccount>("adminAccounts", (items) => [...(items.length ? items : DEFAULT_ADMIN_ACCOUNTS), account]); }
export function generateAdminAccountId(): string { return `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "support"];
