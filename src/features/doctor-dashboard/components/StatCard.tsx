import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
};

export default function StatCard({
  label,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        {icon && (
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            {icon}
          </span>
        )}

        <p className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold text-[var(--ink)]">
        {label}
      </p>

      {description && (
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  );
}