import type { ReactNode } from "react";

import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
