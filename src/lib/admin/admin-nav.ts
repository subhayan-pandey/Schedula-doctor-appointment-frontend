export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  /** false renders the item as a disabled "Coming Soon" entry instead of a link. */
  implemented: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
    implemented: true,
  },
  {
    key: "doctors",
    label: "Doctors",
    href: "/admin/doctors",
    implemented: false,
  },
  {
    key: "doctor-verification",
    label: "Doctor Verification",
    href: "/admin/doctor-verification",
    implemented: false,
  },
  {
    key: "patients",
    label: "Patients",
    href: "/admin/patients",
    implemented: false,
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "/admin/appointments",
    implemented: false,
  },
  {
    key: "payments",
    label: "Payments",
    href: "/admin/payments",
    implemented: false,
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    implemented: false,
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/admin/notifications",
    implemented: false,
  },
  {
    key: "reports",
    label: "Reports",
    href: "/admin/reports",
    implemented: false,
  },
  {
    key: "admin-users",
    label: "Admin Users",
    href: "/admin/admin-users",
    implemented: false,
  },
  {
    key: "audit-logs",
    label: "Audit Logs",
    href: "/admin/audit-logs",
    implemented: false,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    implemented: false,
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
