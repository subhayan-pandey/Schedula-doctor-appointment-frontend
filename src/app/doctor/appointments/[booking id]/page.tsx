"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";

import {
  getAllBookings,
} from "@/lib/bookings-store";

import {
  getAllDoctors,
} from "@/lib/doctors-store";

import {
  getConsultationCountdown,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
  getConsultationTypeLabel,
} from "@/lib/consultation";

import {
  createNotification,
} from "@/lib/notifications-store";

import {
  formatLongDate,
} from "@/lib/utils/date";

import {
  initializeAppointments,
  updateAppointmentStatus,
} from "@/store/slices/appointmentsSlice";

import {
  initializeDoctors,
} from "@/store/slices/doctorsSlice";

import {
  addNotification,
} from "@/store/slices/notificationsSlice";

import {
  releaseDoctorSlot,
} from "@/store/slices/slotsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import type {
  BookingStatus,
} from "@/types/booking";

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

function getStatusClasses(
  status: BookingStatus,
): string {
  switch (status) {
    case "pending":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "upcoming":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "declined":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "completed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "missed":
      return "bg-[var(--canvas)] text-[var(--muted)]";

    default:
      return "bg-[var(--canvas)] text-[var(--muted)]";
  }
}

function getStatusMessage(
  status: BookingStatus,
): string {
  switch (status) {
    case "pending":
      return "This appointment request is waiting for your confirmation.";

    case "confirmed":
      return "This appointment has been confirmed and is ready to move into the upcoming schedule.";

    case "upcoming":
      return "This appointment is scheduled and upcoming.";

    case "declined":
      return "This appointment request was declined. The patient can book another available slot.";

    case "completed":
      return "This appointment has been completed and is now read-only.";

    case "cancelled":
      return "This appointment has been cancelled and is now read-only.";

    case "missed":
      return "This appointment was marked as missed and is now read-only.";

    default:
      return "";
  }
}

function getInitials(
  name: string,
): string {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join("");

  return initials || "PT";
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
      className="size-5"
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

export default function DoctorAppointmentDetailsPage() {
  const params =
    useParams<{
      "booking id": string;
    }>();

  const bookingId =
    params["booking id"];

  const dispatch =
    useDispatch<AppDispatch>();

  const user =
    useSelector(
      (state: RootState) =>
        state.auth.user,
    );

  const authInitialized =
    useSelector(
      (state: RootState) =>
        state.auth.initialized,
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

  const booking =
    appointments.find(
      (appointment) =>
        appointment.id ===
        bookingId,
    ) ?? null;

  const doctor =
    booking
      ? doctors.find(
          (item) =>
            item.id ===
            booking.doctorId,
        ) ?? null
      : null;

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  useEffect(() => {
    if (
      !appointmentsInitialized
    ) {
      dispatch(
        initializeAppointments(
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
        initializeDoctors(
          getAllDoctors(),
        ),
      );
    }
  }, [
    dispatch,
    doctorsInitialized,
  ]);

  useEffect(() => {
    if (
      !booking ||
      booking.consultationType !==
        "online"
    ) {
      return;
    }

    const initialTimer =
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
        initialTimer,
      );

      window.clearInterval(
        interval,
      );
    };
  }, [booking]);

  function notifyPatient(
    currentBooking: NonNullable<
      typeof booking
    >,
    title: string,
    message: string,
    type:
      | "appointment"
      | "confirmation"
      | "cancellation",
  ) {
    if (
      !currentBooking.patientId
    ) {
      return;
    }

    const notification =
      createNotification({
        userId:
          currentBooking.patientId,
        title,
        message,
        type,
        appointmentId:
          currentBooking.id,
      });

    dispatch(
      addNotification(
        notification,
      ),
    );
  }

  function handleConfirm() {
    if (
      !booking ||
      booking.status !==
        "pending"
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "upcoming",
      }),
    );

    notifyPatient(
      booking,
      "Appointment confirmed",
      `Your appointment on ${formatLongDate(
        booking.date,
      )} at ${
        booking.time
      } has been confirmed and is now upcoming.`,
      "confirmation",
    );

    setIsProcessing(false);
  }

  function handleDecline() {
    if (
      !booking ||
      !user ||
      user.role !== "doctor" ||
      booking.status !==
        "pending"
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "declined",
      }),
    );

    dispatch(
      releaseDoctorSlot({
        doctorId:
          booking.doctorId,
        slotId:
          booking.slotId,
      }),
    );

    notifyPatient(
      booking,
      "Appointment declined",
      `Your appointment request for ${formatLongDate(
        booking.date,
      )} at ${
        booking.time
      } was declined by the doctor. You can book another available slot.`,
      "appointment",
    );

    setIsProcessing(false);
  }

  function handleMarkUpcoming() {
    if (
      !booking ||
      booking.status !==
        "confirmed"
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "upcoming",
      }),
    );

    notifyPatient(
      booking,
      "Appointment is upcoming",
      `Your appointment on ${formatLongDate(
        booking.date,
      )} at ${
        booking.time
      } is now upcoming.`,
      "appointment",
    );

    setIsProcessing(false);
  }

  function handleComplete() {
    if (
      !booking ||
      booking.status !==
        "upcoming"
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "completed",
      }),
    );

    notifyPatient(
      booking,
      "Appointment completed",
      "Your appointment has been marked as completed. You can now review your doctor and access your prescription when available.",
      "appointment",
    );

    setIsProcessing(false);
  }

  function handleMissed() {
    if (
      !booking ||
      booking.status !==
        "upcoming"
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "missed",
      }),
    );

    notifyPatient(
      booking,
      "Appointment missed",
      `Your appointment scheduled for ${formatLongDate(
        booking.date,
      )} at ${
        booking.time
      } was marked as missed.`,
      "appointment",
    );

    setIsProcessing(false);
  }

  function handleCancel() {
    if (
      !booking ||
      !user ||
      user.role !== "doctor" ||
      (
        booking.status !==
          "confirmed" &&
        booking.status !==
          "upcoming"
      )
    ) {
      return;
    }

    setIsProcessing(true);

    dispatch(
      releaseDoctorSlot({
        doctorId:
          booking.doctorId,
        slotId:
          booking.slotId,
      }),
    );

    dispatch(
      updateAppointmentStatus({
        bookingId:
          booking.id,
        status: "cancelled",
      }),
    );

    notifyPatient(
      booking,
      "Appointment cancelled",
      `Your appointment scheduled for ${formatLongDate(
        booking.date,
      )} at ${
        booking.time
      } has been cancelled. The appointment slot is available again.`,
      "cancellation",
    );

    setIsProcessing(false);
  }

  function renderActions() {
    if (!booking) {
      return null;
    }

    switch (booking.status) {
      case "pending":
        return (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={
                isProcessing
              }
              onClick={
                handleConfirm
              }
            >
              <span className="inline-flex items-center gap-2">
                <CheckIcon />
                Confirm appointment
              </span>
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              disabled={
                isProcessing
              }
              onClick={
                handleDecline
              }
            >
              <span className="inline-flex items-center gap-2">
                <XIcon />
                Decline
              </span>
            </Button>
          </div>
        );

      case "confirmed":
        return (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={
                isProcessing
              }
              onClick={
                handleMarkUpcoming
              }
            >
              Mark as upcoming
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              disabled={
                isProcessing
              }
              onClick={
                handleCancel
              }
            >
              Cancel appointment
            </Button>
          </div>
        );

      case "upcoming":
        return (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              disabled={
                isProcessing
              }
              onClick={
                handleComplete
              }
            >
              Mark completed
            </Button>

            <Button
              variant="outline"
              disabled={
                isProcessing
              }
              onClick={
                handleMissed
              }
            >
              Mark missed
            </Button>

            <Button
              variant="outline"
              disabled={
                isProcessing
              }
              onClick={
                handleCancel
              }
            >
              Cancel appointment
            </Button>
          </div>
        );

      case "declined":
        return (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            This appointment was
            declined. No further
            doctor action is
            available here. The
            patient can book another
            available slot or cancel
            the declined appointment.
          </div>
        );

      case "completed":
        return (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            This appointment has
            been completed and is
            read-only.
          </div>
        );

      case "cancelled":
        return (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            This appointment has
            been cancelled and is
            read-only.
          </div>
        );

      case "missed":
        return (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            This appointment was
            marked as missed and is
            read-only.
          </div>
        );

      default:
        return null;
    }
  }

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

  if (
    !user ||
    user.role !== "doctor"
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
            You must be logged in as
            the doctor associated with
            this appointment.
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

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Appointment not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This appointment could not
          be found in the current
          session.
        </p>

        <Link
          href="/doctor/appointments"
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
    booking.doctorId !==
    user.id
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
            You must be logged in as
            the doctor associated with
            this appointment.
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

  const isOnline =
    booking.consultationType ===
    "online";

  const isInPerson =
    !isOnline;

  const consultationStatus =
    isOnline
      ? getConsultationStatus(
          booking.date,
          booking.time,
          currentTime,
        )
      : "scheduled";

  const countdown =
    isOnline
      ? getConsultationCountdown(
          booking.date,
          booking.time,
          currentTime,
        )
      : null;

  const canStartConsultation =
    isOnline &&
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
    ) &&
    currentTime > 0;

  const clinicName =
    doctor?.clinic ??
    "Clinic";

  const clinicLocation =
    doctor?.location ??
    "";

  const locationQuery =
    `${clinicName}${
      clinicLocation
        ? `, ${clinicLocation}`
        : ""
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/doctor/appointments"
          className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
        >
          ← Back to appointments
        </Link>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
            booking.status,
          )}`}
        >
          {getStatusLabel(
            booking.status,
          )}
        </span>
      </div>

      <header className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
          Appointment details
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
          Patient appointment
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Review the appointment
          information and manage its
          current status.
        </p>
      </header>

      <section className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-base font-semibold text-[var(--brand-deep)]">
            {getInitials(
              booking.patientName,
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--muted)]">
              Patient
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-[var(--ink)]">
              {booking.patientName}
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Patient ID:{" "}
              {booking.patientId}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--canvas)] p-4">
            <dt className="text-xs font-medium text-[var(--muted)]">
              Appointment ID
            </dt>

            <dd className="mt-1 break-all text-sm font-semibold text-[var(--ink)]">
              {booking.id}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--canvas)] p-4">
            <dt className="text-xs font-medium text-[var(--muted)]">
              Status
            </dt>

            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {getStatusLabel(
                booking.status,
              )}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--canvas)] p-4">
            <dt className="text-xs font-medium text-[var(--muted)]">
              Consultation
            </dt>

            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {getConsultationTypeLabel(
                booking.consultationType ??
                  "in-person",
              )}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--canvas)] p-4">
            <dt className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <CalendarIcon />
              Date
            </dt>

            <dd className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {formatLongDate(
                booking.date,
              )}
            </dd>
          </div>

          <div className="rounded-xl bg-[var(--canvas)] p-4">
            <dt className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <ClockIcon />
              Time
            </dt>

            <dd className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {booking.time}
            </dd>
          </div>
        </dl>

        {doctor && (
          <div className="mt-4 rounded-xl border border-[var(--line)] px-4 py-4">
            <p className="text-xs font-medium text-[var(--muted)]">
              Doctor
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {doctor.name}
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {doctor.specialty}
            </p>
          </div>
        )}

        {isInPerson && (
          <div className="mt-5 rounded-xl border border-[var(--brand)]/15 bg-[var(--brand-soft)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {clinicLocation}
                  </p>
                )}

                <div className="mt-4 grid gap-3 border-t border-[var(--brand)]/10 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Appointment time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                      {formatLongDate(
                        booking.date,
                      )}
                    </p>

                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {booking.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Clinic
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                      {clinicName}
                    </p>

                    {clinicLocation && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          locationQuery,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          View Location
                        </Button>
                      </a>
                    )}
                  </div>
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

            {consultationStatus ===
              "live" && (
              <p className="mt-3 text-xs leading-5 text-[var(--success)]">
                The consultation is live. You
                can start now.
              </p>
            )}

            {consultationStatus ===
              "ended" && (
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                This consultation window has
                ended.
              </p>
            )}

            <div className="mt-4">
              {canStartConsultation ? (
                <Link
                  href={`/doctor/appointments/${booking.id}/consultation`}
                  className="block"
                >
                  <Button className="w-full">
                    Start Consultation
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  disabled
                >
                  {consultationStatus ===
                  "scheduled"
                    ? "Start when consultation is starting"
                    : consultationStatus ===
                        "ended"
                      ? "Consultation ended"
                      : "Start Consultation"}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
          <p className="text-sm leading-6 text-[var(--muted)]">
            {getStatusMessage(
              booking.status,
            )}
          </p>
        </div>
      </section>

      <section className="mt-6">
        {renderActions()}
      </section>

      {isProcessing && (
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Updating appointment…
        </p>
      )}
    </div>
  );
}