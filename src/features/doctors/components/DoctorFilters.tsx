"use client";

import {
  SPECIALTIES,
  type Specialty,
} from "@/types/doctor";

export type DoctorFiltersValue = {
  query: string;
  specialty:
    | Specialty
    | "All";
  availableOnly: boolean;
};

export default function DoctorFilters({
  value,
  onChange,
}: {
  value: DoctorFiltersValue;
  onChange: (
    next: DoctorFiltersValue,
  ) => void;
}) {
  const hasActiveFilters =
    value.query.trim().length > 0 ||
    value.specialty !== "All" ||
    value.availableOnly;

  function clearFilters() {
    onChange({
      query: "",
      specialty: "All",
      availableOnly: false,
    });
  }

  return (
    <section
      aria-label="Doctor filters"
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="doctor-filter-search"
            className="mb-1.5 block text-xs font-semibold text-[var(--ink)]"
          >
            Search doctors
          </label>

          <div className="flex min-h-11 items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 transition-colors focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand-soft)]">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-[var(--muted)]"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-4-4" />
            </svg>

            <label
              htmlFor="doctor-filter-search"
              className="sr-only"
            >
              Search by doctor name, specialty, or condition
            </label>

            <input
              id="doctor-filter-search"
              type="text"
              placeholder="Search by doctor name, specialty, or condition"
              value={value.query}
              onChange={(
                event,
              ) =>
                onChange({
                  ...value,
                  query:
                    event.target
                      .value,
                })
              }
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>

        <div className="w-full lg:w-56">
          <label
            htmlFor="doctor-filter-specialty"
            className="mb-1.5 block text-xs font-semibold text-[var(--ink)]"
          >
            Specialty
          </label>

          <select
            id="doctor-filter-specialty"
            value={
              value.specialty
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...value,
                specialty:
                  event.target
                    .value as
                    | Specialty
                    | "All",
              })
            }
            className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          >
            <option value="All">
              All specialties
            </option>

            {SPECIALTIES.map(
              (specialty) => (
                <option
                  key={
                    specialty
                  }
                  value={
                    specialty
                  }
                >
                  {specialty}
                </option>
              ),
            )}
          </select>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--line)] px-3.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--canvas)] lg:min-w-[190px]">
          <input
            type="checkbox"
            checked={
              value.availableOnly
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...value,
                availableOnly:
                  event.target
                    .checked,
              })
            }
            className="size-4 rounded border-[var(--line)] accent-[var(--brand)]"
          />

          <span>
            Available today
          </span>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-[var(--brand-deep)] transition-colors hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)]"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-xs font-medium text-[var(--muted)]">
            Active filters:
          </span>

          {value.query
            .trim()
            .length > 0 && (
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
              Search:{" "}
              {value.query.trim()}
            </span>
          )}

          {value.specialty !==
            "All" && (
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
              {
                value.specialty
              }
            </span>
          )}

          {value.availableOnly && (
            <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
              Available today
            </span>
          )}
        </div>
      )}
    </section>
  );
}