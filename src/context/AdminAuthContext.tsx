"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ADMIN_SESSION_UPDATED_EVENT,
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from "@/lib/admin/admin-session-store";

import { verifyAdminCredentials } from "@/lib/admin/admin-accounts-store";

import { logAdminAction } from "@/lib/admin/audit-log-store";

import type { AdminUser } from "@/types/admin/admin-user";

type AdminLoginResult =
  | { success: true }
  | { success: false; error: string };

type AdminAuthContextValue = {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<AdminLoginResult>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Unlike AdminDoctorsList/AdminDashboard, AdminAuthProvider IS
    // server-rendered (it sits in src/app/admin/layout.tsx, above
    // AdminAuthGuard's SSR-vs-client branch), so its first render must
    // match on server and client to avoid a hydration mismatch.
    // localStorage doesn't exist during SSR, so `initialized` has to
    // start false there and flip to true only after mount, once we
    // actually know whether a session exists — that's exactly what
    // this pair of setState calls does. It's a deliberate exception to
    // the lint rule, not the "fetch on mount" anti-pattern the rule is
    // meant to catch, so it's suppressed explicitly rather than
    // rewritten into something SSR-unsafe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdminUser(getAdminSession());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialized(true);

    function handleSessionUpdated(): void {
      setAdminUser(getAdminSession());
    }

    window.addEventListener(
      ADMIN_SESSION_UPDATED_EVENT,
      handleSessionUpdated,
    );

    return () => {
      window.removeEventListener(
        ADMIN_SESSION_UPDATED_EVENT,
        handleSessionUpdated,
      );
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AdminLoginResult> => {
      const account = verifyAdminCredentials(email, password);

      if (!account) {
        return {
          success: false,
          error: "Invalid email or password.",
        };
      }

      setAdminSession(account);
      setAdminUser(account);

      logAdminAction({
        adminId: account.id,
        adminName: account.name,
        action: "login",
        entityType: "admin-session",
        entityId: account.id,
        entityLabel: account.name,
        description: `${account.name} logged in to the Admin Portal`,
      });

      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    if (adminUser) {
      logAdminAction({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: "logout",
        entityType: "admin-session",
        entityId: adminUser.id,
        entityLabel: adminUser.name,
        description: `${adminUser.name} logged out of the Admin Portal`,
      });
    }

    clearAdminSession();
    setAdminUser(null);
  }, [adminUser]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        initialized,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used within an AdminAuthProvider",
    );
  }

  return context;
}
