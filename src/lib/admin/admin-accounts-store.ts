import type { AdminRole, AdminUser } from "@/types/admin/admin-user";

const ADMIN_ACCOUNTS_KEY = "schedula:admin-accounts";

export type AdminAccount = AdminUser & {
  password: string;
};

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "admin-1",
    name: "Alex Morgan",
    email: "admin@schedula.com",
    password: "Admin@123",
    role: "super_admin",
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAdminAccount(value: unknown): value is AdminAccount {
  if (!value || typeof value !== "object") {
    return false;
  }

  const account = value as Partial<AdminAccount>;

  return (
    typeof account.id === "string" &&
    typeof account.name === "string" &&
    typeof account.email === "string" &&
    typeof account.password === "string" &&
    typeof account.role === "string"
  );
}

function readAdminAccounts(): AdminAccount[] {
  if (!isBrowser()) {
    return DEFAULT_ADMIN_ACCOUNTS;
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_ACCOUNTS_KEY);

    if (!raw) {
      window.localStorage.setItem(
        ADMIN_ACCOUNTS_KEY,
        JSON.stringify(DEFAULT_ADMIN_ACCOUNTS),
      );

      return DEFAULT_ADMIN_ACCOUNTS;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return DEFAULT_ADMIN_ACCOUNTS;
    }

    const accounts = parsed.filter(isAdminAccount);

    return accounts.length > 0 ? accounts : DEFAULT_ADMIN_ACCOUNTS;
  } catch {
    return DEFAULT_ADMIN_ACCOUNTS;
  }
}

function writeAdminAccounts(accounts: AdminAccount[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

/** Returns every seeded/created admin account (password included — for Phase 6's Admin User Management only, never for display). */
export function getAdminAccounts(): AdminAccount[] {
  return readAdminAccounts();
}

export function verifyAdminCredentials(
  email: string,
  password: string,
): AdminUser | null {
  const normalizedEmail = normalizeEmail(email);

  const account = readAdminAccounts().find(
    (candidate) =>
      normalizeEmail(candidate.email) === normalizedEmail &&
      candidate.password === password,
  );

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

export function addAdminAccount(account: AdminAccount): void {
  const accounts = readAdminAccounts();

  writeAdminAccounts([...accounts, account]);
}

export function generateAdminAccountId(): string {
  return `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "support"];
