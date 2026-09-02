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
    <div
      className={`mx-auto flex min-h-[calc(100vh-140px)] flex-col justify-center px-4 py-12 sm:px-0 ${
        wide ? "max-w-2xl" : "max-w-md"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Link
          href="/"
          className="grid size-16 place-items-center rounded-2xl bg-[var(--brand)] text-2xl font-bold text-white"
        >
          S
        </Link>
        {subtitle && (
          <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            {subtitle}
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h1>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}