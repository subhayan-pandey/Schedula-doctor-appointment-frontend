"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/ui/Button";

import PreConsultationIntakeForm from "@/features/appointment/components/PreConsultationIntakeForm";

import {
  getAllBookings,
  updateBookingStatus,
} from "@/lib/bookings-store";

import { createDoctorNotification } from "@/lib/notifications-store";

import { getAllDoctors } from "@/lib/doctors-store";

import { getSlotsForDoctor } from "@/lib/slots-store";

import {
  getConsultationCountdown,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
  getConsultationTypeLabel,
} from "@/lib/consultation";

import { formatLongDate } from "@/lib/utils/date";

import {
  setAppointments,
  updateAppointmentStatus,
} from "@/store/slices/appointmentsSlice";

import { setDoctors } from "@/store/slices/doctorsSlice";

import { addNotification } from "@/store/slices/notificationsSlice";

import {
  initializeDoctorSlots,
  releaseDoctorSlot,
} from "@/store/slices/slotsSlice";

import type { AppDispatch, RootState } from "@/store";

import type { BookingStatus } from "@/types/booking";

function getStatusLabel(status: BookingStatus): string {
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

function getStatusClasses(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "text-amber-700";

    case "confirmed":
      return "text-blue-600";

    case "upcoming":
      return "text-[var(--success)]";

    case "declined":
    case "cancelled":
      return "text-[var(--urgent-deep)]";

    case "completed":
      return "text-[var(--brand-deep)]";

    case "missed":
      return "text-slate-600";

    default:
      return "text-[var(--muted)]";
  }
}

function getStatusMessage(status: BookingStatus): string {
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
      return "This appointment has been cancelled. You can choose another available appointment.";

    case "missed":
      return "This appointment was marked as missed.";

    default:
      return "";
  }
}

function getPageHeading(status: BookingStatus): string {
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

function getStatusIcon(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "⏳";

    case "confirmed":
    case "completed":
      return "✓";

    case "upcoming":
      return "📅";

    case "declined":
      return "×";

    case "cancelled":
      return "✕";

    case "missed":
      return "−";

    default:
      return "📅";
  }
}

function getStatusIconClasses(status: BookingStatus): string {
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

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 10.25c0 4.5-7 10.25-7 10.25S5 14.75 5 10.25a7 7 0 1 1 14 0Z"
      />

      <circle cx="12" cy="10.25" r="2.25" />
    </svg>
  );
}

export default function AppointmentConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const booking = useSelector(
    (state: RootState) =>
      state.appointments.appointments.find(
        (appointment) => appointment.id === bookingId,
      ) ?? null,
  );

  const appointmentsInitialized = useSelector(
    (state: RootState) => state.appointments.initialized,
  );

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const authInitialized = useSelector(
    (state: RootState) => state.auth.initialized,
  );

  const doctor = useSelector(
    (state: RootState) =>
      booking
        ? state.doctors.doctors.find(
            (item) => item.id === booking.doctorId,
          ) ?? null
        : null,
  );

  const doctorsInitialized = useSelector(
    (state: RootState) => state.doctors.initialized,
  );

  const slots = useSelector(
    (state: RootState) =>
      booking
        ? state.slots.slotsByDoctor[booking.doctorId] ?? []
        : [],
  );

  const slotsInitialized = useSelector(
    (state: RootState) =>
      booking
        ? state.slots.initializedDoctors.includes(
            booking.doctorId,
          )
        : false,
  );

  const [isCancelling, setIsCancelling] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (
      !booking ||
      booking.consultationType !== "online"
    ) {
      return;
    }

    const initialTimer = window.setTimeout(
      () => setCurrentTime(Date.now()),
      0,
    );

    const interval = window.setInterval(
      () => setCurrentTime(Date.now()),
      1000,
    );

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [booking]);

  useEffect(() => {
    if (!appointmentsInitialized) {
      dispatch(
        setAppointments(getAllBookings()),
      );
    }
  }, [dispatch, appointmentsInitialized]);

  useEffect(() => {
    if (!doctorsInitialized) {
      dispatch(
        setDoctors(getAllDoctors()),
      );
    }
  }, [dispatch, doctorsInitialized]);

  useEffect(() => {
    if (!booking || slotsInitialized) {
      return;
    }

    dispatch(
      initializeDoctorSlots({
        doctorId: booking.doctorId,
        slots: getSlotsForDoctor(booking.doctorId),
      }),
    );
  }, [dispatch, booking, slotsInitialized]);

  if (
    !authInitialized ||
    !appointmentsInitialized ||
    !doctorsInitialized
  ) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading appointment…
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          We couldn&apos;t find that appointment
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          It may have been booked in a different browser, or the link is
          incorrect.
        </p>

        <Link
          href="/doctors"
          className="mt-6 inline-block"
        >
          <Button>Find a doctor</Button>
        </Link>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "patient" ||
    booking.patientId !== user.id
  ) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Appointment unavailable
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          You are not authorized to view this appointment.
        </p>

        <Link
          href="/appointments"
          className="mt-6 inline-block"
        >
          <Button>View my appointments</Button>
        </Link>
      </div>
    );
  }

  const currentBooking = booking;

  const isOnline =
    currentBooking.consultationType === "online";

  const isInPerson = !isOnline;

  const canCancel =
    currentBooking.status === "pending" ||
    currentBooking.status === "confirmed" ||
    currentBooking.status === "upcoming";

  const canReschedule =
    currentBooking.status === "confirmed" ||
    currentBooking.status === "upcoming";

  const isDeclined =
    currentBooking.status === "declined";

  const isCompleted =
    currentBooking.status === "completed";

  const isMissed =
    currentBooking.status === "missed";

  const isCancelled =
    currentBooking.status === "cancelled";

  const consultationStatus = isOnline
    ? getConsultationStatus(
        currentBooking.date,
        currentBooking.time,
        currentTime,
      )
    : "scheduled";

  const countdown = isOnline
    ? getConsultationCountdown(
        currentBooking.date,
        currentBooking.time,
        currentTime,
      )
    : null;

  const canJoinConsultation =
    isOnline &&
    (consultationStatus === "starting-soon" ||
      consultationStatus === "live") &&
    (currentBooking.status === "confirmed" ||
      currentBooking.status === "upcoming") &&
    currentTime > 0;

  const clinicName =
    doctor?.clinic ?? "Clinic";

  const clinicLocation =
    doctor?.location ?? "";

  const locationQuery = `${clinicName}${
    clinicLocation ? `, ${clinicLocation}` : ""
  }`;

  function handleCancel() {
    if (
      !canCancel ||
      isCancelling ||
      !slotsInitialized
    ) {
      return;
    }

    const currentSlot = slots.find(
      (slot) => slot.id === currentBooking.slotId,
    );

    if (
      !currentSlot ||
      currentSlot.status !== "booked"
    ) {
      return;
    }

    setIsCancelling(true);

    dispatch(
      releaseDoctorSlot({
        doctorId: currentBooking.doctorId,
        slotId: currentBooking.slotId,
      }),
    );

    dispatch(
      updateAppointmentStatus({
        bookingId: currentBooking.id,
        status: "cancelled",
        actionReason:
          "Appointment cancelled by patient",
      }),
    );

    updateBookingStatus(
      currentBooking.id,
      "cancelled",
      "Appointment cancelled by patient",
    );

    const notification =
      createDoctorNotification({
        userId: currentBooking.doctorId,
        title: "Appointment cancelled",
        message: `${
          currentBooking.patientName
        } cancelled the appointment scheduled for ${formatLongDate(
          currentBooking.date,
        )} at ${currentBooking.time}.`,
        type: "cancellation",
        appointmentId: currentBooking.id,
      });

    dispatch(addNotification(notification));

    setIsCancelling(false);
  }

  function handleCancelDeclined() {
    if (!isDeclined || isCancelling) {
      return;
    }

    setIsCancelling(true);

    dispatch(
      updateAppointmentStatus({
        bookingId: currentBooking.id,
        status: "cancelled",
        actionReason:
          "Declined appointment cancelled by patient",
      }),
    );

    updateBookingStatus(
      currentBooking.id,
      "cancelled",
      "Declined appointment cancelled by patient",
    );

    const notification =
      createDoctorNotification({
        userId: currentBooking.doctorId,
        title: "Declined appointment cancelled",
        message: `${
          currentBooking.patientName
        } cancelled the declined appointment for ${formatLongDate(
          currentBooking.date,
        )} at ${currentBooking.time}.`,
        type: "cancellation",
        appointmentId: currentBooking.id,
      });

    dispatch(addNotification(notification));

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
          {getStatusIcon(currentBooking.status)}
        </span>

        <h1 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
          {getPageHeading(currentBooking.status)}
        </h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          {getStatusMessage(currentBooking.status)}
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
                {doctor.specialty} · {doctor.location}
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
              #{currentBooking.id.slice(-6).toUpperCase()}
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
              {getStatusLabel(currentBooking.status)}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Consultation
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {getConsultationTypeLabel(
                currentBooking.consultationType ??
                  "in-person",
              )}
            </dd>
          </div>

          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              Date
            </dt>

            <dd className="font-medium text-[var(--ink)]">
              {formatLongDate(currentBooking.date)}
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

        {isInPerson && (
          <div className="mt-5 rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand-deep)]">
                <LocationIcon />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--muted)]">
                  In-Person Consultation
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {clinicName}
                </p>

                {clinicLocation && (
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {clinicLocation}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Appointment
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                      {formatLongDate(
                        currentBooking.date,
                      )}{" "}
                      · {currentBooking.time}
                    </p>
                  </div>

                  {clinicLocation && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        locationQuery,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="sm:ml-auto"
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
            </div>
          </div>
        )}

        {isOnline && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--muted)]">
                  Consultation status
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {getConsultationStatusLabel(
                    consultationStatus,
                  )}
                </p>
              </div>

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

            {countdown && (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <p className="text-xs text-[var(--muted)]">
                  Consultation starts in
                </p>

                <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-[var(--ink)]">
                  {countdown}
                </p>
              </div>
            )}

            {consultationStatus === "live" && (
              <p className="mt-3 text-xs leading-5 text-[var(--success)]">
                The consultation is live. You can join now.
              </p>
            )}

            {consultationStatus === "ended" && (
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                This consultation window has ended.
              </p>
            )}

            <div className="mt-4">
              {canJoinConsultation ? (
                <Link
                  href={`/appointments/${currentBooking.id}/consultation`}
                  className="block"
                >
                  <Button className="w-full">
                    Join Consultation
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  {consultationStatus === "scheduled"
                    ? "Join when consultation is starting"
                    : consultationStatus === "ended"
                      ? "Consultation ended"
                      : "Join Consultation"}
                </Button>
              )}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mt-5 rounded-xl border border-[var(--urgent)]/15 bg-[var(--urgent-soft)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--urgent-deep)]">
              This appointment request was declined by the doctor.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--urgent-deep)]/80">
              You can book another available slot with this doctor or cancel
              this appointment request.
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--ink)]">
              This appointment has been cancelled.
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              You can reschedule this appointment using the same appointment
              record.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--muted)]">
            This appointment has been completed.
          </div>
        )}

        {isMissed && (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm text-[var(--muted)]">
            This appointment was marked as missed.
          </div>
        )}
      </div>

      <div className="mt-6">
        <PreConsultationIntakeForm
          appointmentId={currentBooking.id}
          patientId={currentBooking.patientId}
        />
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
            onClick={handleCancelDeclined}
          >
            {isCancelling
              ? "Cancelling..."
              : "Cancel appointment"}
          </Button>
        </div>
      ) : isCancelled ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/appointments/${currentBooking.id}/reschedule`}
            className="flex-1"
          >
            <Button className="w-full">
              Reschedule
            </Button>
          </Link>

          <Link
            href={`/doctors/${currentBooking.doctorId}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full"
            >
              Book new appointment
            </Button>
          </Link>
        </div>
      ) : isCompleted ? (
        <div className="mt-6">
          <Link
            href={`/doctors/${currentBooking.doctorId}`}
            className="block"
          >
            <Button className="w-full">
              Book another appointment
            </Button>
          </Link>
        </div>
      ) : isMissed ? (
        <div className="mt-6">
          <Link
            href={`/doctors/${currentBooking.doctorId}`}
            className="block"
          >
            <Button className="w-full">
              Book again
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {canReschedule ? (
            <Link
              href={`/appointments/${currentBooking.id}/reschedule`}
              className="flex-1"
            >
              <Button className="w-full">
                Reschedule
              </Button>
            </Link>
          ) : (
            <Link
              href="/appointments"
              className="flex-1"
            >
              <Button className="w-full">
                View my appointments
              </Button>
            </Link>
          )}

          {canCancel && (
            <Button
              variant="outline"
              className="flex-1"
              disabled={
                isCancelling ||
                !slotsInitialized
              }
              onClick={handleCancel}
            >
              {isCancelling
                ? "Cancelling..."
                : "Cancel appointment"}
            </Button>
          )}

          {!canCancel &&
            !canReschedule && (
              <Link
                href="/doctors"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Find another doctor
                </Button>
              </Link>
            )}
        </div>
      )}

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
    </div>
  );
}