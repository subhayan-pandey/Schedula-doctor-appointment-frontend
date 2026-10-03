export type AdminRole = "super_admin" | "admin" | "support";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  /** Phase 6A. Optional — missing means active. Checked at login by verifyAdminCredentials(). */
  isActive?: boolean;
};
