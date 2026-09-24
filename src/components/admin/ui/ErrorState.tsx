import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem continues, refresh the page.",
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center ${className}`}
      role="alert"
    >
      <span className="grid size-11 place-items-center rounded-full bg-[var(--urgent-soft)] text-[var(--urgent-deep)]">
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
          <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
          <path d="M12 9v4.5" />
          <path d="M12 16.5h.01" />
          <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" />
        </svg>
      </span>

      <p className="mt-4 font-semibold text-[var(--ink)]">{title}</p>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
