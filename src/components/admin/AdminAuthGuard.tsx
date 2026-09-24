"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import LoadingState from "@/components/admin/ui/LoadingState";

import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminAuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAdminAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || !isAuthenticated) {
    return <LoadingState message="Checking admin session…" />;
  }

  return <>{children}</>;
}
