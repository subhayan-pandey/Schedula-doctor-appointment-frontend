"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import ThemeSelector from "@/components/ui/ThemeSelector";

import type { User } from "@/types/user";

type ProfileMenuProps = {
  user: User;
  onLogout: () => void;
};

function getInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileMenu({
  user,
  onLogout,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const isDoctor =
    user.role === "doctor";

  const profileHref =
    isDoctor
      ? "/doctor/profile"
      : "/profile";

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target =
        event.target as Node;

      if (
        !menuRef.current?.contains(
          target,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) =>
              !current,
          )
        }
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 transition hover:border-[var(--brand)] hover:bg-[var(--canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      >
        <span className="grid size-9 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-deep)]">
          {getInitials(
            user.name,
          )}
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
          className="mr-1 text-[var(--muted)]"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(18,36,43,0.18)]"
        >
          <div className="border-b border-[var(--line)] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
                {getInitials(
                  user.name,
                )}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">
                  {user.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                  {user.emailOrMobile}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
                  {isDoctor
                    ? "Doctor"
                    : "Patient"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Account
            </p>

            {isDoctor ? (
              <>
                <Link
                  href="/doctor/dashboard"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Dashboard
                </Link>

                <Link
                  href="/doctor/appointments"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Appointments
                </Link>

                <Link
                  href="/doctor/calendar"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Calendar
                </Link>

                <Link
                  href="/doctor/prescriptions"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Prescriptions
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/appointments"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  My Appointments
                </Link>

                <Link
                  href="/doctors"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Find Doctors
                </Link>

                <Link
                  href="/medical-documents"
                  role="menuitem"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
                >
                  Medical Documents
                </Link>
              </>
            )}

            <Link
              href={profileHref}
              role="menuitem"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
            >
              My Profile
            </Link>
          </div>

          <div className="border-t border-[var(--line)] p-2">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Schedula
            </p>

            <Link
              href="/search"
              role="menuitem"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
            >
              Search
            </Link>

            <Link
              href="/settings/notifications"
              role="menuitem"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
            >
              Notification Preferences
            </Link>

            <Link
              href="/support"
              role="menuitem"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--canvas)]"
            >
              Support
            </Link>
          </div>

          <div className="border-t border-[var(--line)] p-3">
            <ThemeSelector />
          </div>

          <div className="border-t border-[var(--line)] p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[var(--urgent-deep)] transition hover:bg-[var(--urgent-soft)]"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}