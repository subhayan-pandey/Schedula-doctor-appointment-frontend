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
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-xl">
        📋
      </span>
      <p className="font-semibold text-[var(--ink)]">{title}</p>
      {description && <p className="max-w-xs text-sm text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}