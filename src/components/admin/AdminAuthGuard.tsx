"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import LoadingState from "@/components/admin/ui/LoadingState";

import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getAdminModuleForPath,
  hasAdminPermission,
} from "@/lib/admin/admin-permissions";
import { adminToast } from "@/components/admin/ui/toast";

export default function AdminAuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminUser, isAuthenticated, initialized } = useAdminAuth();
  const canViewRoute = hasAdminPermission(
    adminUser,
    getAdminModuleForPath(pathname),
    "view",
  );

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    if (initialized && isAuthenticated && !canViewRoute) {
      adminToast.error("You do not have access to that section.");
      router.replace("/admin");
    }
  }, [canViewRoute, initialized, isAuthenticated, router]);

  if (!initialized || !isAuthenticated || !canViewRoute) {
    return <LoadingState message="Checking admin session…" />;
  }

  return <>{children}</>;
}
