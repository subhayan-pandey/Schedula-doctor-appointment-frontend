"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import Button from "@/components/ui/Button";

import MockConsultationScreen from "@/features/consultation/components/MockConsultationScreen";

import {
  getBookingById,
} from "@/lib/bookings-store";

import {
  getDoctorById,
} from "@/lib/doctors-store";

import {
  getConsultationCountdown,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
  isConsultationJoinable,
} from "@/lib/consultation";

import {
  getSession,
} from "@/lib/storage";

import {
  formatLongDate,
} from "@/lib/utils/date";

import type {
  Booking,
} from "@/types/booking";

import type {
  ConsultationStatus,
} from "@/types/consultation";

function getStatusDescription(
  status: ConsultationStatus,
) {
  switch (status) {
    case "scheduled":
      return "Your consultation room is not available yet. You can join 15 minutes before the scheduled appointment time.";

    case "starting-soon":
      return "Your consultation room is ready. You can join the consultation now.";

    case "live":
      return "Your consultation is currently live.";

    case "ended":
      return "The consultation window has ended.";

    default:
      return "";
  }
}

function ClockIcon() {
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

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="6"
        width="12"
        height="12"
        rx="2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 10 5-3v10l-5-3"
      />
    </svg>
  );
}

export default function PatientConsultationPage() {
  const params =
    useParams<{
      bookingId: string;
    }>();

  const bookingId =
    params.bookingId;

  const [
    booking,
    setBooking,
  ] = useState<
    Booking | null | undefined
  >(undefined);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    accessDenied,
    setAccessDenied,
  ] = useState(false);

  useEffect(() => {
    const loadBooking =
      window.setTimeout(() => {
        const session =
          getSession();

        if (
          !session ||
          session.role !== "patient"
        ) {
          setAccessDenied(true);
          return;
        }

        const foundBooking =
          getBookingById(
            bookingId,
          );

        if (!foundBooking) {
          setBooking(null);
          return;
        }

        if (
          foundBooking.patientId !==
          session.id
        ) {
          setAccessDenied(true);
          return;
        }

        setBooking(
          foundBooking,
        );
      }, 0);

    return () => {
      window.clearTimeout(
        loadBooking,
      );
    };
  }, [bookingId]);

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

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Consultation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            You are not authorized to access
            this consultation.
          </p>

          <Link
            href="/appointments"
            className="mt-6 inline-block"
          >
            <Button>
              My appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (
    booking === undefined
  ) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading consultation…
      </div>
    );
  }

  if (
    booking === null
  ) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Appointment not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This appointment could not be
          found in the current session.
        </p>

        <Link
          href="/appointments"
          className="mt-6 inline-block"
        >
          <Button>
            Back to appointments
          </Button>
        </Link>
      </div>
    );
  }

  if (
    booking.consultationType !==
    "online"
  ) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Online consultation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This appointment is configured as
            an in-person consultation.
          </p>

          <Link
            href={`/appointments/${booking.id}`}
            className="mt-6 inline-block"
          >
            <Button>
              View appointment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const consultationStatus =
    getConsultationStatus(
      booking.date,
      booking.time,
      currentTime,
    );

  const canJoin =
    isConsultationJoinable(
      consultationStatus,
    );

  const countdown =
    getConsultationCountdown(
      booking.date,
      booking.time,
      currentTime,
    );

  const doctor =
    getDoctorById(
      booking.doctorId,
    );

  const validBookingStatus =
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming";

  if (
    canJoin &&
    validBookingStatus
  ) {
    return (
      <MockConsultationScreen
        role="patient"
        patientName={
          booking.patientName
        }
        doctorName={
          doctor?.name ??
          "Doctor"
        }
        doctorSpecialty={
          doctor?.specialty
        }
        date={booking.date}
        time={booking.time}
        appointmentId={
          booking.id
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <Link
          href={`/appointments/${booking.id}`}
          className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
        >
          ← Back to appointment
        </Link>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <VideoIcon />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Online Consultation
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              {consultationStatus ===
              "ended"
                ? "Consultation ended"
                : "Consultation room"}
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
              {consultationStatus ===
              "ended"
                ? "The scheduled consultation window has ended. Please book another appointment if you still need to consult your doctor."
                : !validBookingStatus
                  ? "This consultation cannot be joined because the appointment is not currently confirmed or upcoming."
                  : getStatusDescription(
                      consultationStatus,
                    )}
            </p>

            <div className="mt-5">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getConsultationStatusClasses(
                  consultationStatus,
                )}`}
              >
                {getConsultationStatusLabel(
                  consultationStatus,
                )}
              </span>
            </div>

            {countdown &&
              validBookingStatus && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
                  <span className="text-[var(--brand-deep)]">
                    <ClockIcon />
                  </span>

                  <span className="text-sm text-[var(--muted)]">
                    Starts in
                  </span>

                  <span className="font-mono text-sm font-semibold text-[var(--ink)]">
                    {countdown}
                  </span>
                </div>
              )}
          </div>

          <div className="mt-7 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--canvas)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">
                Doctor
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {doctor?.name ??
                  "Doctor"}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--canvas)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">
                Date
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {formatLongDate(
                  booking.date,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--canvas)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">
                Time
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {booking.time}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {consultationStatus ===
              "scheduled" &&
            validBookingStatus ? (
              <Button
                className="w-full"
                disabled
              >
                Join when starting
              </Button>
            ) : (
              <Link
                href={`/appointments/${booking.id}`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full"
                >
                  View appointment
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}