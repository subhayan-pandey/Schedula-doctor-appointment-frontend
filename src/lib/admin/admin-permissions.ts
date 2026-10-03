import type { AdminRole, AdminUser } from "@/types/admin/admin-user";

export type AdminAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject";

export type AdminModule =
  | "dashboard"
  | "doctors"
  | "doctorVerification"
  | "patients"
  | "appointments"
  | "payments"
  | "reviews"
  | "notifications"
  | "analytics"
  | "reports"
  | "adminUsers"
  | "auditLogs"
  | "settings"
  | "platformSettings";

type PermissionMatrix = Record<AdminRole, Partial<Record<AdminModule, AdminAction[]>>>;

const ALL_ACTIONS: AdminAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "reject",
];

const VIEW_ONLY: AdminAction[] = ["view"];
const VIEW_AND_EDIT: AdminAction[] = ["view", "edit"];

/**
 * The portal has three predefined roles. Keep policy decisions here so route
 * guards, navigation, and page controls always agree about what a role can do.
 */
export const ADMIN_PERMISSION_MATRIX: PermissionMatrix = {
  super_admin: {
    dashboard: VIEW_ONLY,
    doctors: ALL_ACTIONS,
    doctorVerification: ALL_ACTIONS,
    patients: ALL_ACTIONS,
    appointments: ALL_ACTIONS,
    payments: ALL_ACTIONS,
    reviews: ALL_ACTIONS,
    notifications: ALL_ACTIONS,
    analytics: VIEW_ONLY,
    reports: VIEW_ONLY,
    adminUsers: ALL_ACTIONS,
    auditLogs: VIEW_ONLY,
    settings: VIEW_AND_EDIT,
    platformSettings: VIEW_AND_EDIT,
  },
  admin: {
    dashboard: VIEW_ONLY,
    doctors: VIEW_AND_EDIT,
    doctorVerification: ["view", "approve", "reject"],
    patients: VIEW_AND_EDIT,
    appointments: VIEW_ONLY,
    payments: VIEW_ONLY,
    reviews: VIEW_AND_EDIT,
    notifications: ["view", "create"],
    analytics: VIEW_ONLY,
    reports: VIEW_ONLY,
    adminUsers: VIEW_ONLY,
    auditLogs: VIEW_ONLY,
    settings: VIEW_AND_EDIT,
  },
  support: {
    dashboard: VIEW_ONLY,
    doctors: VIEW_ONLY,
    patients: VIEW_ONLY,
    appointments: VIEW_ONLY,
    reviews: VIEW_ONLY,
    notifications: VIEW_ONLY,
    auditLogs: VIEW_ONLY,
    settings: VIEW_AND_EDIT,
  },
};

export function hasAdminPermission(
  user: AdminUser | null | undefined,
  module: AdminModule,
  action: AdminAction,
): boolean {
  return Boolean(user && ADMIN_PERMISSION_MATRIX[user.role][module]?.includes(action));
}

export const ADMIN_ROUTE_MODULES: Array<{ path: string; module: AdminModule }> = [
  { path: "/admin/doctor-verification", module: "doctorVerification" },
  { path: "/admin/admin-users", module: "adminUsers" },
  { path: "/admin/audit-logs", module: "auditLogs" },
  { path: "/admin/appointments", module: "appointments" },
  { path: "/admin/notifications", module: "notifications" },
  { path: "/admin/analytics", module: "analytics" },
  { path: "/admin/payments", module: "payments" },
  { path: "/admin/settings", module: "settings" },
  { path: "/admin/doctors", module: "doctors" },
  { path: "/admin/patients", module: "patients" },
  { path: "/admin/reviews", module: "reviews" },
  { path: "/admin/reports", module: "reports" },
  { path: "/admin", module: "dashboard" },
];

export function getAdminModuleForPath(pathname: string): AdminModule {
  return (
    ADMIN_ROUTE_MODULES.find(
      ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
    )?.module ?? "dashboard"
  );
}
