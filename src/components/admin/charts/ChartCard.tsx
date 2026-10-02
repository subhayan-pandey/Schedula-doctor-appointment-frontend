import type { ReactNode } from "react";

import EmptyState from "@/components/ui/EmptyState";

type ChartCardProps = {
  title: string;
  description?: string;
  /** Slot shown top-right of the header (e.g. a small summary). */
  aside?: ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  footnote?: string;
  className?: string;
  children: ReactNode;
};

export default function ChartCard({
  title,
  description,
  aside,
  isEmpty = false,
  emptyTitle = "No data for this period",
  emptyDescription = "Try a wider date range.",
  footnote,
  className = "",
  children,
}: ChartCardProps) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--ink)]">{title}</h2>

          {description && (
            <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
          )}
        </div>

        {aside}
      </header>

      <div className="mt-5">
        {isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </div>

      {footnote && !isEmpty && (
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{footnote}</p>
      )}
    </section>
  );
}
