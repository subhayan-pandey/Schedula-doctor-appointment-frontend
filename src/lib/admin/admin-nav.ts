import type { AdminModule } from "@/lib/admin/admin-permissions";

export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  module: AdminModule;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
    module: "dashboard",
  },
  {
    key: "doctors",
    label: "Doctors",
    href: "/admin/doctors",
    module: "doctors",
  },
  {
    key: "doctor-verification",
    label: "Doctor Verification",
    href: "/admin/doctor-verification",
    module: "doctorVerification",
  },
  {
    key: "patients",
    label: "Patients",
    href: "/admin/patients",
    module: "patients",
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "/admin/appointments",
    module: "appointments",
  },
  {
    key: "payments",
    label: "Payments",
    href: "/admin/payments",
    module: "payments",
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    module: "reviews",
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/admin/notifications",
    module: "notifications",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    module: "analytics",
  },
  {
    key: "reports",
    label: "Reports",
    href: "/admin/reports",
    module: "reports",
  },
  {
    key: "admin-users",
    label: "Admin Users",
    href: "/admin/admin-users",
    module: "adminUsers",
  },
  {
    key: "audit-logs",
    label: "Audit Logs",
    href: "/admin/audit-logs",
    module: "auditLogs",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    module: "settings",
  },
];

/** Finds the nav item whose href matches (or is the closest parent of) the given pathname. */
export function findActiveAdminNavItem(
  pathname: string,
): AdminNavItem | undefined {
  const exactMatch = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);

  if (exactMatch) {
    return exactMatch;
  }

  return ADMIN_NAV_ITEMS.filter(
    (item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
