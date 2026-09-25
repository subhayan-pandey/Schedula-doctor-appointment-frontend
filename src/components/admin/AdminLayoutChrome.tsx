"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayoutChrome({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset the mobile drawer on navigation. Done during render (React's
  // documented pattern for "resetting state when a prop changes") rather
  // than in a useEffect, which avoids the extra render pass and the
  // react-hooks/set-state-in-effect lint error that comes with calling
  // setState synchronously inside an effect.
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-[var(--canvas)]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
