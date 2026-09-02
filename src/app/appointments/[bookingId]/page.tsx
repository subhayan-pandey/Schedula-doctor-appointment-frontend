"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Button from "@/components/ui/Button";

import { getBookingById } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";
import { formatLongDate } from "@/lib/utils/date";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

function getStatusLabel(status: BookingStatus) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getStatusClasses(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "text-amber-700";

    case "confirmed":
      return "text-blue-600";

    case "upcoming":
      return "text-[var(--success)]";

    case "completed":
      return "text-[var(--brand-deep)]";

    case "cancelled":
      return "text-[var(--urgent-deep)]";

    case "missed":
      return "text-slate-600";

    default:
      return "text-[var(--muted)]";
  }
}

function getStatusMessage(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Your appointment request is waiting for doctor confirmation.";

    case "confirmed":
      return "Your appointment has been confirmed by the doctor.";

    case "upcoming":
      return "Your appointment is scheduled and upcoming.";

    case "completed":
      return "This appointment has been completed.";

    case "cancelled":
      return "This appointment has been cancelled.";

    case "missed":
      return "This appointment was marked as missed.";

    default:
      return "";
  }
}

function getPageHeading(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Appointment Request Sent";

    case "confirmed":
      return "Appointment Confirmed";

    case "upcoming":
      return "Appointment Scheduled";

    case "completed":
      return "Appointment Completed";

    case "cancelled":
      return "Appointment Cancelled";

    case "missed":
      return "Appointment Missed";

    default:
      return "Appointment Details";
  }
}

function getStatusIcon(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "⏳";

    case "confirmed":
      return "✓";

    case "upcoming":
      return "📅";

    case "completed":
      return "✓";

    case "cancelled":
      return "✕";

    case "missed":
      return "−";

    default:
      return "📅";
  }
}

export default function AppointmentConfirmationPage() {
  const { bookingId } =
    useParams<{ bookingId: string }>();

  const [booking, setBooking] =
    useState<
      Booking | null | undefined
    >(undefined);

  useEffect(() => {
    Promise.resolve().then(() =>
      setBooking(
        getBookingById(bookingId) ?? null,
      ),
    );
  }, [bookingId]);

  if (booking === undefined) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading appointment…
      </div>
    );
  }

  if (booking === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          We couldn&apos;t find that appointment
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          It may have been booked in a different
          browser, or the link is incorrect.
        </p>

        <Link
          href="/doctors"
          className="mt-6 inline-block"
        >
          <Button>
            Find a doctor
          </Button>
        </Link>
      </div>
    );
  }

  const doctor = getDoctorById(
    booking.doctorId,
  );

  const isTerminal =
    booking.status === "completed" ||
    booking.status === "cancelled" ||
    booking.status === "missed";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-0">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--success-soft)] text-2xl">
          {getStatusIcon(booking.status)}
        </span>

        <h1 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
          {getPageHeading(booking.status)}
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          {getStatusMessage(booking.status)}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        {doctor && (
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
              {doctor.avatarInitials}
            </span>

            <div>
              <p className="font-semibold text-[var(--ink)]">
                {doctor.name}
              </p>

              <p className="text-sm text-[var(--muted)]">
                {doctor.specialty} ·{" "}
                {doctor.location}
              </p>
            </div>
          </div>
        )}

        <dl className="mt-5 space-y-3 border-t border-[var(--line)] pt-5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Appointment number
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              #
              {booking.id
                .slice(-6)
                .toUpperCase()}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Status
            </dt>

            <dd
              className={`font-medium ${getStatusClasses(
                booking.status,
              )}`}
            >
              {getStatusLabel(
                booking.status,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Date
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {formatLongDate(
                booking.date,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Time
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {booking.time}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Patient
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {booking.patientName}
            </dd>
          </div>
        </dl>

        {isTerminal && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--muted)]">
            This appointment is closed and no
            further appointment actions are
            available.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/appointments"
          className="flex-1"
        >
          <Button className="w-full">
            View my appointments
          </Button>
        </Link>

        <Link
          href="/doctors"
          className="flex-1"
        >
          <Button
            variant="outline"
            className="w-full"
          >
            {isTerminal
              ? "Book another"
              : "Find another doctor"}
          </Button>
        </Link>
      </div>
    </div>
  );
}