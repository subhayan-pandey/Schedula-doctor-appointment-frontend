import type { Metadata } from "next";

import AdminUsersList from "@/features/admin-admin-users/components/AdminUsersList";

export const metadata: Metadata = {
  title: "Admin Users | Schedula Admin",
};

export default function AdminUsersPage() {
  return <AdminUsersList />;
}
