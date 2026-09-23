"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import AppointmentIntelligence from "@/features/appointment/components/AppointmentIntelligence";
import AppointmentTimeline from "@/features/appointment/components/AppointmentTimeline";

import {
  getBookingsByPatientId,
  updateBookingStatus,
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
  getSession,
} from "@/lib/storage";

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
) {
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
  icon: React.ReactNode;
  children: React.ReactNode;
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
) {
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

function escapePdfText(
  value: string,
): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapPdfText(
  value: string,
  maxLength = 78,
): string[] {
  const words =
    value.trim().split(/\s+/);

  if (
    words.length === 0 ||
    !value.trim()
  ) {
    return [""];
  }

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const candidate =
      `${current} ${word}`;

    if (
      candidate.length <=
      maxLength
    ) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildPdfDocument(
  lines: string[],
): Blob {
  const safeLines =
    lines.flatMap((line) =>
      line === ""
        ? [""]
        : wrapPdfText(line),
    );

  const contentLines = [
    "BT",
    "/F1 10 Tf",
    "50 760 Td",
    "14 TL",
  ];

  safeLines.forEach(
    (line, index) => {
      if (index > 0) {
        contentLines.push(
          "0 -14 Td",
        );
      }

      contentLines.push(
        `(${escapePdfText(
          line,
        )}) Tj`,
      );
    },
  );

  contentLines.push("ET");

  const stream =
    contentLines.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf =
    "%PDF-1.4\n";

  const offsets: number[] =
    [0];

  objects.forEach(
    (object, index) => {
      offsets[index + 1] =
        pdf.length;

      pdf +=
        `${index + 1} 0 obj\n${object}\nendobj\n`;
    },
  );

  const xrefOffset =
    pdf.length;

  pdf +=
    `xref\n0 ${objects.length + 1}\n`;

  pdf +=
    "0000000000 65535 f \n";

  for (
    let index = 1;
    index <= objects.length;
    index += 1
  ) {
    pdf +=
      `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${
      objects.length + 1
    } /Root 1 0 R >>\n`;

  pdf +=
    `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob(
    [pdf],
    {
      type: "application/pdf",
    },
  );
}

function downloadPrescription(
  prescription: Prescription,
  booking: Booking,
) {
  const doctor =
    getDoctorById(
      booking.doctorId,
    );

  const lines = [
    "SCHEDULA PRESCRIPTION",
    "",
    `Doctor: ${
      doctor?.name ?? "Doctor"
    }`,
    `Patient: ${booking.patientName}`,
    `Date: ${formatLongDate(
      booking.date,
    )}`,
    `Time: ${booking.time}`,
    `Consultation: ${getConsultationTypeLabel(
      booking.consultationType,
    )}`,
    "",
    `Diagnosis: ${
      prescription.diagnosis
    }`,
    "",
    "Medicines:",
  ];

  prescription.medicines.forEach(
    (medicine, index) => {
      lines.push(
        `${index + 1}. ${
          medicine.name
        }`,
      );

      lines.push(
        `   Dosage: ${
          medicine.dosage
        }`,
      );

      lines.push(
        `   Duration: ${
          medicine.duration
        }`,
      );

      if (
        medicine.instructions
      ) {
        lines.push(
          `   Instructions: ${
            medicine.instructions
          }`,
        );
      }

      lines.push("");
    },
  );

  if (
    prescription.instructions
  ) {
    lines.push(
      "General Instructions:",
    );

    lines.push(
      prescription.instructions,
    );

    lines.push("");
  }

  lines.push(
    `Created: ${new Date(
      prescription.createdAt,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    )}`,
  );

  lines.push(
    `Updated: ${new Date(
      prescription.updatedAt,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    )}`,
  );

  const blob =
    buildPdfDocument(
      lines,
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = url;

  anchor.download =
    `schedula-prescription-${booking.id}.pdf`;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default function MyAppointments() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [
    activeStatus,
    setActiveStatus,
  ] = useState<BookingStatus>(
    "pending",
  );

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

  const [
    reviewRefreshKey,
    setReviewRefreshKey,
  ] = useState(0);

  const [
    prescriptionRefreshKey,
    setPrescriptionRefreshKey,
  ] = useState(0);

  const [
    processingBookingId,
    setProcessingBookingId,
  ] = useState<string | null>(
    null,
  );

  function refreshBookings() {
    const session =
      getSession();

    if (
      !session ||
      session.role !== "patient" ||
      !session.id
    ) {
      setBookings([]);
      return;
    }

    setBookings(
      getBookingsByPatientId(
        session.id,
      ),
    );
  }

  useEffect(() => {
    Promise.resolve().then(
      refreshBookings,
    );

    function handleBookingsUpdated() {
      refreshBookings();
    }

    function handlePrescriptionsUpdated() {
      setPrescriptionRefreshKey(
        (value) =>
          value + 1,
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      handleBookingsUpdated,
    );

    window.addEventListener(
      "schedula:prescriptions-updated",
      handlePrescriptionsUpdated,
    );

    window.addEventListener(
      "storage",
      handleBookingsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleBookingsUpdated,
      );

      window.removeEventListener(
        "schedula:prescriptions-updated",
        handlePrescriptionsUpdated,
      );

      window.removeEventListener(
        "storage",
        handleBookingsUpdated,
      );
    };
  }, []);

  const visibleBookings =
    useMemo(() => {
      return [...bookings]
        .filter(
          (booking) =>
            booking.status ===
            activeStatus,
        )
        .sort((a, b) => {
          const first =
            `${a.date} ${a.time}`;

          const second =
            `${b.date} ${b.time}`;

          return first.localeCompare(
            second,
          );
        });
    }, [
      bookings,
      activeStatus,
    ]);

  const statusCounts =
    useMemo(() => {
      return TABS.reduce(
        (counts, tab) => {
          counts[tab.status] =
            bookings.filter(
              (booking) =>
                booking.status ===
                tab.status,
            ).length;

          return counts;
        },
        {} as Record<
          BookingStatus,
          number
        >,
      );
    }, [bookings]);

  function handleCancelDeclined(
    booking: Booking,
  ) {
    if (
      processingBookingId ===
      booking.id
    ) {
      return;
    }

    setProcessingBookingId(
      booking.id,
    );

    updateBookingStatus(
      booking.id,
      "cancelled",
      "Declined appointment cancelled by patient",
    );

    refreshBookings();

    setProcessingBookingId(
      null,
    );
  }

  const session =
    getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Login required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Please log in to view your
          appointments.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block"
        >
          <Button>
            Login
          </Button>
        </Link>
      </div>
    );
  }

  if (
    session.role !==
    "patient"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Patient portal required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in with a patient account
          to view patient appointments.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block"
        >
          <Button>
            Patient login
          </Button>
        </Link>
      </div>
    );
  }

  const emptyState =
    getEmptyStateContent(
      activeStatus,
    );

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="text-sm font-medium text-[var(--brand-deep)]">
            Patient portal
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            My appointments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Keep track of your upcoming,
            completed, and past appointments.
          </p>
        </div>

        <div className="mt-6">
          <AppointmentIntelligence
            bookings={bookings}
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-1">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab) => {
              const isActive =
                activeStatus ===
                tab.status;

              const count =
                statusCounts[
                  tab.status
                ] ?? 0;

              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() =>
                    setActiveStatus(
                      tab.status,
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--ink)]"
                  }`}
                >
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-[var(--brand)]" />
                  )}

                  {tab.label}

                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                        isActive
                          ? "bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {visibleBookings.length ===
          0 ? (
            <EmptyState
              title={
                emptyState.title
              }
              description={
                emptyState.description
              }
              action={
                bookings.length ===
                0 ? (
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

                  void prescriptionRefreshKey;
                  void reviewRefreshKey;

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

                  return (
                    <li
                      key={booking.id}
                      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow hover:shadow-sm"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                          <div className="flex min-w-0 flex-1 gap-3.5">
                            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                              {doctor?.avatarInitials ??
                                "DR"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-base font-semibold text-[var(--ink)] sm:text-lg">
                                  {doctor?.name ??
                                    "Doctor"}
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
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

                              <p className="mt-1 text-sm text-[var(--muted)]">
                                {doctor?.specialty ??
                                  "Healthcare"}
                              </p>

                              <div className="mt-4 grid gap-2 sm:grid-cols-3">
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

                                <AppointmentMeta
                                  icon={
                                    <span className="text-xs font-semibold">
                                      {booking.consultationType ===
                                      "online"
                                        ? "ON"
                                        : "IP"}
                                    </span>
                                  }
                                >
                                  {getConsultationTypeLabel(
                                    booking.consultationType,
                                  )}
                                </AppointmentMeta>
                              </div>

                              {doctor?.clinic && (
                                <div className="mt-2">
                                  <AppointmentMeta
                                    icon={
                                      <LocationIcon />
                                    }
                                  >
                                    {doctor.clinic}
                                  </AppointmentMeta>
                                </div>
                              )}

                              {booking.status ===
                                "declined" && (
                                <div className="mt-4 rounded-xl border border-[var(--urgent)]/15 bg-[var(--urgent-soft)] px-3.5 py-3">
                                  <p className="text-sm font-medium text-[var(--urgent-deep)]">
                                    Your doctor declined
                                    this appointment
                                    request.
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-[var(--urgent-deep)]/80">
                                    You can choose
                                    another available
                                    date and time with
                                    the same doctor, or
                                    cancel this request.
                                  </p>
                                </div>
                              )}

                              {booking.status ===
                                "cancelled" && (
                                <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-3">
                                  <p className="text-sm font-medium text-[var(--ink)]">
                                    This appointment has
                                    been cancelled.
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                    You can choose a new
                                    date and time with
                                    the same doctor from
                                    the appointment details.
                                  </p>
                                </div>
                              )}

                              {booking.status ===
                                "missed" && (
                                <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-3">
                                  <p className="text-sm font-medium text-[var(--ink)]">
                                    This appointment was
                                    marked as missed.
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                    You can book another
                                    appointment with the
                                    same doctor.
                                  </p>
                                </div>
                              )}

                              <div className="mt-4">
                                <AppointmentTimeline
                                  booking={booking}
                                  compact
                                />
                              </div>

                              {booking.status ===
                                "completed" && (
                                <div className="mt-4">
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                                      prescription
                                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                                        : "bg-slate-100 text-[var(--muted)]"
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
                                      ? "Prescription Available"
                                      : "Prescription Not Available"}
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
                          "declined" && (
                          <div className="mt-5 border-t border-[var(--line)] pt-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                              <Link
                                href={`/doctors/${booking.doctorId}`}
                                className="sm:w-auto"
                              >
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Book again
                                </Button>
                              </Link>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  processingBookingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  handleCancelDeclined(
                                    booking,
                                  )
                                }
                              >
                                {processingBookingId ===
                                booking.id
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </Button>
                            </div>
                          </div>
                        )}

                        {booking.status ===
                          "cancelled" && (
                          <div className="mt-5 border-t border-[var(--line)] pt-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                              <Link
                                href={`/appointments/${booking.id}/reschedule`}
                                className="sm:w-auto"
                              >
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Reschedule
                                </Button>
                              </Link>

                              <Link
                                href={`/doctors/${booking.doctorId}`}
                                className="sm:w-auto"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                >
                                  Book new appointment
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}

                        {booking.status ===
                          "missed" && (
                          <div className="mt-5 border-t border-[var(--line)] pt-4">
                            <div className="flex justify-end">
                              <Link
                                href={`/doctors/${booking.doctorId}`}
                                className="w-full sm:w-auto"
                              >
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Book again
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}

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
                                    Download PDF
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
                                Your doctor has not
                                added a prescription
                                for this appointment
                                yet.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </div>
      </section>

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