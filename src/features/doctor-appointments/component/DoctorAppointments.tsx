"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getBookingsByDoctorId,
  updateBookingStatus,
} from "@/lib/bookings-store";

import { getDoctorById } from "@/lib/doctors-store";

import {
  createNotification,
} from "@/lib/notifications-store";

import { releaseSlot } from "@/lib/slots-store";

import { getSession } from "@/lib/storage";

import { formatLongDate } from "@/lib/utils/date";

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
      return "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "upcoming":
      return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";

    case "completed":
      return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "cancelled":
      return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "missed":
      return "border-slate-200 bg-slate-100 text-slate-600";
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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "PT";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

export default function DoctorAppointments() {
  const [pageStatus, setPageStatus] =
    useState<PageStatus>("loading");

  const [doctorId, setDoctorId] =
    useState<string | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<
      BookingStatus | "all"
    >("all");

  const [
    processingBookingId,
    setProcessingBookingId,
  ] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setPageStatus("unauthorized");
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

  const visibleBookings = useMemo(() => {
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
  }, [bookings, activeFilter]);

  const filterCount =
    activeFilter === "all"
      ? bookings.length
      : visibleBookings.length;

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
     * Older bookings created before patientId
     * existed may not contain a patient id.
     * New bookings do, so notifications work
     * normally for current flows.
     */
    if (!booking.patientId) {
      return;
    }

    createNotification({
      userId: booking.patientId,
      title,
      message,
      type,
      appointmentId: booking.id,
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <AppointmentsSkeleton />
      </div>
    );
  }

  if (pageStatus === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <ShieldIcon />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Doctor portal
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Appointments
            </h1>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Review, confirm, complete,
              reschedule, or cancel patient
              appointments.
            </p>
          </div>

          {doctor && (
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                {getInitials(
                  doctor.name,
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">
                  {doctor.name}
                </p>

                <p className="truncate text-xs text-[var(--muted)]">
                  {doctor.specialty}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="mt-5">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-1">
            {FILTERS.map((filter) => {
              const isActive =
                activeFilter ===
                filter.status;

              const count =
                filter.status === "all"
                  ? bookings.length
                  : bookings.filter(
                      (booking) =>
                        booking.status ===
                        filter.status,
                    ).length;

              return (
                <button
                  key={filter.status}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.status,
                    )
                  }
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 ${
                    isActive
                      ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--ink)]"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--ink)]">
              {filterCount}
            </span>{" "}
            {filterCount === 1
              ? "appointment"
              : "appointments"}
          </p>

          <Link
            href="/doctor/calendar"
            className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
          >
            Open calendar
          </Link>
        </div>
      </section>

      <section className="mt-5">
        {visibleBookings.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="Appointments matching this filter will appear here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleBookings.map(
              (booking) => {
                const isProcessing =
                  processingBookingId ===
                  booking.id;

                const initials =
                  getInitials(
                    booking.patientName,
                  );

                return (
                  <article
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow hover:shadow-sm"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-3.5">
                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                            {initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-base font-semibold text-[var(--ink)] sm:text-lg">
                                {booking.patientName}
                              </h2>

                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                  booking.status,
                                )}`}
                              >
                                {getStatusLabel(
                                  booking.status,
                                )}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <CalendarIcon />
                                <span>
                                  {formatLongDate(
                                    booking.date,
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                <ClockIcon />
                                <span>
                                  {booking.time}
                                </span>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-[var(--muted)]">
                              Booking ID:{" "}
                              <span className="font-medium text-[var(--ink)]">
                                {booking.id}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className="hidden shrink-0 text-xs text-[var(--muted)] lg:block">
                          Patient appointment
                        </span>
                      </div>

                      {booking.status ===
                        "pending" && (
                        <ActionBar>
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
                        </ActionBar>
                      )}

                      {booking.status ===
                        "confirmed" && (
                        <ActionBar>
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
                        </ActionBar>
                      )}

                      {booking.status ===
                        "upcoming" && (
                        <ActionBar>
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
                        </ActionBar>
                      )}

                      {(booking.status ===
                        "completed" ||
                        booking.status ===
                          "cancelled" ||
                        booking.status ===
                          "missed") && (
                        <div className="mt-5 border-t border-[var(--line)] pt-4">
                          <p className="text-xs leading-5 text-[var(--muted)]">
                            This appointment is
                            read-only from the
                            appointment list.
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-col gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:flex-wrap">
      {children}
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-label="Loading appointments"
    >
      <div className="h-32 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 h-12 rounded-xl bg-[var(--canvas)]" />

      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-36 rounded-2xl bg-[var(--canvas)]"
            />
          ),
        )}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4 shrink-0 text-[var(--brand-deep)]"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4 shrink-0 text-[var(--brand-deep)]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 8v4l2.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 7v5c0 4.3-2.7 7.3-7 8.8C7.7 19.3 5 16.3 5 12V7l7-3.5Z"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5 11.3 14l3.5-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}