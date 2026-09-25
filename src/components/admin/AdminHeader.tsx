"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { findActiveAdminNavItem } from "@/lib/admin/admin-nav";
import { getInitials } from "@/lib/utils/text";

import { useAdminAuth } from "@/context/AdminAuthContext";

import type { AdminRole } from "@/types/admin/admin-user";

function formatAdminRole(role: AdminRole): string {
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function ProfileMenu() {
  const { adminUser, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!adminUser) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] py-1 pl-1 pr-3 transition-colors hover:border-[var(--brand)]/40"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand-deep)]">
          {getInitials(adminUser.name)}
        </span>

        <span className="hidden text-sm font-medium text-[var(--ink)] sm:inline">
          {adminUser.name}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--muted)]"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">
              {adminUser.name}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {adminUser.email}
            </p>
            <p className="mt-1 inline-flex items-center rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
              {formatAdminRole(adminUser.role)}
            </p>
          </div>

          <div className="my-1 h-px bg-[var(--line)]" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--urgent-deep)] transition-colors hover:bg-[var(--urgent-soft)]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const activeItem = findActiveAdminNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--ink)] transition-colors hover:bg-[var(--line)]/40 lg:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
          </svg>
        </button>

        <h1 className="text-sm font-semibold text-[var(--ink)] sm:text-base">
          {activeItem?.label ?? "Admin Portal"}
        </h1>
      </div>

      <ProfileMenu />
    </header>
  );
}
