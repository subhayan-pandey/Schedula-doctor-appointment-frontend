"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import NotificationBell from "@/components/ui/NotificationBell";

import {
  clearSession,
  getSession,
} from "@/lib/storage";

import type {
  User,
} from "@/types/user";

const navLinks = [
  {
    href: "/doctors",
    label: "Find Doctors",
  },
  {
    href: "/#how-it-works",
    label: "How it works",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setUser(getSession());
    });
  }, [pathname]);

  function handleLogout() {
    clearSession();

    setUser(null);

    router.push("/");
  }

  const isDoctor =
    user?.role === "doctor";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-lg font-bold text-white">
            S
          </span>

          <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            Schedula
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[var(--brand-deep)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user &&
            (isDoctor ? (
              <>
                <Link
                  href="/doctor/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/doctor/dashboard"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/doctor/appointments"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/doctor/appointments"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Appointments
                </Link>

                <Link
                  href="/doctor/prescriptions"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/doctor/prescriptions"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Prescriptions
                </Link>

                <Link
                  href="/doctor/calendar"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/doctor/calendar"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Calendar
                </Link>

                <Link
                  href="/doctor/profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/doctor/profile"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/appointments"
                  className={`text-sm font-medium transition-colors ${
                    pathname ===
                    "/appointments"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  My appointments
                </Link>

                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/profile"
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  My Profile
                </Link>
              </>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <NotificationBell />
          )}

          {user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm font-medium text-[var(--ink)] sm:block">
                {user.name}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block"
              >
                <Button
                  variant="outline"
                  size="sm"
                >
                  Log in
                </Button>
              </Link>

              <Link href="/signup">
                <Button size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}