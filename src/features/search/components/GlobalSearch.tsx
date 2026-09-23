"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import { getAllBookings } from "@/lib/bookings-store";
import { getAllDoctors } from "@/lib/doctors-store";
import { getSupportTicketsByUserId } from "@/lib/support-ticket-store";
import { getSession } from "@/lib/storage";

import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";
import type {
  GlobalSearchResult,
  GlobalSearchResultType,
} from "@/types/search";
import type { SupportTicket } from "@/types/support-ticket";

const FILTERS: Array<{
  key: "all" | GlobalSearchResultType;
  label: string;
}> = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "doctor",
    label: "Doctors",
  },
  {
    key: "appointment",
    label: "Appointments",
  },
  {
    key: "support",
    label: "Support",
  },
];

type SearchData = {
  doctors: Doctor[];
  appointments: Booking[];
  tickets: SupportTicket[];
};

function loadSearchData(): SearchData {
  const session = getSession();

  const doctors = getAllDoctors();

  const allBookings = getAllBookings();

  const appointments = session
    ? allBookings.filter((booking) =>
        session.role === "doctor"
          ? booking.doctorId === session.id
          : booking.patientId === session.id,
      )
    : [];

  const tickets = session
    ? getSupportTicketsByUserId(session.id)
    : [];

  return {
    doctors,
    appointments,
    tickets,
  };
}

function includesQuery(
  value: string,
  query: string,
) {
  return value
    .toLocaleLowerCase()
    .includes(query.toLocaleLowerCase());
}

function createResults(
  data: SearchData,
  query: string,
): GlobalSearchResult[] {
  const normalized = query.trim();

  if (!normalized) {
    return [];
  }

  const results: GlobalSearchResult[] =
    [];

  data.doctors.forEach((doctor) => {
    const searchable = [
      doctor.name,
      doctor.specialty,
      doctor.qualification,
      doctor.clinic,
      doctor.location,
    ].join(" ");

    if (
      includesQuery(
        searchable,
        normalized,
      )
    ) {
      results.push({
        id: `doctor-${doctor.id}`,
        type: "doctor",
        title: doctor.name,
        description: `${doctor.specialty} · ${doctor.clinic}`,
        href: `/doctors/${doctor.id}`,
      });
    }
  });

  data.appointments.forEach(
    (booking) => {
      const searchable = [
        booking.patientName,
        booking.date,
        booking.time,
        booking.status,
        booking.id,
      ].join(" ");

      if (
        includesQuery(
          searchable,
          normalized,
        )
      ) {
        results.push({
          id: `appointment-${booking.id}`,
          type: "appointment",
          title: `Appointment · ${booking.date} at ${booking.time}`,
          description: `${booking.patientName} · ${booking.status}`,
          href: `/appointments/${booking.id}`,
        });
      }
    },
  );

  data.tickets.forEach((ticket) => {
    const searchable = [
      ticket.subject,
      ticket.description,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.id,
    ].join(" ");

    if (
      includesQuery(
        searchable,
        normalized,
      )
    ) {
      results.push({
        id: `support-${ticket.id}`,
        type: "support",
        title: ticket.subject,
        description: `${ticket.category} · ${ticket.status}`,
        href: `/support?ticket=${encodeURIComponent(
          ticket.id,
        )}`,
      });
    }
  });

  return results;
}

function ResultIcon({
  type,
}: {
  type: GlobalSearchResultType;
}) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
      {type === "doctor"
        ? "Dr"
        : type === "appointment"
          ? "Ap"
          : "?"}
    </span>
  );
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");

  const [filter, setFilter] = useState<
    "all" | GlobalSearchResultType
  >("all");

  const [data, setData] =
    useState<SearchData>(
      loadSearchData,
    );

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setData(loadSearchData());
      setError(null);
    } catch {
      setError(
        "Search data could not be loaded. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (
        !event.key ||
        [
          "schedula:bookings",
          "schedula:doctors",
          "schedula:support-tickets",
          "schedula:session",
        ].includes(event.key)
      ) {
        refresh();
      }
    };

    window.addEventListener(
      "schedula:bookings-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:doctors-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:support-tickets-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:support-ticket-messages-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:session-updated",
      handleUpdate,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:doctors-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:support-tickets-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:support-ticket-messages-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:session-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, [refresh]);

  const results = useMemo(() => {
    const allResults = createResults(
      data,
      query,
    );

    if (filter === "all") {
      return allResults;
    }

    return allResults.filter(
      (result) =>
        result.type === filter,
    );
  }, [data, filter, query]);

  const hasQuery =
    query.trim().length > 0;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Search Schedula
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Find doctors, appointments and
          support tickets from one place.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
        <label
          htmlFor="global-search"
          className="sr-only"
        >
          Search Schedula
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search doctors, appointments or support tickets…"
            className="min-h-11 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />

          {query ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setQuery("")}
            >
              Clear
            </Button>
          ) : null}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Search filters"
        >
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setFilter(item.key)
              }
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                filter === item.key
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--canvas)] text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] p-4 text-sm text-[var(--urgent-deep)]">
          <p>{error}</p>

          <button
            type="button"
            onClick={refresh}
            className="mt-2 font-medium underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!hasQuery ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--ink)]">
            Start typing to search
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Search by doctor name, specialty,
            appointment details, or ticket
            information.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-[var(--ink)]">
            No results found
          </p>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Try a different search term or
            change the filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
          <div className="divide-y divide-[var(--line)]">
            {results.map((result) => (
              <Link
                key={result.id}
                href={result.href}
                className="flex items-center gap-3 px-5 py-4 transition hover:bg-[var(--canvas)] sm:px-6"
              >
                <ResultIcon
                  type={result.type}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--ink)]">
                    {result.title}
                  </span>

                  <span className="mt-1 block truncate text-xs text-[var(--muted)]">
                    {result.description}
                  </span>
                </span>

                <span
                  className="text-[var(--muted)]"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}