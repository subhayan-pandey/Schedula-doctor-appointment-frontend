"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getBookingsByDoctorId,
  updateBookingStatus,
} from "@/lib/bookings-store";

import {
  getDoctorById,
} from "@/lib/doctors-store";

import {
  createNotification,
} from "@/lib/notifications-store";

import {
  releaseSlot,
} from "@/lib/slots-store";

import {
  getSession,
} from "@/lib/storage";

import {
  formatLongDate,
} from "@/lib/utils/date";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

const FILTERS: {
  label: string;
  status: BookingStatus | "all";
}[] = [
  {
    label: "All",
    status: "all",
  },
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

function getStatusBadgeClass(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "upcoming":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "completed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "missed":
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "upcoming":
      return "Upcoming";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";
  }
}

export default function DoctorAppointments() {
  const [pageStatus, setPageStatus] =
    useState<PageStatus>("loading");

  const [doctorId, setDoctorId] =
    useState<string | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    BookingStatus | "all"
  >("all");

  const [
    processingBookingId,
    setProcessingBookingId,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      const session =
        getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setPageStatus(
          "unauthorized",
        );

        return;
      }

      setDoctorId(session.id);

      setBookings(
        getBookingsByDoctorId(
          session.id,
        ),
      );

      setPageStatus("ready");
    });
  }, []);

  function refreshBookings() {
    if (!doctorId) {
      return;
    }

    setBookings(
      getBookingsByDoctorId(
        doctorId,
      ),
    );
  }

  const visibleBookings =
    useMemo(() => {
      const filtered =
        activeFilter === "all"
          ? bookings
          : bookings.filter(
              (booking) =>
                booking.status ===
                activeFilter,
            );

      return [...filtered].sort(
        (a, b) => {
          const first =
            `${a.date} ${a.time}`;

          const second =
            `${b.date} ${b.time}`;

          return first.localeCompare(
            second,
          );
        },
      );
    }, [
      bookings,
      activeFilter,
    ]);

  function notifyPatient(
    booking: Booking,
    title: string,
    message: string,
    type:
      | "appointment"
      | "confirmation"
      | "cancellation",
  ) {
    /*
      Older bookings created before
      Phase 15 may not have patientId.

      We preserve compatibility while
      ensuring new bookings receive
      notifications correctly.
    */
    if (!booking.patientId) {
      return;
    }

    createNotification({
      userId:
        booking.patientId,

      title,

      message,

      type,

      appointmentId:
        booking.id,
    });
  }

  function handleConfirm(
    booking: Booking,
  ) {
    setProcessingBookingId(
      booking.id,
    );

    updateBookingStatus(
      booking.id,
      "confirmed",
    );

    notifyPatient(
      booking,
      "Appointment confirmed",
      `Your appointment on ${formatLongDate(
        booking.date,
      )} at ${booking.time} has been confirmed.`,
      "confirmation",
    );

    refreshBookings();

    setProcessingBookingId(null);
  }

  function handleMarkUpcoming(
    booking: Booking,
  ) {
    setProcessingBookingId(
      booking.id,
    );

    updateBookingStatus(
      booking.id,
      "upcoming",
    );

    notifyPatient(
      booking,
      "Appointment is upcoming",
      `Your appointment on ${formatLongDate(
        booking.date,
      )} at ${booking.time} is coming up.`,
      "appointment",
    );

    refreshBookings();

    setProcessingBookingId(null);
  }

  function handleComplete(
    booking: Booking,
  ) {
    setProcessingBookingId(
      booking.id,
    );

    updateBookingStatus(
      booking.id,
      "completed",
    );

    notifyPatient(
      booking,
      "Appointment completed",
      "Your appointment has been marked as completed. You can now review your doctor and access your prescription when available.",
      "appointment",
    );

    refreshBookings();

    setProcessingBookingId(null);
  }

  function handleMissed(
    booking: Booking,
  ) {
    setProcessingBookingId(
      booking.id,
    );

    updateBookingStatus(
      booking.id,
      "missed",
    );

    notifyPatient(
      booking,
      "Appointment missed",
      `Your appointment scheduled for ${formatLongDate(
        booking.date,
      )} at ${booking.time} was marked as missed.`,
      "appointment",
    );

    refreshBookings();

    setProcessingBookingId(null);
  }

  function handleCancel(
    booking: Booking,
  ) {
    if (!doctorId) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    releaseSlot(
      doctorId,
      booking.slotId,
    );

    updateBookingStatus(
      booking.id,
      "cancelled",
    );

    notifyPatient(
      booking,
      "Appointment cancelled",
      `Your appointment scheduled for ${formatLongDate(
        booking.date,
      )} at ${booking.time} has been cancelled. The appointment slot is available again.`,
      "cancellation",
    );

    refreshBookings();

    setProcessingBookingId(null);
  }

  if (pageStatus === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading appointments…
      </div>
    );
  }

  if (
    pageStatus === "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in with a doctor account
          to manage appointments.
        </p>

        <Link
          href="/doctor/login"
          className="mt-6 inline-block"
        >
          <Button>
            Doctor login
          </Button>
        </Link>
      </div>
    );
  }

  const doctor = doctorId
    ? getDoctorById(doctorId)
    : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Review and manage your
            patient appointments.
          </p>
        </div>

        {doctor && (
          <p className="text-sm text-[var(--muted)]">
            {doctor.name}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-[var(--line)]">
        {FILTERS.map((filter) => {
          const isActive =
            activeFilter ===
            filter.status;

          return (
            <button
              key={filter.status}
              type="button"
              onClick={() =>
                setActiveFilter(
                  filter.status,
                )
              }
              className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[var(--brand)] text-[var(--brand-deep)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {visibleBookings.length ===
        0 ? (
          <EmptyState
            title="No appointments found"
            description="Appointments matching this filter will appear here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {visibleBookings.map(
              (booking) => {
                const initials =
                  booking.patientName
                    .split(" ")
                    .filter(Boolean)
                    .map((name) =>
                      name.charAt(0),
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                const isProcessing =
                  processingBookingId ===
                  booking.id;

                return (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-[var(--ink)]">
                            {
                              booking.patientName
                            }
                          </h2>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatLongDate(
                              booking.date,
                            )}
                          </p>

                          <p className="text-sm text-[var(--muted)]">
                            {
                              booking.time
                            }
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          booking.status,
                        )}`}
                      >
                        {getStatusLabel(
                          booking.status,
                        )}
                      </span>
                    </div>

                    {booking.status ===
                      "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
                        <Button
                          size="sm"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleConfirm(
                              booking,
                            )
                          }
                        >
                          Confirm appointment
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleCancel(
                              booking,
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {booking.status ===
                      "confirmed" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
                        <Button
                          size="sm"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleMarkUpcoming(
                              booking,
                            )
                          }
                        >
                          Mark as upcoming
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleCancel(
                              booking,
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {booking.status ===
                      "upcoming" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
                        <Button
                          size="sm"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleComplete(
                              booking,
                            )
                          }
                        >
                          Mark completed
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleMissed(
                              booking,
                            )
                          }
                        >
                          Mark missed
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleCancel(
                              booking,
                            )
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}