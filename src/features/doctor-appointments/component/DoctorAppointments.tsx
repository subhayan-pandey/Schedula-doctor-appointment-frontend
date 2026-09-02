"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getAllBookings,
  updateBookingStatus,
} from "@/lib/bookings-store";

import { getSession } from "@/lib/storage";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

type FilterStatus =
  | "all"
  | BookingStatus;

function getAppointmentDateTime(booking: Booking) {
  return new Date(
    `${booking.date}T${booking.time}`,
  );
}

function isPastAppointment(booking: Booking) {
  return getAppointmentDateTime(booking) < new Date();
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "upcoming":
      return "bg-teal-50 text-teal-700 border-teal-200";

    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    case "missed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getStatusLabel(status: BookingStatus) {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
}

export default function DoctorAppointments() {
  const [doctorId, setDoctorId] =
    useState<string | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [filter, setFilter] =
    useState<FilterStatus>("all");

  const [message, setMessage] =
    useState<string | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "doctor") {
      return;
    }

    setDoctorId(session.id);

    const doctorBookings = getAllBookings().filter(
      (booking) =>
        booking.doctorId === session.id,
    );

    setBookings(doctorBookings);
  }, []);

  const filteredBookings = useMemo(() => {
    if (filter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) =>
        booking.status === filter,
    );
  }, [bookings, filter]);

  function refreshBookings() {
    if (!doctorId) {
      return;
    }

    const doctorBookings = getAllBookings().filter(
      (booking) =>
        booking.doctorId === doctorId,
    );

    setBookings(doctorBookings);
  }

  function changeStatus(
    bookingId: string,
    status: BookingStatus,
  ) {
    updateBookingStatus(
      bookingId,
      status,
    );

    refreshBookings();

    setMessage(
      `Appointment marked as ${status}.`,
    );

    window.setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  function handleConfirm(booking: Booking) {
    if (booking.status !== "pending") {
      return;
    }

    changeStatus(
      booking.id,
      "confirmed",
    );
  }

  function handleDecline(booking: Booking) {
    if (booking.status !== "pending") {
      return;
    }

    changeStatus(
      booking.id,
      "cancelled",
    );
  }

  function handleCancel(booking: Booking) {
    if (
      booking.status !== "confirmed" &&
      booking.status !== "upcoming"
    ) {
      return;
    }

    changeStatus(
      booking.id,
      "cancelled",
    );
  }

  function handleCompleted(booking: Booking) {
    if (
      booking.status !== "confirmed" &&
      booking.status !== "upcoming"
    ) {
      return;
    }

    if (!isPastAppointment(booking)) {
      setMessage(
        "Only past appointments can be marked as completed.",
      );

      return;
    }

    changeStatus(
      booking.id,
      "completed",
    );
  }

  function handleMissed(booking: Booking) {
    if (
      booking.status !== "confirmed" &&
      booking.status !== "upcoming"
    ) {
      return;
    }

    if (!isPastAppointment(booking)) {
      setMessage(
        "Only past appointments can be marked as missed.",
      );

      return;
    }

    changeStatus(
      booking.id,
      "missed",
    );
  }

  if (!doctorId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState
          title="Doctor access required"
          description="Please log in with a doctor account to manage appointments."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Appointments
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage and update your patient appointments.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand-deep)]">
          {message}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            "all",
            "pending",
            "confirmed",
            "upcoming",
            "completed",
            "cancelled",
            "missed",
          ] as FilterStatus[]
        ).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              filter === status
                ? "bg-[var(--brand)] text-white"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--canvas)]"
            }`}
          >
            {status === "all"
              ? "All"
              : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="There are no appointments matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(
            (booking) => {
              const past =
                isPastAppointment(booking);

              return (
                <div
                  key={booking.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-semibold text-[var(--ink)]">
                          {booking.patientName}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          {getStatusLabel(
                            booking.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
                        <span>
                          {formatDate(
                            booking.date,
                          )}
                        </span>

                        <span>
                          {booking.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status ===
                        "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleConfirm(
                                booking,
                              )
                            }
                          >
                            Confirm
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDecline(
                                booking,
                              )
                            }
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {(booking.status ===
                        "confirmed" ||
                        booking.status ===
                          "upcoming") &&
                        !past && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCancel(
                                booking,
                              )
                            }
                          >
                            Cancel
                          </Button>
                        )}

                      {(booking.status ===
                        "confirmed" ||
                        booking.status ===
                          "upcoming") &&
                        past && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleCompleted(
                                  booking,
                                )
                              }
                            >
                              Mark completed
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleMissed(
                                  booking,
                                )
                              }
                            >
                              Mark missed
                            </Button>
                          </>
                        )}

                      {(booking.status ===
                        "completed" ||
                        booking.status ===
                          "cancelled" ||
                        booking.status ===
                          "missed") && (
                        <span className="py-2 text-xs text-[var(--muted)]">
                          No further actions available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}