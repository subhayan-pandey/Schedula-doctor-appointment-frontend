"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import { getAllBookings } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";
import { getPrescriptionByAppointmentId } from "@/lib/prescriptions-store";
import {
  getReviewByAppointmentId,
  saveReview,
} from "@/lib/reviews-store";
import { formatLongDate } from "@/lib/utils/date";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";
import type { Prescription } from "@/types/prescription";

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
      return "border-[#b8860b]/20 bg-[var(--warning-soft)] text-[var(--warning)]";

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

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getEmptyStateContent(status: BookingStatus) {
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

function StatusIcon({ status }: { status: BookingStatus }) {
  if (status === "completed") {
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
          d="m5 12 4 4L19 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "cancelled") {
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
          d="m7 7 10 10M17 7 7 17"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (status === "missed") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path
          d="M12 8v4l2.5 2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "pending") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4"
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
        d="M12 7v5l3 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function CloseButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4"
        aria-hidden="true"
      >
        <path
          d="m7 7 10 10M17 7 7 17"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prescription-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
                aria-hidden="true"
              >
                <path
                  d="M8 4h8v16H8z"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 8h4M10 12h4M10 16h3"
                  strokeLinecap="round"
                />
              </svg>
              Prescription
            </div>

            <h2
              id="prescription-title"
              className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)]"
            >
              Medical Prescription
            </h2>
          </div>

          <CloseButton
            onClick={onClose}
            label="Close prescription"
          />
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Diagnosis
            </p>

            <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink)]">
              {prescription.diagnosis}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Medicines
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Follow the dosage and duration prescribed by your doctor.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[var(--canvas)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                {prescription.medicines.length}{" "}
                {prescription.medicines.length === 1
                  ? "medicine"
                  : "medicines"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {prescription.medicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand-deep)]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
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
                  </div>
                </div>
              ))}
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
  const existingReview = getReviewByAppointmentId(booking.id);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    saveReview({
      id: existingReview?.id ?? `review-${Date.now()}`,
      doctorId: booking.doctorId,
      appointmentId: booking.id,
      rating,
      comment: comment.trim(),
      createdAt:
        existingReview?.createdAt ?? new Date().toISOString(),
    });

    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
                aria-hidden="true"
              >
                <path
                  d="M12 3.8 14.5 9l5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4L9.5 9 12 3.8Z"
                  strokeLinejoin="round"
                />
              </svg>
              Doctor Review
            </div>

            <h2
              id="review-title"
              className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)]"
            >
              Share your experience
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Your feedback helps improve the care experience.
            </p>
          </div>

          <CloseButton
            onClick={onClose}
            label="Close review"
          />
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Appointment
            </p>

            <p className="mt-1 font-medium text-[var(--ink)]">
              {formatLongDate(booking.date)}
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {booking.time}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Rate your appointment
            </p>

            <div
              className="mt-3 flex gap-2"
              aria-label="Select rating from 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value);
                    setError("");
                  }}
                  aria-label={`${value} star${
                    value === 1 ? "" : "s"
                  }`}
                  aria-pressed={value === rating}
                  className={`grid size-11 place-items-center rounded-xl border text-lg transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 ${
                    value <= rating
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)]/50 hover:text-[var(--brand-deep)]"
                  }`}
                >
                  <span aria-hidden="true">★</span>
                </button>
              ))}
            </div>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-[var(--ink)]">
              Review
            </span>

            <span className="mt-1 block text-xs text-[var(--muted)]">
              Tell us what went well or what could be improved.
            </span>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience..."
              rows={5}
              className="mt-3 w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3 text-sm font-medium text-[var(--urgent-deep)]">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] bg-[var(--canvas)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {existingReview ? "Update review" : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AppointmentMeta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
      <span className="shrink-0 text-[var(--brand-deep)]">{icon}</span>
      <span className="truncate">{children}</span>
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
      className="size-4"
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
      className="size-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />
      <path
        d="M12 8v4l2.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export default function MyAppointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeStatus, setActiveStatus] =
    useState<BookingStatus>("pending");

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [reviewBooking, setReviewBooking] =
    useState<Booking | null>(null);

  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    Promise.resolve().then(() => {
      setBookings(getAllBookings());
    });
  }, []);

  const visibleBookings = useMemo(() => {
    return [...bookings]
      .filter(
        (booking) => booking.status === activeStatus,
      )
      .sort((a, b) => {
        const first = `${a.date} ${a.time}`;
        const second = `${b.date} ${b.time}`;

        return second.localeCompare(first);
      });
  }, [bookings, activeStatus]);

  const emptyState = getEmptyStateContent(activeStatus);

  function downloadPrescription(
    prescription: Prescription,
    booking: Booking,
  ) {
    const doctor = getDoctorById(booking.doctorId);

    const medicineRows = prescription.medicines
      .map(
        (medicine, index) =>
          `${index + 1}. ${medicine.name}\n` +
          `   Dosage: ${medicine.dosage}\n` +
          `   Duration: ${medicine.duration}\n` +
          `   Instructions: ${
            medicine.instructions || "None"
          }\n`,
      )
      .join("\n");

    const content =
      `SCHEDULA PRESCRIPTION\n\n` +
      `Doctor: ${doctor?.name ?? "Doctor"}\n` +
      `Patient: ${booking.patientName}\n` +
      `Appointment: ${formatLongDate(
        booking.date,
      )} at ${booking.time}\n\n` +
      `DIAGNOSIS\n` +
      `${prescription.diagnosis}\n\n` +
      `MEDICINES\n` +
      `${medicineRows}\n` +
      `GENERAL INSTRUCTIONS\n` +
      `${
        prescription.instructions ||
        "No additional instructions."
      }\n`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `prescription-${booking.id}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-1">
            {TABS.map((tab) => {
              const isActive =
                activeStatus === tab.status;

              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() =>
                    setActiveStatus(tab.status)
                  }
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 ${
                    isActive
                      ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--ink)]"
                  }`}
                >
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-[var(--brand)]" />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {visibleBookings.length === 0 ? (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
              action={
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
            <ul className="flex flex-col gap-4">
              {visibleBookings.map((booking) => {
                const doctor = getDoctorById(
                  booking.doctorId,
                );

                const prescription =
                  booking.status === "completed"
                    ? getPrescriptionByAppointmentId(
                        booking.id,
                      )
                    : undefined;

                const review =
                  booking.status === "completed"
                    ? getReviewByAppointmentId(
                        booking.id,
                      )
                    : undefined;

                void reviewRefreshKey;

                return (
                  <li
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow hover:shadow-sm"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                        <div className="flex min-w-0 flex-1 gap-3.5">
                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                            {doctor?.avatarInitials ?? "DR"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-base font-semibold text-[var(--ink)] sm:text-lg">
                                {doctor?.name ?? "Doctor"}
                              </p>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                  booking.status,
                                )}`}
                              >
                                <StatusIcon
                                  status={booking.status}
                                />
                                {booking.status}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {doctor?.specialty ??
                                "Healthcare"}
                            </p>

                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                              <AppointmentMeta
                                icon={<CalendarIcon />}
                              >
                                {formatLongDate(
                                  booking.date,
                                )}
                              </AppointmentMeta>

                              <AppointmentMeta
                                icon={<ClockIcon />}
                              >
                                {booking.time}
                              </AppointmentMeta>

                              {doctor?.clinic && (
                                <AppointmentMeta
                                  icon={<LocationIcon />}
                                >
                                  {doctor.clinic}
                                </AppointmentMeta>
                              )}
                            </div>

                            {booking.status ===
                              "completed" && (
                              <div className="mt-4">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                                    prescription
                                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                                      : "bg-[var(--canvas)] text-[var(--muted)]"
                                  }`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${
                                      prescription
                                        ? "bg-[var(--success)]"
                                        : "bg-[var(--muted)]"
                                    }`}
                                  />

                                  {prescription
                                    ? "Prescription available"
                                    : "Prescription not available"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="lg:pt-1">
                          <Link
                            href={`/appointments/${booking.id}`}
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full lg:w-auto"
                            >
                              View details
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {booking.status ===
                        "completed" && (
                        <div className="mt-5 border-t border-[var(--line)] pt-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {prescription && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setSelectedPrescription(
                                      prescription,
                                    )
                                  }
                                >
                                  View prescription
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    downloadPrescription(
                                      prescription,
                                      booking,
                                    )
                                  }
                                >
                                  Download prescription
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setReviewBooking(
                                  booking,
                                )
                              }
                            >
                              {review
                                ? "Edit review"
                                : "Review doctor"}
                            </Button>

                            <Link
                              href={`/doctors/${booking.doctorId}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                Rebook appointment
                              </Button>
                            </Link>
                          </div>

                          {!prescription && (
                            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                              Your doctor has not added a
                              prescription for this appointment
                              yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          onClose={() =>
            setSelectedPrescription(null)
          }
        />
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() =>
            setReviewBooking(null)
          }
          onSaved={() => {
            setReviewBooking(null);
            setReviewRefreshKey((value) => value + 1);
          }}
        />
      )}
    </>
  );
}