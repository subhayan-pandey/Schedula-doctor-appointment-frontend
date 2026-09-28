"use client";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { setAdminUser } from "@/store/slices/authSlice";
import { verifyAdminCredentials } from "@/lib/admin/admin-accounts-store";
import { logAdminAction } from "@/lib/admin/audit-log-store";
import type { AdminUser } from "@/types/admin/admin-user";
type LoginResult = { success: true } | { success: false; error: string };
type ContextValue = { adminUser: AdminUser | null; isAuthenticated: boolean; initialized: boolean; login: (email: string, password: string) => Promise<LoginResult>; logout: () => void };
const Context = createContext<ContextValue | undefined>(undefined);
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const adminUser = useSelector((state: RootState) => state.auth.adminUser);
  const initialized = useSelector((state: RootState) => state.auth.initialized);
  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const account = verifyAdminCredentials(email, password);
    if (!account) return { success: false, error: "Invalid email or password." };
    dispatch(setAdminUser(account));
    logAdminAction({ adminId: account.id, adminName: account.name, action: "login", entityType: "admin-session", entityId: account.id, entityLabel: account.name, description: `${account.name} logged in to the Admin Portal` });
    return { success: true };
  }, [dispatch]);
  const logout = useCallback(() => {
    if (adminUser) logAdminAction({ adminId: adminUser.id, adminName: adminUser.name, action: "logout", entityType: "admin-session", entityId: adminUser.id, entityLabel: adminUser.name, description: `${adminUser.name} logged out of the Admin Portal` });
    dispatch(setAdminUser(null));
  }, [adminUser, dispatch]);
  return <Context.Provider value={{ adminUser, isAuthenticated: Boolean(adminUser), initialized, login, logout }}>{children}</Context.Provider>;
}
export function useAdminAuth(): ContextValue { const value = useContext(Context); if (!value) throw new Error("useAdminAuth must be used within an AdminAuthProvider"); return value; }
