import type { AdminRole } from "@/types/admin/admin-user";

export function formatAdminRole(role: AdminRole): string {
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function getAdminRoleTone(
  role: AdminRole,
): "brand" | "success" | "neutral" {
  switch (role) {
    case "super_admin":
      return "brand";
    case "admin":
      return "success";
    default:
      return "neutral";
  }
}
