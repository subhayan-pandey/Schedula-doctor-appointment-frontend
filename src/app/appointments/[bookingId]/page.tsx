"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Button from "@/components/ui/Button";

import {
  getBookingById,
  updateBookingStatus,
} from "@/lib/bookings-store";

import { getDoctorById } from "@/lib/doctors-store";
import { releaseSlot } from "@/lib/slots-store";
import { formatLongDate } from "@/lib/utils/date";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

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

function getStatusClasses(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "text-amber-700";

    case "confirmed":
      return "text-blue-600";

    case "upcoming":
      return "text-[var(--success)]";

    case "declined":
      return "text-[var(--urgent-deep)]";

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

function getStatusMessage(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "Your appointment request is waiting for doctor confirmation.";

    case "confirmed":
      return "Your appointment has been confirmed by the doctor.";

    case "upcoming":
      return "Your appointment is scheduled and upcoming.";

    case "declined":
      return "The doctor declined this appointment request. You can choose another available date and time.";

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

function getPageHeading(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "Appointment Request Sent";

    case "confirmed":
      return "Appointment Confirmed";

    case "upcoming":
      return "Appointment Scheduled";

    case "declined":
      return "Appointment Declined";

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

function getStatusIcon(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "⏳";

    case "confirmed":
      return "✓";

    case "upcoming":
      return "📅";

    case "declined":
      return "×";

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

function getStatusIconClasses(
  status: BookingStatus,
) {
  switch (status) {
    case "declined":
    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "pending":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "bg-blue-50 text-blue-600";

    case "upcoming":
    case "completed":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "missed":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }
}

export default function AppointmentConfirmationPage() {
  const { bookingId } =
    useParams<{
      bookingId: string;
    }>();

  const [
    booking,
    setBooking,
  ] = useState<
    Booking | null | undefined
  >(undefined);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setBooking(
        getBookingById(
          bookingId,
        ) ?? null,
      );
    });
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
          We couldn&apos;t find that
          appointment
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          It may have been booked in a
          different browser, or the link
          is incorrect.
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

  /*
   * From this point onward, TypeScript
   * knows that booking is a real Booking.
   */
  const currentBooking =
    booking;

  const doctor =
    getDoctorById(
      currentBooking.doctorId,
    );

  const isTerminal =
    currentBooking.status ===
      "completed" ||
    currentBooking.status ===
      "cancelled" ||
    currentBooking.status ===
      "missed";

  const isDeclined =
    currentBooking.status ===
    "declined";

  function handleCancelDeclined(
    bookingToCancel: Booking,
  ) {
    if (
      bookingToCancel.status !==
        "declined" ||
      isCancelling
    ) {
      return;
    }

    setIsCancelling(true);

    releaseSlot(
      bookingToCancel.doctorId,
      bookingToCancel.slotId,
    );

    updateBookingStatus(
      bookingToCancel.id,
      "cancelled",
    );

    setBooking({
      ...bookingToCancel,
      status: "cancelled",
    });

    setIsCancelling(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-0">
      <div className="text-center">
        <span
          className={`mx-auto grid size-14 place-items-center rounded-full text-2xl ${getStatusIconClasses(
            currentBooking.status,
          )}`}
        >
          {getStatusIcon(
            currentBooking.status,
          )}
        </span>

        <h1 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
          {getPageHeading(
            currentBooking.status,
          )}
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          {getStatusMessage(
            currentBooking.status,
          )}
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
              {currentBooking.id
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
                currentBooking.status,
              )}`}
            >
              {getStatusLabel(
                currentBooking.status,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Date
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {formatLongDate(
                currentBooking.date,
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Time
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {currentBooking.time}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Patient
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {currentBooking.patientName}
            </dd>
          </div>
        </dl>

        {isDeclined && (
          <div className="mt-5 rounded-xl border border-[var(--urgent)]/15 bg-[var(--urgent-soft)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--urgent-deep)]">
              This appointment request was
              declined by the doctor.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--urgent-deep)]/80">
              You can book another available
              slot with this doctor or cancel
              this appointment request.
            </p>
          </div>
        )}

        {isTerminal && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--muted)]">
            This appointment is closed and
            no further appointment actions
            are available.
          </div>
        )}
      </div>

      {isDeclined ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/doctors/${currentBooking.doctorId}`}
            className="flex-1"
          >
            <Button className="w-full">
              Book again
            </Button>
          </Link>

          <Button
            variant="outline"
            className="flex-1"
            disabled={isCancelling}
            onClick={() =>
              handleCancelDeclined(
                currentBooking,
              )
            }
          >
            {isCancelling
              ? "Cancelling..."
              : "Cancel appointment"}
          </Button>
        </div>
      ) : (
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
      )}

      {isDeclined && (
        <div className="mt-3">
          <Link
            href="/appointments"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full"
            >
              Back to my appointments
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}