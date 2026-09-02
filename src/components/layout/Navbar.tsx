"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { getSession, clearSession } from "@/lib/storage";
import type { User } from "@/types/user";

const navLinks = [
  { href: "/doctors", label: "Find Doctors" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/doctor/login", label: "For Doctors" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Navbar lives in the root layout, so it never unmounts between page
  // navigations — re-reading the session on every pathname change is what
  // picks up a fresh login/logout without needing a global auth context.
  useEffect(() => {
    Promise.resolve().then(() => setSession(getSession()));
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setSession(null);
    setOpen(false);
    router.push("/");
  }

  const accountHref = session?.role === "doctor" ? "/doctor/dashboard" : "/appointments";
  const accountLabel = session?.role === "doctor" ? "Dashboard" : "My Appointments";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-lg font-bold text-white">
            S
          </span>
          <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            Schedula
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link
                href={accountHref}
                className="max-w-[9rem] truncate text-sm font-medium text-[var(--ink)] hover:text-[var(--brand)] lg:max-w-none"
              >
                Hi, {session.name}
                <span className="hidden lg:inline"> · {accountLabel}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand)]"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg border border-[var(--line)] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d={open ? "M5 5l10 10M15 5L5 15" : "M3 5h14M3 10h14M3 15h14"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-[var(--line)] px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--brand-soft)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-[var(--line)] pt-3">
            {session ? (
              <>
                <Link
                  href={accountHref}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                  onClick={() => setOpen(false)}
                >
                  Hi, {session.name} · {accountLabel}
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}