import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthCard({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[var(--brand-soft)]/55" />

      <div
        className={`relative w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="text-center">
          <Link
            href="/"
            aria-label="Return to Schedula home"
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:ring-offset-2"
          >
            S
          </Link>

          {subtitle && (
            <span className="mt-4 inline-flex items-center rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
              {subtitle}
            </span>
          )}

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            {title}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
            {subtitle === "For Doctors"
              ? "Manage your professional profile, availability, and appointments with Schedula."
              : title === "Login"
                ? "Sign in to manage your appointments and continue your care journey."
                : "Create your Schedula account to find doctors and book appointments."}
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
          {children}
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
          Schedula is a frontend demonstration. Authentication
          is simulated locally.
        </p>
      </div>
    </main>
  );
}