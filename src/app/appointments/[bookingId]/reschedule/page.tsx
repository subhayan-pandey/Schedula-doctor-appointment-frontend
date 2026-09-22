"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/Button";
import DateStrip from "@/components/ui/DateStrip";

import SlotGrid from "@/features/booking/components/SlotGrid";

import {
  canRescheduleBooking,
  getBookingById,
  rescheduleBooking,
} from "@/lib/bookings-store";

import {
  createDoctorNotification,
} from "@/lib/notifications-store";

import {
  getDoctorById,
} from "@/lib/doctors-store";

import {
  bookSlot,
  getSlotsForDoctor,
  releaseSlot,
  rescheduleSlot,
} from "@/lib/slots-store";

import {
  getSession,
} from "@/lib/storage";

import {
  getNextDays,
  toISODate,
} from "@/lib/utils/date";

import type {
  Booking,
} from "@/types/booking";

import type {
  Slot,
} from "@/types/slot";

type PageStatus =
  | "loading"
  | "ready"
  | "unauthorized"
  | "not-found"
  | "forbidden";

export default function RescheduleAppointmentPage() {
  const router =
    useRouter();

  const params =
    useParams<{
      bookingId: string;
    }>();

  const bookingId =
    params.bookingId;

  const days = useMemo(
    () =>
      getNextDays(14),
    [],
  );

  const [
    pageStatus,
    setPageStatus,
  ] = useState<PageStatus>(
    "loading",
  );

  const [
    booking,
    setBooking,
  ] = useState<
    Booking | null
  >(null);

  const [
    patientId,
    setPatientId,
  ] = useState<
    string | null
  >(null);

  const [
    slots,
    setSlots,
  ] = useState<Slot[]>(
    [],
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    selectedSlotId,
    setSelectedSlotId,
  ] = useState<
    string | null
  >(null);

  const [
    isRescheduling,
    setIsRescheduling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  const loadBooking =
    useCallback(() => {
      const session =
        getSession();

      if (
        !session ||
        session.role !==
          "patient"
      ) {
        setPageStatus(
          "unauthorized",
        );

        return;
      }

      const currentBooking =
        getBookingById(
          bookingId,
        );

      if (!currentBooking) {
        setPageStatus(
          "not-found",
        );

        return;
      }

      if (
        currentBooking.patientId !==
        session.id
      ) {
        setPageStatus(
          "forbidden",
        );

        return;
      }

      /*
       * Patient rescheduling is allowed
       * for confirmed/upcoming bookings
       * and for cancelled bookings whose
       * original slot has already been
       * released.
       */
      const canReschedule =
        canRescheduleBooking(
          currentBooking,
        ) ||
        currentBooking.status ===
          "cancelled";

      if (!canReschedule) {
        setBooking(
          currentBooking,
        );

        setPatientId(
          session.id,
        );

        setPageStatus(
          "ready",
        );

        setError(
          "This appointment cannot be rescheduled in its current status.",
        );

        return;
      }

      setBooking(
        currentBooking,
      );

      setPatientId(
        session.id,
      );

      const currentSlots =
        getSlotsForDoctor(
          currentBooking.doctorId,
        );

      setSlots(
        currentSlots,
      );

      const today =
        toISODate(
          new Date(),
        );

      const bookingDateExists =
        days.some(
          (day) =>
            toISODate(day) ===
            currentBooking.date,
        );

      /*
       * For an active booking, keep the
       * current appointment date selected
       * when it is part of the available
       * date range.
       *
       * For a cancelled booking whose
       * original date is in the past or
       * outside the range, start from today.
       */
      if (
        bookingDateExists &&
        currentBooking.date >=
          today
      ) {
        setSelectedDate(
          currentBooking.date,
        );
      } else {
        setSelectedDate(
          toISODate(
            days[0],
          ),
        );
      }

      setSelectedSlotId(
        null,
      );

      setPageStatus(
        "ready",
      );
    }, [
      bookingId,
      days,
    ]);

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        loadBooking();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    loadBooking,
  ]);

  const refreshSlots =
    useCallback(() => {
      if (!booking) {
        return;
      }

      const latestSlots =
        getSlotsForDoctor(
          booking.doctorId,
        );

      setSlots(
        latestSlots,
      );

      setSelectedSlotId(
        (
          currentSelectedSlotId,
        ) => {
          if (
            !currentSelectedSlotId
          ) {
            return null;
          }

          const selectedSlot =
            latestSlots.find(
              (slot) =>
                slot.id ===
                currentSelectedSlotId,
            );

          if (
            !selectedSlot ||
            selectedSlot.status !==
              "available"
          ) {
            return null;
          }

          return currentSelectedSlotId;
        },
      );
    }, [
      booking,
    ]);

  useEffect(() => {
    if (
      pageStatus !==
        "ready" ||
      !booking
    ) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        refreshSlots();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    pageStatus,
    booking,
    refreshSlots,
  ]);

  useEffect(() => {
    if (!booking) {
      return;
    }

    const currentDoctorId =
      booking.doctorId;

    function handleSlotsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          doctorId?: string;
        }>;

      if (
        customEvent.detail
          ?.doctorId !==
        currentDoctorId
      ) {
        return;
      }

      refreshSlots();
    }

    window.addEventListener(
      "schedula:slots-updated",
      handleSlotsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:slots-updated",
        handleSlotsUpdated,
      );
    };
  }, [
    booking,
    refreshSlots,
  ]);

  useEffect(() => {
    function handleBookingsUpdated() {
      const latestBooking =
        getBookingById(
          bookingId,
        );

      if (!latestBooking) {
        return;
      }

      setBooking(
        latestBooking,
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      handleBookingsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleBookingsUpdated,
      );
    };
  }, [
    bookingId,
  ]);

  const slotsForDate =
    useMemo(() => {
      return slots.filter(
        (slot) =>
          slot.date ===
          selectedDate,
      );
    }, [
      slots,
      selectedDate,
    ]);

  const morningSlots =
    useMemo(
      () =>
        slotsForDate.filter(
          (slot) =>
            slot.period ===
            "Morning",
        ),
      [slotsForDate],
    );

  const eveningSlots =
    useMemo(
      () =>
        slotsForDate.filter(
          (slot) =>
            slot.period ===
            "Evening",
        ),
      [slotsForDate],
    );

  const selectedSlot =
    useMemo(() => {
      if (
        !selectedSlotId
      ) {
        return null;
      }

      return (
        slots.find(
          (slot) =>
            slot.id ===
            selectedSlotId,
        ) ?? null
      );
    }, [
      slots,
      selectedSlotId,
    ]);

  const doctor =
    booking
      ? getDoctorById(
          booking.doctorId,
        )
      : undefined;

  function handleSelectDate(
    isoDate: string,
  ) {
    setSelectedDate(
      isoDate,
    );

    setSelectedSlotId(
      null,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );
  }

  function handleSelectSlot(
    slotId: string,
  ) {
    setSelectedSlotId(
      slotId,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );
  }

  function handleReschedule() {
    if (
      isRescheduling ||
      !booking ||
      !selectedSlot
    ) {
      return;
    }

    /*
     * Read the session immediately before
     * the mutation and narrow it locally.
     *
     * This prevents the "'session' is
     * possibly null" TypeScript error.
     */
    const currentSession =
      getSession();

    if (
      !currentSession ||
      currentSession.role !==
        "patient"
    ) {
      setError(
        "Please log in with your patient account before rescheduling.",
      );

      return;
    }

    if (
      currentSession.id !==
      booking.patientId
    ) {
      setError(
        "You are not authorized to reschedule this appointment.",
      );

      return;
    }

    if (
      selectedSlot.status !==
      "available"
    ) {
      setError(
        "This slot is no longer available. Please choose another slot.",
      );

      refreshSlots();

      return;
    }

    if (
      booking.status !==
        "confirmed" &&
      booking.status !==
        "upcoming" &&
      booking.status !==
        "cancelled"
    ) {
      setError(
        "This appointment cannot be rescheduled in its current status.",
      );

      return;
    }

    /*
     * Selecting the same slot is not
     * a real reschedule.
     */
    if (
      booking.slotId ===
        selectedSlot.id &&
      booking.date ===
        selectedSlot.date &&
      booking.time ===
        selectedSlot.time
    ) {
      setError(
        "Please choose a different available slot.",
      );

      return;
    }

    setIsRescheduling(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    /*
     * The original slot is still booked
     * for confirmed/upcoming bookings.
     *
     * Cancelled bookings already released
     * their original slot, so only the new
     * slot needs to be booked.
     */
    const isCancelled =
      booking.status ===
      "cancelled";

    const oldSlotId =
      booking.slotId;

    let slotOperationSucceeded =
      false;

    if (isCancelled) {
      const bookedSlots =
        bookSlot(
          booking.doctorId,
          selectedSlot.id,
        );

      slotOperationSucceeded =
        Boolean(
          bookedSlots,
        );
    } else {
      const rescheduledSlots =
        rescheduleSlot(
          booking.doctorId,
          oldSlotId,
          selectedSlot.id,
        );

      slotOperationSucceeded =
        Boolean(
          rescheduledSlots,
        );
    }

    if (
      !slotOperationSucceeded
    ) {
      setError(
        "This slot was just booked or is no longer available. Please choose another slot.",
      );

      refreshSlots();

      setIsRescheduling(
        false,
      );

      return;
    }

    /*
     * Update the SAME booking record.
     * No second appointment is created.
     */
    const updatedBooking =
      rescheduleBooking(
        booking.id,
        {
          slotId:
            selectedSlot.id,

          date:
            selectedSlot.date,

          time:
            selectedSlot.time,
        },
      );

    if (!updatedBooking) {
      /*
       * Roll back the slot mutation if
       * the booking record could not be
       * updated.
       */
      if (isCancelled) {
        releaseSlot(
          booking.doctorId,
          selectedSlot.id,
        );
      } else {
        rescheduleSlot(
          booking.doctorId,
          selectedSlot.id,
          oldSlotId,
        );
      }

      refreshSlots();

      setError(
        "We could not update the appointment. Your previous slot has been restored. Please try again.",
      );

      setIsRescheduling(
        false,
      );

      return;
    }

    createDoctorNotification({
      userId:
        booking.doctorId,

      title:
        "Appointment rescheduled",

      message: `${currentSession.name} rescheduled their appointment to ${selectedSlot.date} at ${selectedSlot.time}.`,

      type:
        "reschedule",

      appointmentId:
        booking.id,
    });

    setBooking(
      updatedBooking,
    );

    setSlots(
      getSlotsForDoctor(
        booking.doctorId,
      ),
    );

    setSelectedSlotId(
      null,
    );

    setSuccess(
      "Your appointment has been rescheduled successfully.",
    );

    setIsRescheduling(
      false,
    );

    window.setTimeout(() => {
      router.push(
        `/appointments/${booking.id}`,
      );
    }, 700);
  }

  if (
    pageStatus ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading appointment...
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
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Patient login required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Please log in with your patient account to reschedule this
            appointment.
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
      </div>
    );
  }

  if (
    pageStatus ===
      "not-found" ||
    !booking
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Appointment not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The appointment could not be found in your current session.
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
    pageStatus ===
    "forbidden"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This appointment belongs to a different patient account.
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

  const canReschedule =
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming" ||
    booking.status ===
      "cancelled";

  if (!canReschedule) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
          <Link
            href={`/appointments/${booking.id}`}
            className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
          >
            ← Back to appointment
          </Link>

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Reschedule
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              This appointment cannot be rescheduled
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Appointments can be rescheduled only when they are confirmed,
              upcoming, or cancelled.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href={`/appointments/${booking.id}`}
            >
              <Button>
                View appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <Link
          href={`/appointments/${booking.id}`}
          className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
        >
          ← Back to appointment
        </Link>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
            Reschedule appointment
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            Choose a new date and time
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Select an available slot for your appointment. Your existing
            appointment will be updated rather than creating a new booking.
          </p>
        </div>
      </div>

      {doctor && (
        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
              {
                doctor.avatarInitials
              }
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-[var(--ink)]">
                {doctor.name}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {doctor.specialty}
                {" • "}
                {doctor.location}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                Current date
              </p>

              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {booking.date}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                Current time
              </p>

              <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                {booking.time}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Select date
          </h2>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Choose one of the available upcoming dates.
          </p>
        </div>

        <div className="mt-4">
          <DateStrip
            days={days}
            selectedDate={
              selectedDate
            }
            onSelect={
              handleSelectDate
            }
          />
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Select time
          </h2>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Only currently available slots can be selected.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-6">
          {morningSlots.length >
            0 && (
            <SlotGrid
              title="Morning"
              slots={
                morningSlots
              }
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                handleSelectSlot
              }
            />
          )}

          {eveningSlots.length >
            0 && (
            <SlotGrid
              title="Evening"
              slots={
                eveningSlots
              }
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                handleSelectSlot
              }
            />
          )}

          {slotsForDate.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">
                No slots available
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                There are no appointment slots configured for this date.
                Please choose another date.
              </p>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div
          className="mt-5 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3 text-sm font-medium leading-5 text-[var(--urgent-deep)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mt-5 rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-3 text-sm font-medium leading-5 text-[var(--success)]"
          role="status"
        >
          {success}
        </div>
      )}

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              New appointment time
            </p>

            {selectedSlot ? (
              <div className="mt-1">
                <p className="text-base font-semibold text-[var(--ink)]">
                  {selectedSlot.date}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {selectedSlot.time}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-[var(--muted)]">
                Select an available slot above.
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-48">
            <Button
              size="lg"
              className="w-full"
              disabled={
                !selectedSlot ||
                isRescheduling
              }
              onClick={
                handleReschedule
              }
            >
              {isRescheduling
                ? "Rescheduling..."
                : "Confirm reschedule"}
            </Button>

            <Link
              href={`/appointments/${booking.id}`}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full"
                disabled={
                  isRescheduling
                }
              >
                Keep current appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}