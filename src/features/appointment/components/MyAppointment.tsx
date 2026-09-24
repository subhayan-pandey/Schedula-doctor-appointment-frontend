"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import AppointmentIntelligence from "@/features/appointment/components/AppointmentIntelligence";
import AppointmentTimeline from "@/features/appointment/components/AppointmentTimeline";

import {
  getAllBookings,
} from "@/lib/bookings-store";

import {
  getAllDoctors,
} from "@/lib/doctors-store";

import {
  getPrescriptionByAppointmentId,
} from "@/lib/prescriptions-store";

import {
  getReviewByAppointmentId,
  saveReview,
} from "@/lib/reviews-store";

import {
  formatLongDate,
} from "@/lib/utils/date";

import {
  getConsultationCountdown,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
  isConsultationJoinable,
} from "@/lib/consultation";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import {
  setAppointments,
  updateAppointmentStatus,
} from "@/store/slices/appointmentsSlice";

import {
  setDoctors,
} from "@/store/slices/doctorsSlice";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

import type {
  Prescription,
} from "@/types/prescription";

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

function getStatusClasses(
  status: BookingStatus,
): string {
  switch (status) {
    case "pending":
      return "border-[#b8860b]/20 bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "upcoming":
      return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";

    case "declined":
      return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "completed":
      return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "cancelled":
      return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "missed":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(
  status: BookingStatus,
): string {
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

    case "declined":
      return {
        title: "No declined appointments",
        description:
          "Appointments declined by your doctor will appear here.",
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
          "Appointments marked as missed will appear here.",
      };

    default:
      return {
        title: "No appointments",
        description:
          "Your appointments will appear here.",
      };
  }
}

function StatusIcon({
  status,
}: {
  status: BookingStatus;
}) {
  if (status === "pending") {
    return (
      <span
        className="text-[10px]"
        aria-hidden="true"
      >
        •
      </span>
    );
  }

  if (
    status === "confirmed" ||
    status === "upcoming" ||
    status === "completed"
  ) {
    return (
      <span
        className="text-[11px]"
        aria-hidden="true"
      >
        ✓
      </span>
    );
  }

  if (
    status === "declined" ||
    status === "cancelled"
  ) {
    return (
      <span
        className="text-[11px]"
        aria-hidden="true"
      >
        ×
      </span>
    );
  }

  return (
    <span
      className="text-[11px]"
      aria-hidden="true"
    >
      −
    </span>
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

function AppointmentMeta({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--canvas)] px-3 py-2.5 text-sm text-[var(--muted)]">
      <span className="shrink-0 text-[var(--brand-deep)]">
        {icon}
      </span>

      <span className="truncate">
        {children}
      </span>
    </div>
  );
}

function getConsultationTypeLabel(
  consultationType:
    | "online"
    | "in-person"
    | undefined,
): string {
  return consultationType === "online"
    ? "Online Consultation"
    : "In-Person Consultation";
}

function PrescriptionModal({
  prescription,
  onClose,
}: {
  prescription: Prescription;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Prescription"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Prescription
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Prescription details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-lg text-[var(--muted)] hover:bg-[var(--canvas)]"
            aria-label="Close prescription"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Diagnosis
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
              {prescription.diagnosis}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Medicines
            </p>

            <div className="mt-3 space-y-3">
              {prescription.medicines.map(
                (medicine) => (
                  <div
                    key={medicine.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                  >
                    <p className="font-semibold text-[var(--ink)]">
                      {medicine.name}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-[var(--canvas)] px-3 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Dosage
                        </p>

                        <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                          {medicine.dosage}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[var(--canvas)] px-3 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                          {medicine.duration}
                        </p>
                      </div>
                    </div>

                    {medicine.instructions && (
                      <div className="mt-3 border-t border-[var(--line)] pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Instructions
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
                          {medicine.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {prescription.instructions && (
            <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                General Instructions
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
                {prescription.instructions}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--canvas)] px-5 py-4 sm:px-6">
          <Button
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existingReview =
    getReviewByAppointmentId(
      booking.id,
    );

  const [rating, setRating] =
    useState(
      existingReview?.rating ?? 0,
    );

  const [comment, setComment] =
    useState(
      existingReview?.comment ?? "",
    );

  const [error, setError] =
    useState("");

  function handleSubmit() {
    if (
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Please select a rating.",
      );

      return;
    }

    saveReview({
      id:
        existingReview?.id ??
        `review-${Date.now()}`,

      doctorId:
        booking.doctorId,

      appointmentId:
        booking.id,

      rating,

      comment:
        comment.trim(),

      createdAt:
        existingReview?.createdAt ??
        new Date().toISOString(),
    });

    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Review doctor"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Doctor review
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Share your experience
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-lg text-[var(--muted)] hover:bg-[var(--canvas)]"
            aria-label="Close review"
          >
            ×
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-[var(--ink)]">
            Rate your appointment
          </p>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRating(value)
                  }
                  className={`grid size-10 place-items-center rounded-lg border text-lg transition ${
                    value <= rating
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "border-[var(--line)] text-[var(--muted)]"
                  }`}
                  aria-label={`${value} star${
                    value === 1
                      ? ""
                      : "s"
                  }`}
                >
                  ★
                </button>
              ),
            )}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-[var(--ink)]">
              Review
            </span>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value,
                )
              }
              placeholder="Tell us about your experience..."
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            />
          </label>

          {error && (
            <p className="mt-3 text-sm text-[var(--urgent-deep)]">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="flex-1"
            onClick={handleSubmit}
          >
            {existingReview
              ? "Update review"
              : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyAppointment() {
  const dispatch =
    useDispatch<AppDispatch>();

  const user =
    useSelector(
      (state: RootState) =>
        state.auth.user,
    );

  const appointments =
    useSelector(
      (state: RootState) =>
        state.appointments.appointments,
    );

  const appointmentsInitialized =
    useSelector(
      (state: RootState) =>
        state.appointments.initialized,
    );

  const doctors =
    useSelector(
      (state: RootState) =>
        state.doctors.doctors,
    );

  const doctorsInitialized =
    useSelector(
      (state: RootState) =>
        state.doctors.initialized,
    );

  const patientId =
    user?.role === "patient"
      ? user.id
      : undefined;

  const [
    activeStatus,
    setActiveStatus,
  ] = useState<BookingStatus>(
    "upcoming",
  );

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    selectedPrescription,
    setSelectedPrescription,
  ] = useState<
    Prescription | null
  >(null);

  const [
    reviewBooking,
    setReviewBooking,
  ] = useState<
    Booking | null
  >(null);

  useEffect(() => {
    if (!appointmentsInitialized) {
      dispatch(
        setAppointments(
          getAllBookings(),
        ),
      );
    }
  }, [
    dispatch,
    appointmentsInitialized,
  ]);

  useEffect(() => {
    if (!doctorsInitialized) {
      dispatch(
        setDoctors(
          getAllDoctors(),
        ),
      );
    }
  }, [
    dispatch,
    doctorsInitialized,
  ]);

  useEffect(() => {
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
  }, []);

  const bookings =
    useMemo(
      () =>
        patientId
          ? appointments.filter(
              (booking) =>
                booking.patientId ===
                patientId,
            )
          : [],
      [
        appointments,
        patientId,
      ],
    );

  const filteredBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
            activeStatus,
        ),
      [
        activeStatus,
        bookings,
      ],
    );

  function handleStatusChange(
    status: BookingStatus,
  ) {
    setActiveStatus(status);
  }

  function handleCancel(
    bookingId: string,
  ) {
    const booking =
      bookings.find(
        (item) =>
          item.id === bookingId,
      );

    if (
      !booking ||
      (
        booking.status !==
          "confirmed" &&
        booking.status !==
          "upcoming"
      )
    ) {
      return;
    }

    dispatch(
      updateAppointmentStatus({
        bookingId,
        status: "cancelled",
        actionReason:
          "Appointment cancelled by patient",
      }),
    );
  }

  function handleMarkMissed(
    bookingId: string,
  ) {
    const booking =
      bookings.find(
        (item) =>
          item.id === bookingId,
      );

    if (
      !booking ||
      booking.status !==
        "confirmed"
    ) {
      return;
    }

    const appointmentTime =
      new Date(
        `${booking.date} ${booking.time}`,
      ).getTime();

    if (
      Number.isNaN(
        appointmentTime,
      ) ||
      currentTime <=
        appointmentTime
    ) {
      return;
    }

    dispatch(
      updateAppointmentStatus({
        bookingId,
        status: "missed",
        actionReason:
          "Appointment marked as missed after scheduled time",
      }),
    );
  }

  if (!patientId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        <EmptyState
          title="Patient login required"
          description="Log in with a patient account to view your appointments."
        />
      </div>
    );
  }

  const emptyState =
    getEmptyStateContent(
      activeStatus,
    );

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
            Patient Portal
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            My Appointments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            View your appointments, consultation
            details, prescriptions and follow-up
            information.
          </p>
        </header>

        <div className="mt-6 overflow-x-auto border-b border-[var(--line)]">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab) => {
              const count =
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    tab.status,
                ).length;

              const active =
                activeStatus ===
                tab.status;

              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      tab.status,
                    )
                  }
                  className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-[var(--brand)] text-[var(--brand-deep)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                      active
                        ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                        : "bg-[var(--canvas)] text-[var(--muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-6">
          {filteredBookings.length ===
          0 ? (
            <EmptyState
              title={
                emptyState.title
              }
              description={
                emptyState.description
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(
                (booking) => {
                  const doctor =
                    doctors.find(
                      (item) =>
                        item.id ===
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

                  const canJoin =
                    booking.consultationType ===
                      "online" &&
                    isConsultationJoinable(
                      consultationStatus ??
                        "scheduled",
                    ) &&
                    (
                      booking.status ===
                        "confirmed" ||
                      booking.status ===
                        "upcoming"
                    ) &&
                    currentTime > 0;

                  return (
                    <article
                      key={booking.id}
                      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                            {doctor?.avatarInitials ??
                              "DR"}
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-[var(--ink)]">
                              {doctor?.name ??
                                "Doctor"}
                            </h2>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {doctor?.specialty ??
                                "Medical consultation"}
                            </p>

                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                              <AppointmentMeta
                                icon={
                                  <CalendarIcon />
                                }
                              >
                                {formatLongDate(
                                  booking.date,
                                )}
                              </AppointmentMeta>

                              <AppointmentMeta
                                icon={
                                  <ClockIcon />
                                }
                              >
                                {booking.time}
                              </AppointmentMeta>

                              {booking.consultationType ===
                                "in-person" &&
                                doctor?.location && (
                                  <AppointmentMeta
                                    icon={
                                      <LocationIcon />
                                    }
                                  >
                                    {doctor.location}
                                  </AppointmentMeta>
                                )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          <StatusIcon
                            status={
                              booking.status
                            }
                          />

                          {getStatusLabel(
                            booking.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[var(--canvas)] p-4">
                          <p className="text-xs font-medium text-[var(--muted)]">
                            Consultation type
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                            {getConsultationTypeLabel(
                              booking.consultationType,
                            )}
                          </p>
                        </div>

                        {booking.consultationType ===
                          "in-person" &&
                        doctor ? (
                          <div className="rounded-xl bg-[var(--canvas)] p-4">
                            <p className="text-xs font-medium text-[var(--muted)]">
                              Clinic
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                              {doctor.clinic}
                            </p>

                            {doctor.location && (
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {doctor.location}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[var(--canvas)] p-4">
                            <p className="text-xs font-medium text-[var(--muted)]">
                              Appointment ID
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-[var(--ink)]">
                              {booking.id}
                            </p>
                          </div>
                        )}
                      </div>

                      {booking.consultationType ===
                        "in-person" &&
                        doctor?.location && (
                          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                Visit the clinic
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                {doctor.clinic} ·{" "}
                                {
                                  doctor.location
                                }
                              </p>
                            </div>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${doctor.clinic}, ${doctor.location}`,
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
                          </div>
                        )}

                      {booking.consultationType ===
                        "online" && (
                          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs font-medium text-[var(--muted)]">
                                  Online consultation
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

                              {canJoin ? (
                                <Link
                                  href={`/appointments/${booking.id}/consultation`}
                                  className="w-full sm:w-auto"
                                >
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto"
                                  >
                                    Join Consultation
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
                                    : "Join when starting"}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link
                          href={`/appointments/${booking.id}`}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            View Details
                          </Button>
                        </Link>

                        {booking.status ===
                          "completed" && (
                          <>
                            {getPrescriptionByAppointmentId(
                              booking.id,
                            ) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSelectedPrescription(
                                    getPrescriptionByAppointmentId(
                                      booking.id,
                                    )!,
                                  )
                                }
                                className="w-full sm:w-auto"
                              >
                                View Prescription
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setReviewBooking(
                                  booking,
                                )
                              }
                              className="w-full sm:w-auto"
                            >
                              {getReviewByAppointmentId(
                                booking.id,
                              )
                                ? "Edit Review"
                                : "Review Doctor"}
                            </Button>
                          </>
                        )}

                        {(
                          booking.status ===
                            "confirmed" ||
                          booking.status ===
                            "upcoming"
                        ) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCancel(
                                booking.id,
                              )
                            }
                            className="w-full sm:w-auto"
                          >
                            Cancel Appointment
                          </Button>
                        )}

                        {booking.status ===
                          "confirmed" &&
                          currentTime > 0 &&
                          new Date(
                            `${booking.date} ${booking.time}`,
                          ).getTime() <
                            currentTime && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleMarkMissed(
                                  booking.id,
                                )
                              }
                              className="w-full sm:w-auto"
                            >
                              Mark as Missed
                            </Button>
                          )}
                      </div>

                      <div className="mt-5">
                        <AppointmentTimeline
                          booking={booking}
                        />
                      </div>

                      <div className="mt-5">
                        <AppointmentIntelligence
                          bookings={bookings}
                        />
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {selectedPrescription && (
        <PrescriptionModal
          prescription={
            selectedPrescription
          }
          onClose={() =>
            setSelectedPrescription(
              null,
            )
          }
        />
      )}

      {reviewBooking && (
        <ReviewModal
          booking={
            reviewBooking
          }
          onClose={() =>
            setReviewBooking(
              null,
            )
          }
          onSaved={() =>
            setReviewBooking(
              null,
            )
          }
        />
      )}
    </>
  );
}