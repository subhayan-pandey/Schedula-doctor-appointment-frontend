export type AdminRole = "super_admin" | "admin" | "support";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};
