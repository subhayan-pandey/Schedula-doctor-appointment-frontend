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
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="2"
          />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      </span>

      <p className="mt-4 font-semibold text-[var(--ink)]">
        {title}
      </p>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}