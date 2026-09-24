import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminAuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--canvas)] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[var(--brand-soft)]/55" />

      <div className="relative w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            aria-label="Return to Schedula home"
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:ring-offset-2"
          >
            S
          </Link>

          <span className="mt-4 inline-flex items-center rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            Admin Portal
          </span>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
          {children}
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
          Schedula Admin Portal is a frontend demonstration. Authentication
          is simulated locally.
        </p>
      </div>
    </main>
  );
}
