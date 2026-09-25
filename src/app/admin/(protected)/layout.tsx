import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminLayoutChrome from "@/components/admin/AdminLayoutChrome";

export const metadata: Metadata = {
  title: "Admin | Schedula",
};

export default function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminLayoutChrome>{children}</AdminLayoutChrome>
    </AdminAuthGuard>
  );
}
