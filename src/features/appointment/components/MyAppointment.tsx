"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import { getAllBookings } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";
import { formatLongDate } from "@/lib/utils/date";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const TABS: {
  label: string;
  status: BookingStatus;
}[] = [
  {
    label: "Pending",
    status: "pending",
  },
  {
    label: "Confirmed",
    status: "confirmed",
  },
  {
    label: "Upcoming",
    status: "upcoming",
  },
  {
    label: "Completed",
    status: "completed",
  },
  {
    label: "Cancelled",
    status: "cancelled",
  },
  {
    label: "Missed",
    status: "missed",
  },
];

function getStatusClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "upcoming":
      return "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20";

    case "completed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)] border-[var(--brand)]/20";

    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)] border-[var(--urgent)]/20";

    case "missed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getEmptyStateContent(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return {
        title: "No pending appointments",
        description:
          "Appointments awaiting doctor confirmation will appear here.",
      };

    case "confirmed":
      return {
        title: "No confirmed appointments",
        description:
          "Appointments confirmed by your doctor will appear here.",
      };

    case "upcoming":
      return {
        title: "No upcoming appointments",
        description:
          "Your scheduled appointments will appear here.",
      };

    case "completed":
      return {
        title: "No completed appointments",
        description:
          "Completed appointments will appear here.",
      };

    case "cancelled":
      return {
        title: "No cancelled appointments",
        description:
          "Cancelled appointments will appear here.",
      };

    case "missed":
      return {
        title: "No missed appointments",
        description:
          "Missed appointments will appear here.",
      };
  }
}

export default function MyAppointments() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [activeStatus, setActiveStatus] =
    useState<BookingStatus>("pending");

  useEffect(() => {
    Promise.resolve().then(() => {
      setBookings(getAllBookings());
    });
  }, []);

  const visibleBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === activeStatus,
      )
      .sort((a, b) => {
        const first =
          `${a.date}T${a.time}`;

        const second =
          `${b.date}T${b.time}`;

        return first.localeCompare(second);
      });
  }, [bookings, activeStatus]);

  const emptyState =
    getEmptyStateContent(activeStatus);

  return (
    <div>
      <div className="overflow-x-auto border-b border-[var(--line)]">
        <div className="flex min-w-max gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              onClick={() =>
                setActiveStatus(tab.status)
              }
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeStatus === tab.status
                  ? "border-[var(--brand)] text-[var(--brand-deep)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {visibleBookings.length === 0 ? (
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            action={
              activeStatus === "pending" &&
              bookings.length === 0 ? (
                <Link href="/doctors">
                  <Button>
                    Book appointment
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {visibleBookings.map(
              (booking) => {
                const doctor =
                  getDoctorById(
                    booking.doctorId,
                  );

                return (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                      {doctor?.avatarInitials ??
                        "DR"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-[var(--ink)]">
                          {doctor?.name ??
                            "Doctor"}
                        </p>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-[var(--muted)]">
                        {doctor?.specialty ??
                          "Healthcare"}{" "}
                        ·{" "}
                        {formatLongDate(
                          booking.date,
                        )}
                        , {booking.time}
                      </p>

                      {booking.status ===
                        "pending" && (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Waiting for the doctor to
                          confirm your appointment.
                        </p>
                      )}

                      {booking.status ===
                        "confirmed" && (
                        <p className="mt-2 text-xs text-[var(--success)]">
                          Your doctor has confirmed
                          this appointment.
                        </p>
                      )}

                      {booking.status ===
                        "cancelled" && (
                        <p className="mt-2 text-xs text-[var(--urgent-deep)]">
                          This appointment is no
                          longer active.
                        </p>
                      )}

                      {booking.status ===
                        "missed" && (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          This appointment was
                          marked as missed.
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/appointments/${booking.id}`}
                      className="shrink-0"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </div>
    </div>
  );
}