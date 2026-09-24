"use client";

import Button from "@/components/ui/Button";

import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminHomePage() {
  const { adminUser, logout } = useAdminAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
        Admin Portal
      </span>

      <h1 className="text-2xl font-semibold text-[var(--ink)]">
        You&apos;re signed in, {adminUser?.name}.
      </h1>

      <p className="text-sm leading-6 text-[var(--muted)]">
        This placeholder confirms the login → protected route → logout flow
        works end to end. It will become the full Dashboard in Phase 1D, and
        the Sidebar/Header from Phase 1C will wrap this and every future
        admin page.
      </p>

      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </main>
  );
}
