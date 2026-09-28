import type { AdminUser } from "@/types/admin/admin-user";
import { store } from "@/store";
import { setAdminUser } from "@/store/slices/authSlice";
export const ADMIN_SESSION_UPDATED_EVENT = "schedula:admin-session-updated";
export function getAdminSession(): AdminUser | null { return store.getState().auth.adminUser; }
export function setAdminSession(user: AdminUser): void { store.dispatch(setAdminUser(user)); if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_SESSION_UPDATED_EVENT)); }
export function clearAdminSession(): void { store.dispatch(setAdminUser(null)); if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_SESSION_UPDATED_EVENT)); }
