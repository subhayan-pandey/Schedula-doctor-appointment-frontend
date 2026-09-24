import type { AdminUser } from "@/types/admin/admin-user";

const ADMIN_SESSION_KEY = "schedula:admin-session";

export const ADMIN_SESSION_UPDATED_EVENT = "schedula:admin-session-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAdminSessionUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_UPDATED_EVENT));
}

export function getAdminSession(): AdminUser | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);

    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(adminUser: AdminUser): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));

  emitAdminSessionUpdated();
}

export function clearAdminSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);

  emitAdminSessionUpdated();
}
