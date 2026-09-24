import type { ReactNode } from "react";

type SearchFilterProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  children?: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
};

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchLabel = "Search",
  children,
  hasActiveFilters = false,
  onClearFilters,
  className = "",
}: SearchFilterProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:gap-4 ${className}`}
    >
      <label className="relative flex-1">
        <span className="sr-only">{searchLabel}</span>

        <svg
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>

        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] transition-all duration-200 hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
        />
      </label>

      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}

      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
