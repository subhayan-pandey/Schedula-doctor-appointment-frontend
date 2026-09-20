"use client";

import type {
  BookingStatus,
} from "@/types/booking";

export type AppointmentFilterStatus =
  | BookingStatus
  | "all";

export type AppointmentFilterValues = {
  search: string;
  date: string;
  status: AppointmentFilterStatus;
};

type AppointmentFiltersProps = {
  value: AppointmentFilterValues;
  onChange: (
    value: AppointmentFilterValues,
  ) => void;
  resultCount: number;
};

const STATUS_OPTIONS: {
  label: string;
  value: AppointmentFilterStatus;
}[] = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Confirmed",
    value: "confirmed",
  },
  {
    label: "Upcoming",
    value: "upcoming",
  },
  {
    label: "Declined",
    value: "declined",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
  {
    label: "Missed",
    value: "missed",
  },
];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />

      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3v3m10-3v3M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V8a2.5 2.5 0 0 1 2.5-2.5Z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M7 12h10m-7 6h4"
      />
    </svg>
  );
}

function getStatusLabel(
  status: AppointmentFilterStatus,
) {
  switch (status) {
    case "all":
      return "All statuses";

    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "upcoming":
      return "Upcoming";

    case "declined":
      return "Declined";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";

    default:
      return status;
  }
}

export default function AppointmentFilters({
  value,
  onChange,
  resultCount,
}: AppointmentFiltersProps) {
  const hasActiveFilters =
    value.search.trim().length >
      0 ||
    value.date.length > 0 ||
    value.status !== "all";

  function updateFilter(
    updates: Partial<AppointmentFilterValues>,
  ) {
    onChange({
      ...value,
      ...updates,
    });
  }

  function clearFilters() {
    onChange({
      search: "",
      date: "",
      status: "all",
    });
  }

  return (
    <section
      aria-label="Appointment filters"
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <FilterIcon />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">
              Find appointments
            </h2>

            <p className="text-xs text-[var(--muted)]">
              Search and filter your
              appointments.
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)] sm:text-right">
          {resultCount}{" "}
          {resultCount === 1
            ? "appointment"
            : "appointments"}{" "}
          found
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <label className="block">
          <span className="sr-only">
            Search appointments
          </span>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <SearchIcon />
            </span>

            <input
              type="search"
              value={value.search}
              onChange={(event) =>
                updateFilter({
                  search:
                    event.target.value,
                })
              }
              placeholder="Search patient, appointment ID..."
              className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
            />
          </div>
        </label>

        <label className="block">
          <span className="sr-only">
            Filter by date
          </span>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--muted)]">
              <CalendarIcon />
            </span>

            <input
              type="date"
              value={value.date}
              onChange={(event) =>
                updateFilter({
                  date:
                    event.target.value,
                })
              }
              className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
              aria-label="Filter appointments by date"
            />
          </div>
        </label>

        <label className="block">
          <span className="sr-only">
            Filter by status
          </span>

          <select
            value={value.status}
            onChange={(event) =>
              updateFilter({
                status:
                  event.target
                    .value as AppointmentFilterStatus,
              })
            }
            className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
            aria-label="Filter appointments by status"
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </label>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`h-10 rounded-lg border px-4 text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)]"
              : "cursor-not-allowed border-[var(--line)] bg-[var(--canvas)] text-[var(--muted)]"
          }`}
        >
          Clear
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--muted)]">
            Active filters:
          </span>

          {value.search.trim()
            .length > 0 && (
            <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]">
              Search:{" "}
              {value.search.trim()}
            </span>
          )}

          {value.date && (
            <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]">
              Date:{" "}
              {value.date}
            </span>
          )}

          {value.status !==
            "all" && (
            <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]">
              Status:{" "}
              {getStatusLabel(
                value.status,
              )}
            </span>
          )}
        </div>
      )}
    </section>
  );
}