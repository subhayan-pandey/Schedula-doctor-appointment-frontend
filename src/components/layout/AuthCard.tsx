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
    <main className="mx-auto flex min-h-[calc(100vh-140px)] w-full flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
      <div
        className={`mx-auto w-full ${
          wide
            ? "max-w-2xl"
            : "max-w-md"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Go to Schedula home"
            className="grid size-14 place-items-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          >
            S
          </Link>

          {subtitle && (
            <span className="mt-4 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
              {subtitle}
            </span>
          )}

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[26px]">
            {title}
          </h1>
        </div>

        <section className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
          {children}
        </section>
      </div>
    </main>
  );
}