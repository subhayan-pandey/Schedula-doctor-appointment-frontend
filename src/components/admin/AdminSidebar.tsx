"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ADMIN_NAV_ITEMS } from "@/lib/admin/admin-nav";

import { adminToast } from "@/components/admin/ui/toast";
import AdminNavIcon from "@/components/admin/AdminNavIcon";

function SidebarBrand(): ReactNode {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2.5 px-4 py-4"
      aria-label="Schedula Admin, go to dashboard"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-sm font-bold text-white">
        S
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-[var(--ink)]">
          Schedula
        </span>
        <span className="text-xs text-[var(--muted)]">Admin Portal</span>
      </span>
    </Link>
  );
}

function isItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1 px-3">
      {ADMIN_NAV_ITEMS.map((item) => {
        if (!item.implemented) {
          return (
            <button
              key={item.key}
              type="button"
              aria-disabled="true"
              onClick={() =>
                adminToast.info(`${item.label} is coming soon.`)
              }
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--line)]/30"
            >
              <span className="flex items-center gap-2.5">
                <AdminNavIcon itemKey={item.key} className="shrink-0 opacity-70" />
                {item.label}
              </span>

              <span className="shrink-0 rounded-full bg-[var(--line)]/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Soon
              </span>
            </button>
          );
        }

        const isActive = isItemActive(item.href, pathname);

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                : "text-[var(--ink)] hover:bg-[var(--line)]/30"
            }`}
          >
            <AdminNavIcon itemKey={item.key} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

type AdminSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] lg:flex">
        <SidebarBrand />

        <div className="flex-1 overflow-y-auto pb-4">
          <SidebarNavList pathname={pathname} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-[var(--surface)] shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <SidebarBrand />

              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--line)]/50 hover:text-[var(--ink)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
              <SidebarNavList pathname={pathname} onNavigate={onMobileClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
