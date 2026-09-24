"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import AppointmentFilters, {
  type AppointmentFilterValues,
} from "@/features/doctor-appointments/component/AppointmentFilters";

import {
  getBookingsByDoctorId,
  updateBookingStatus,
} from "@/lib/bookings-store";

import { getDoctorById } from "@/lib/doctors-store";

import {
  createPatientNotification,
} from "@/lib/notifications-store";

import { releaseSlot } from "@/lib/slots-store";

import { getSession } from "@/lib/storage";

import { formatLongDate } from "@/lib/utils/date";

import {
  getConsultationCountdown,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
} from "@/lib/consultation";

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
    label: "Declined",
    status: "declined",
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
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "upcoming":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "declined":
    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "completed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "missed":
      return "bg-[var(--canvas)] text-[var(--muted)]";

    default:
      return "bg-[var(--canvas)] text-[var(--muted)]";
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

function getConsultationTypeLabel(
  consultationType:
    | "online"
    | "in-person"
    | undefined,
) {
  return consultationType ===
    "online"
    ? "Online Consultation"
    : "In-Person Consultation";
}

function getInitials(
  name: string,
) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("") || "PT"
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

function ClockIcon() {
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
        cx="12"
        cy="12"
        r="8.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5v5l3.25 1.75"
      />
    </svg>
  );
}

function LocationIcon() {
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
        d="M19 10.25c0 4.5-7 10.25-7 10.25S5 14.75 5 10.25a7 7 0 1 1 14 0Z"
      />

      <circle
        cx="12"
        cy="10.25"
        r="2.25"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m6.5 12.5 3.5 3.5 7.5-8"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m7 7 10 10M17 7 7 17"
      />
    </svg>
  );
}

function getSearchableBookingText(
  booking: Booking,
) {
  return [
    booking.patientName,
    booking.id,
    booking.patientId,
    booking.date,
    booking.time,
    getStatusLabel(
      booking.status,
    ),
    getConsultationTypeLabel(
      booking.consultationType,
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function DoctorAppointments() {
  const [
    pageStatus,
    setPageStatus,
  ] = useState<PageStatus>(
    "loading",
  );

  const [
    doctorId,
    setDoctorId,
  ] = useState<string | null>(
    null,
  );

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    BookingStatus | "all"
  >("all");

  const [
    filters,
    setFilters,
  ] =
    useState<AppointmentFilterValues>({
      search: "",
      date: "",
      status: "all",
    });

  const [
    processingBookingId,
    setProcessingBookingId,
  ] = useState<string | null>(
    null,
  );

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  useEffect(() => {
    const initialLoad =
      window.setTimeout(() => {
        const session =
          getSession();

        if (
          !session ||
          session.role !== "doctor" ||
          !session.id
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

        setPageStatus(
          "ready",
        );
      }, 0);

    return () => {
      window.clearTimeout(
        initialLoad,
      );
    };
  }, []);

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    const currentDoctorId =
      doctorId;

    function refresh() {
      setBookings(
        getBookingsByDoctorId(
          currentDoctorId,
        ),
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      refresh,
    );

    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        refresh,
      );

      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [doctorId]);

  useEffect(() => {
    const hasOnlineAppointments =
      bookings.some(
        (booking) =>
          booking.consultationType ===
            "online" &&
          (
            booking.status ===
              "confirmed" ||
            booking.status ===
              "upcoming"
          ),
      );

    if (!hasOnlineAppointments) {
      return;
    }

    const initialTick =
      window.setTimeout(() => {
        setCurrentTime(
          Date.now(),
        );
      }, 0);

    const interval =
      window.setInterval(() => {
        setCurrentTime(
          Date.now(),
        );
      }, 1000);

    return () => {
      window.clearTimeout(
        initialTick,
      );

      window.clearInterval(
        interval,
      );
    };
  }, [bookings]);

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

  const statusCounts =
    useMemo(() => {
      const counts: Record<
        BookingStatus | "all",
        number
      > = {
        all: bookings.length,
        pending: 0,
        confirmed: 0,
        upcoming: 0,
        declined: 0,
        completed: 0,
        cancelled: 0,
        missed: 0,
      };

      bookings.forEach(
        (booking) => {
          counts[
            booking.status
          ] += 1;
        },
      );

      return counts;
    }, [bookings]);

  const visibleBookings =
    useMemo(() => {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      return bookings
        .filter((booking) => {
          if (
            activeFilter !==
              "all" &&
            booking.status !==
              activeFilter
          ) {
            return false;
          }

          if (
            filters.status !==
              "all" &&
            booking.status !==
              filters.status
          ) {
            return false;
          }

          if (
            filters.date &&
            booking.date !==
              filters.date
          ) {
            return false;
          }

          if (
            search &&
            !getSearchableBookingText(
              booking,
            ).includes(search)
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) =>
          `${b.date} ${b.time}`.localeCompare(
            `${a.date} ${a.time}`,
          ),
        );
    }, [
      bookings,
      activeFilter,
      filters,
    ]);

  const hasActiveFilters =
    filters.search.trim()
      .length > 0 ||
    filters.date.length > 0 ||
    filters.status !==
      "all" ||
    activeFilter !==
      "all";

  function notifyPatient(
    booking: Booking,
    title: string,
    message: string,
    type:
      | "appointment"
      | "confirmation"
      | "cancellation",
  ) {
    if (!booking.patientId) {
      return;
    }

    createPatientNotification({
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
    if (
      booking.status !==
        "pending" ||
      processingBookingId
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "upcoming",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment confirmed",
        `Your appointment on ${formatLongDate(
          updated.date,
        )} at ${
          updated.time
        } has been confirmed and is now upcoming.`,
        "confirmation",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleDecline(
    booking: Booking,
  ) {
    if (
      !doctorId ||
      booking.status !==
        "pending" ||
      processingBookingId
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    releaseSlot(
      doctorId,
      booking.slotId,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "declined",
        "Appointment declined by doctor",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment declined",
        `Your appointment request for ${formatLongDate(
          updated.date,
        )} at ${
          updated.time
        } was declined by the doctor. You can book another available slot.`,
        "appointment",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleMarkUpcoming(
    booking: Booking,
  ) {
    if (
      booking.status !==
        "confirmed" ||
      processingBookingId
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "upcoming",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment is upcoming",
        `Your appointment on ${formatLongDate(
          updated.date,
        )} at ${
          updated.time
        } is now upcoming.`,
        "appointment",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleComplete(
    booking: Booking,
  ) {
    if (
      booking.status !==
        "upcoming" ||
      processingBookingId
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "completed",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment completed",
        "Your appointment has been marked as completed. You can now review your doctor and access your prescription when available.",
        "appointment",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleMissed(
    booking: Booking,
  ) {
    if (
      booking.status !==
        "upcoming" ||
      processingBookingId
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "missed",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment missed",
        `Your appointment scheduled for ${formatLongDate(
          updated.date,
        )} at ${
          updated.time
        } was marked as missed. You can book another appointment.`,
        "appointment",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleCancel(
    booking: Booking,
  ) {
    if (
      !doctorId ||
      processingBookingId ||
      ![
        "pending",
        "confirmed",
        "upcoming",
      ].includes(
        booking.status,
      )
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    releaseSlot(
      doctorId,
      booking.slotId,
    );

    const updated =
      updateBookingStatus(
        booking.id,
        "cancelled",
        "Appointment cancelled by doctor",
      );

    if (updated) {
      notifyPatient(
        updated,
        "Appointment cancelled",
        `Your appointment scheduled for ${formatLongDate(
          updated.date,
        )} at ${
          updated.time
        } has been cancelled. You can reschedule or book another appointment.`,
        "cancellation",
      );
    }

    refreshBookings();
    setProcessingBookingId(
      null,
    );
  }

  function handleFilterChange(
    nextFilters: AppointmentFilterValues,
  ) {
    setFilters(
      nextFilters,
    );

    setActiveFilter(
      nextFilters.status,
    );
  }

  function handleStatusTabChange(
    status:
      | BookingStatus
      | "all",
  ) {
    setActiveFilter(
      status,
    );

    setFilters(
      (current) => ({
        ...current,
        status,
      }),
    );
  }

  function clearAllFilters() {
    setFilters({
      search: "",
      date: "",
      status: "all",
    });

    setActiveFilter(
      "all",
    );
  }

  function renderAppointmentActions(
    booking: Booking,
  ) {
    const isProcessing =
      processingBookingId ===
      booking.id;

    const consultationStatus =
      booking.consultationType ===
      "online"
        ? getConsultationStatus(
            booking.date,
            booking.time,
            currentTime,
          )
        : null;

    const canStartConsultation =
      booking.consultationType ===
        "online" &&
      (
        consultationStatus ===
          "starting-soon" ||
        consultationStatus ===
          "live"
      ) &&
      (
        booking.status ===
          "confirmed" ||
        booking.status ===
          "upcoming"
      );

    switch (
      booking.status
    ) {
      case "pending":
        return (
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
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon />
                Confirm appointment
              </span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={
                isProcessing
              }
              onClick={() =>
                handleDecline(
                  booking,
                )
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <XIcon />
                Decline
              </span>
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
        );

      case "confirmed":
        return (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
            {booking.consultationType ===
              "online" &&
              canStartConsultation && (
                <Link
                  href={`/doctor/appointments/${encodeURIComponent(
                    booking.id,
                  )}/consultation`}
                >
                  <Button
                    size="sm"
                    disabled={
                      isProcessing
                    }
                  >
                    Start Consultation
                  </Button>
                </Link>
              )}

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

            <Link
              href={`/doctor/calendar?appointmentId=${encodeURIComponent(
                booking.id,
              )}`}
            >
              <Button
                size="sm"
                variant="outline"
                disabled={
                  isProcessing
                }
              >
                Reschedule
              </Button>
            </Link>

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
        );

      case "upcoming":
        return (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
            {booking.consultationType ===
              "online" &&
              canStartConsultation && (
                <Link
                  href={`/doctor/appointments/${encodeURIComponent(
                    booking.id,
                  )}/consultation`}
                >
                  <Button
                    size="sm"
                    disabled={
                      isProcessing
                    }
                  >
                    Start Consultation
                  </Button>
                </Link>
              )}

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

            <Link
              href={`/doctor/calendar?appointmentId=${encodeURIComponent(
                booking.id,
              )}`}
            >
              <Button
                size="sm"
                variant="outline"
                disabled={
                  isProcessing
                }
              >
                Reschedule
              </Button>
            </Link>

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
        );

      default:
        return null;
    }
  }

  if (
    pageStatus ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading appointments…
          </p>
        </div>
      </div>
    );
  }

  if (
    pageStatus ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <UserIcon />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[var(--ink)]">
            Doctor access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Log in with a doctor account to
            manage appointments.
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
      </div>
    );
  }

  const doctor =
    doctorId
      ? getDoctorById(
          doctorId,
        )
      : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Doctor Portal
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              Appointments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Review and manage your patient
              appointments.
            </p>
          </div>

          {doctor && (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs font-medium text-[var(--muted)]">
                Signed in as
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {doctor.name}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--muted)]">
              Total appointments
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--muted)]">
              Upcoming
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {
                statusCounts.upcoming
              }
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--muted)]">
              Pending review
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {
                statusCounts.pending
              }
            </p>
          </div>
        </div>
      </header>

      <section className="mt-8">
        <AppointmentFilters
          value={filters}
          onChange={
            handleFilterChange
          }
          resultCount={
            visibleBookings.length
          }
        />

        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="border-b border-[var(--line)] p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map(
                (filter) => {
                  const isActive =
                    activeFilter ===
                    filter.status;

                  return (
                    <button
                      key={
                        filter.status
                      }
                      type="button"
                      onClick={() =>
                        handleStatusTabChange(
                          filter.status,
                        )
                      }
                      className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {
                        filter.label
                      }

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                          isActive
                            ? "bg-[var(--surface)] text-[var(--brand-deep)]"
                            : "bg-[var(--canvas)] text-[var(--muted)]"
                        }`}
                      >
                        {
                          statusCounts[
                            filter.status
                          ]
                        }
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {visibleBookings.length ===
            0 ? (
              <EmptyState
                title={
                  bookings.length ===
                  0
                    ? "No appointments yet"
                    : "No matching appointments"
                }
                description={
                  bookings.length ===
                  0
                    ? "Appointments booked with you will appear here."
                    : "Try changing the search or filter criteria."
                }
                action={
                  bookings.length >
                    0 &&
                  hasActiveFilters ? (
                    <Button
                      variant="outline"
                      onClick={
                        clearAllFilters
                      }
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="flex flex-col gap-4">
                {visibleBookings.map(
                  (booking) => {
                    const isProcessing =
                      processingBookingId ===
                      booking.id;

                    const bookingDoctor =
                      getDoctorById(
                        booking.doctorId,
                      );

                    const consultationStatus =
                      booking.consultationType ===
                      "online"
                        ? getConsultationStatus(
                            booking.date,
                            booking.time,
                            currentTime,
                          )
                        : null;

                    const consultationCountdown =
                      booking.consultationType ===
                      "online"
                        ? getConsultationCountdown(
                            booking.date,
                            booking.time,
                            currentTime,
                          )
                        : null;

                    const canStartConsultation =
                      booking.consultationType ===
                        "online" &&
                      (
                        consultationStatus ===
                          "starting-soon" ||
                        consultationStatus ===
                          "live"
                      ) &&
                      (
                        booking.status ===
                          "confirmed" ||
                        booking.status ===
                          "upcoming"
                      );

                    const clinicName =
                      bookingDoctor?.clinic ??
                      "Clinic";

                    const clinicLocation =
                      bookingDoctor?.location ??
                      "";

                    const locationQuery =
                      `${clinicName}${
                        clinicLocation
                          ? `, ${clinicLocation}`
                          : ""
                      }`;

                    return (
                      <li
                        key={
                          booking.id
                        }
                        className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                      >
                        <article>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                                {getInitials(
                                  booking.patientName,
                                )}
                              </div>

                              <div className="min-w-0">
                                <h2 className="truncate text-base font-semibold text-[var(--ink)]">
                                  {
                                    booking.patientName
                                  }
                                </h2>

                                <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                                  <span className="inline-flex items-center gap-1.5">
                                    <CalendarIcon />

                                    {formatLongDate(
                                      booking.date,
                                    )}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5">
                                    <ClockIcon />

                                    {
                                      booking.time
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusBadgeClass(
                                booking.status,
                              )}`}
                            >
                              {getStatusLabel(
                                booking.status,
                              )}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 rounded-xl bg-[var(--canvas)] p-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium text-[var(--muted)]">
                                Appointment ID
                              </p>

                              <p className="mt-1 break-all text-sm font-medium text-[var(--ink)]">
                                {
                                  booking.id
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-[var(--muted)]">
                                Consultation type
                              </p>

                              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                                {getConsultationTypeLabel(
                                  booking.consultationType,
                                )}
                              </p>
                            </div>
                          </div>

                          {booking.consultationType ===
                            "in-person" && (
                            <div className="mt-3 rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 gap-3">
                                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand-deep)]">
                                    <LocationIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-[var(--muted)]">
                                      In-person
                                      consultation
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                                      {
                                        clinicName
                                      }
                                    </p>

                                    {clinicLocation && (
                                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                        {
                                          clinicLocation
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {clinicLocation && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      locationQuery,
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full sm:w-auto"
                                    >
                                      View Location
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {booking.consultationType ===
                            "online" &&
                            (
                              booking.status ===
                                "confirmed" ||
                              booking.status ===
                                "upcoming"
                            ) && (
                              <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-xs font-medium text-[var(--muted)]">
                                      Online
                                      consultation
                                    </p>

                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getConsultationStatusClasses(
                                          consultationStatus ??
                                            "scheduled",
                                        )}`}
                                      >
                                        {getConsultationStatusLabel(
                                          consultationStatus ??
                                            "scheduled",
                                        )}
                                      </span>

                                      {consultationCountdown && (
                                        <span className="font-mono text-xs font-semibold text-[var(--ink)]">
                                          {
                                            consultationCountdown
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {canStartConsultation ? (
                                    <Link
                                      href={`/doctor/appointments/${encodeURIComponent(
                                        booking.id,
                                      )}/consultation`}
                                      className="w-full sm:w-auto"
                                    >
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto"
                                      >
                                        Start Consultation
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled
                                      className="w-full sm:w-auto"
                                    >
                                      {consultationStatus ===
                                      "ended"
                                        ? "Consultation ended"
                                        : "Start when ready"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="mt-3 flex flex-col gap-3 rounded-xl bg-[var(--canvas)] p-4 sm:flex-row sm:items-center sm:justify-end">
                            <Link
                              href={`/appointments/${booking.id}`}
                              className="shrink-0"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                View details
                              </Button>
                            </Link>
                          </div>

                          {renderAppointmentActions(
                            booking,
                          )}

                          {isProcessing && (
                            <p className="mt-3 text-xs text-[var(--muted)]">
                              Updating
                              appointment…
                            </p>
                          )}
                        </article>
                      </li>
                    );
                  },
                )}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}