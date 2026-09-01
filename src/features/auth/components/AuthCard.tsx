import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12 sm:px-0">
      <div className="flex flex-col items-center gap-3 text-center">
        <Link
          href="/"
          className="grid size-16 place-items-center rounded-2xl bg-[var(--brand)] text-2xl font-bold text-white"
        >
          S
        </Link>
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