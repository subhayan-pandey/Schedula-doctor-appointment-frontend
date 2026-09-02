import type { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-9 text-center sm:px-6 sm:py-10">
      <span className="grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-lg">
        📋
      </span>

      <p className="font-semibold text-[var(--ink)]">{title}</p>

      {description && (
        <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}