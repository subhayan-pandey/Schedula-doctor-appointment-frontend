"use client";

import Button from "@/components/ui/Button";

import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminHomePage() {
  const { adminUser, logout } = useAdminAuth();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
      <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
        Admin Portal
      </span>

      <h1 className="text-2xl font-semibold text-[var(--ink)]">
        You&apos;re signed in, {adminUser?.name}.
      </h1>

      <p className="text-sm leading-6 text-[var(--muted)]">
        The Sidebar and Header are live. This placeholder becomes the full
        Dashboard (stats, trends, recent activity) in Phase 1D.
      </p>

      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
