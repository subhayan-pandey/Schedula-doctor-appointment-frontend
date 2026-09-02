"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getAllBookings,
} from "@/lib/bookings-store";

import {
  getDoctorById,
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
) {
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

function PrescriptionModal({
  prescription,
  onClose,
}: {
  prescription: Prescription;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--brand-deep)]">
              Prescription
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
              Medical Prescription
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--canvas)]"
            aria-label="Close prescription"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Diagnosis
            </p>

            <p className="mt-1 font-medium text-[var(--ink)]">
              {prescription.diagnosis}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Medicines
            </p>

            <div className="mt-3 space-y-3">
              {prescription.medicines.map(
                (medicine) => (
                  <div
                    key={medicine.id}
                    className="rounded-xl border border-[var(--line)] p-4"
                  >
                    <p className="font-semibold text-[var(--ink)]">
                      {medicine.name}
                    </p>

                    <div className="mt-2 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                      <p>
                        Dosage:{" "}
                        {medicine.dosage}
                      </p>

                      <p>
                        Duration:{" "}
                        {medicine.duration}
                      </p>
                    </div>

                    {medicine.instructions && (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {medicine.instructions}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {prescription.instructions && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                General Instructions
              </p>

              <p className="mt-1 text-sm text-[var(--ink)]">
                {prescription.instructions}
              </p>
            </div>
          )}
        </div>

        <div className="mt-7">
          <Button
            className="w-full"
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
      doctorId: booking.doctorId,
      appointmentId: booking.id,
      rating,
      comment: comment.trim(),
      createdAt:
        existingReview?.createdAt ??
        new Date().toISOString(),
    });

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--brand-deep)]">
              Doctor Review
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
              Share your experience
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--canvas)]"
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

export default function MyAppointments() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [activeStatus, setActiveStatus] =
    useState<BookingStatus>("pending");

  const [
    selectedPrescription,
    setSelectedPrescription,
  ] = useState<Prescription | null>(
    null,
  );

  const [
    reviewBooking,
    setReviewBooking,
  ] = useState<Booking | null>(
    null,
  );

  const [reviewRefreshKey, setReviewRefreshKey] =
    useState(0);

  useEffect(() => {
    Promise.resolve().then(() => {
      setBookings(
        getAllBookings(),
      );
    });
  }, []);

  const visibleBookings = useMemo(() => {
    return [...bookings]
      .filter(
        (booking) =>
          booking.status === activeStatus,
      )
      .sort((a, b) => {
        const first =
          `${a.date} ${a.time}`;

        const second =
          `${b.date} ${b.time}`;

        return second.localeCompare(first);
      });
  }, [
    bookings,
    activeStatus,
  ]);

  const emptyState =
    getEmptyStateContent(activeStatus);

  function downloadPrescription(
    prescription: Prescription,
    booking: Booking,
  ) {
    const doctor =
      getDoctorById(
        booking.doctorId,
      );

    const medicineRows =
      prescription.medicines
        .map(
          (medicine, index) =>
            `${index + 1}. ${medicine.name}\n` +
            `   Dosage: ${medicine.dosage}\n` +
            `   Duration: ${medicine.duration}\n` +
            `   Instructions: ${medicine.instructions || "None"}\n`,
        )
        .join("\n");

    const content =
      `SCHEDULA PRESCRIPTION\n\n` +
      `Doctor: ${
        doctor?.name ?? "Doctor"
      }\n` +
      `Patient: ${
        booking.patientName
      }\n` +
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

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `prescription-${booking.id}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>
        <div className="overflow-x-auto border-b border-[var(--line)]">
          <div className="flex min-w-max gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.status}
                type="button"
                onClick={() =>
                  setActiveStatus(
                    tab.status,
                  )
                }
                className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeStatus ===
                  tab.status
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
              title={
                emptyState.title
              }
              description={
                emptyState.description
              }
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
              {visibleBookings.map(
                (booking) => {
                  const doctor =
                    getDoctorById(
                      booking.doctorId,
                    );

                  const prescription =
                    booking.status ===
                    "completed"
                      ? getPrescriptionByAppointmentId(
                          booking.id,
                        )
                      : undefined;

                  const review =
                    booking.status ===
                    "completed"
                      ? getReviewByAppointmentId(
                          booking.id,
                        )
                      : undefined;

                  /*
                   * reviewRefreshKey intentionally
                   * participates in rendering after
                   * a review is saved.
                   */
                  void reviewRefreshKey;

                  return (
                    <li
                      key={booking.id}
                      className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                              {
                                booking.status
                              }
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
                            "completed" && (
                            <div className="mt-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  prescription
                                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                                    : "bg-slate-100 text-[var(--muted)]"
                                }`}
                              >
                                {prescription
                                  ? "Prescription Available"
                                  : "Prescription Not Available"}
                              </span>
                            </div>
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
                            View details
                          </Button>
                        </Link>
                      </div>

                      {booking.status ===
                        "completed" && (
                        <div className="mt-4 border-t border-[var(--line)] pt-4">
                          <div className="flex flex-wrap gap-2">
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
                              >
                                Rebook appointment
                              </Button>
                            </Link>
                          </div>

                          {!prescription && (
                            <p className="mt-3 text-xs text-[var(--muted)]">
                              Your doctor has not
                              added a prescription
                              for this appointment
                              yet.
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </div>
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
          booking={reviewBooking}
          onClose={() =>
            setReviewBooking(null)
          }
          onSaved={() => {
            setReviewBooking(null);

            setReviewRefreshKey(
              (value) =>
                value + 1,
            );
          }}
        />
      )}
    </>
  );
}