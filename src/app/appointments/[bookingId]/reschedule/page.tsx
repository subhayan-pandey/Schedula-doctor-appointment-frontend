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
import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";
import DateStrip from "@/components/ui/DateStrip";

import SlotGrid from "@/features/booking/components/SlotGrid";

import {
  canRescheduleBooking,
  getAllBookings,
  rescheduleBooking,
} from "@/lib/bookings-store";

import { createDoctorNotification } from "@/lib/notifications-store";

import { getAllDoctors } from "@/lib/doctors-store";

import {
  getSlotsForDoctor,
  bookSlot,
  rescheduleSlot,
} from "@/lib/slots-store";

import {
  getNextDays,
  toISODate,
} from "@/lib/utils/date";

import {
  setAppointments,
  updateAppointment,
} from "@/store/slices/appointmentsSlice";

import { setDoctors } from "@/store/slices/doctorsSlice";

import { addNotification } from "@/store/slices/notificationsSlice";

import {
  bookDoctorSlot,
  initializeDoctorSlots,
  rescheduleDoctorSlot,
} from "@/store/slices/slotsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store";

type PageStatus =
  | "loading"
  | "ready"
  | "unauthorized"
  | "not-found"
  | "forbidden";

export default function RescheduleAppointmentPage() {
  const router = useRouter();

  const params =
    useParams<{ bookingId: string }>();

  const bookingId = params.bookingId;

  const dispatch =
    useDispatch<AppDispatch>();

  const days = useMemo(
    () => getNextDays(14),
    [],
  );

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedSlotId, setSelectedSlotId] =
    useState<string | null>(null);

  const [isRescheduling, setIsRescheduling] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const authInitialized = useSelector(
    (state: RootState) =>
      state.auth.initialized,
  );

  const appointments = useSelector(
    (state: RootState) =>
      state.appointments.appointments,
  );

  const appointmentsInitialized =
    useSelector(
      (state: RootState) =>
        state.appointments.initialized,
    );

  const doctors = useSelector(
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
        appointment.id === bookingId,
    ) ?? null;

  const doctor = booking
    ? doctors.find(
        (item) =>
          item.id === booking.doctorId,
      ) ?? null
    : null;

  const slots = useSelector(
    (state: RootState) =>
      booking
        ? state.slots.slotsByDoctor[
            booking.doctorId
          ] ?? []
        : [],
  );

  const slotsInitialized =
    useSelector(
      (state: RootState) =>
        booking
          ? state.slots.initializedDoctors.includes(
              booking.doctorId,
            )
          : false,
    );

  /*
   * Redux is the authoritative application
   * state. The existing local stores are used
   * only to hydrate/persist that state.
   */
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

  const pageStatus: PageStatus =
    !authInitialized ||
    !appointmentsInitialized ||
    !doctorsInitialized
      ? "loading"
      : !user || user.role !== "patient"
        ? "unauthorized"
        : !booking
          ? "not-found"
          : booking.patientId !== user.id
            ? "forbidden"
            : "ready";

  const canReschedule =
    booking
      ? canRescheduleBooking(booking) ||
        booking.status === "cancelled"
      : false;

  useEffect(() => {
    if (
      pageStatus !== "ready" ||
      !booking ||
      !canReschedule
    ) {
      return;
    }

    if (!slotsInitialized) {
      dispatch(
        initializeDoctorSlots({
          doctorId: booking.doctorId,
          slots: getSlotsForDoctor(
            booking.doctorId,
          ),
        }),
      );
    }
  }, [
    dispatch,
    booking,
    pageStatus,
    canReschedule,
    slotsInitialized,
  ]);

  const bookingDate =
    booking &&
    days.some(
      (day) =>
        toISODate(day) === booking.date,
    ) &&
    booking.date >=
      toISODate(new Date())
      ? booking.date
      : null;

  const effectiveSelectedDate =
    selectedDate ||
    bookingDate ||
    toISODate(days[0]);

  const bookingDoctorId =
    booking?.doctorId ?? null;

  useEffect(() => {
    if (
      !bookingDoctorId ||
      !slotsInitialized
    ) {
      return;
    }

    function handleSlotsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          doctorId?: string;
        }>;

      if (
        customEvent.detail?.doctorId !==
        bookingDoctorId
      ) {
        return;
      }

      /*
       * Rehydrate the Redux slot state when
       * the persistence layer reports an
       * external slot update.
       */
      dispatch(
        initializeDoctorSlots({
          doctorId: bookingDoctorId,
          slots: getSlotsForDoctor(
            bookingDoctorId,
          ),
        }),
      );
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
    dispatch,
    bookingDoctorId,
    slotsInitialized,
  ]);

  const refreshSlots =
    useCallback(() => {
      if (!booking) {
        return;
      }

      dispatch(
        initializeDoctorSlots({
          doctorId: booking.doctorId,
          slots: getSlotsForDoctor(
            booking.doctorId,
          ),
        }),
      );

      setSelectedSlotId(null);
    }, [
      dispatch,
      booking,
    ]);

  const slotsForDate = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.date ===
          effectiveSelectedDate,
      ),
    [
      slots,
      effectiveSelectedDate,
    ],
  );

  const morningSlots = useMemo(
    () =>
      slotsForDate.filter(
        (slot) =>
          slot.period === "Morning",
      ),
    [slotsForDate],
  );

  const eveningSlots = useMemo(
    () =>
      slotsForDate.filter(
        (slot) =>
          slot.period === "Evening",
      ),
    [slotsForDate],
  );

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) {
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

  function handleSelectDate(
    isoDate: string,
  ) {
    setSelectedDate(isoDate);
    setSelectedSlotId(null);
    setError(null);
    setSuccess(null);
  }

  function handleSelectSlot(
    slotId: string,
  ) {
    setSelectedSlotId(slotId);
    setError(null);
    setSuccess(null);
  }

  function handleReschedule() {
    if (
      isRescheduling ||
      !booking ||
      !selectedSlot
    ) {
      return;
    }

    if (
      !user ||
      user.role !== "patient"
    ) {
      setError(
        "Please log in with your patient account before rescheduling.",
      );
      return;
    }

    if (user.id !== booking.patientId) {
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

    const allowed =
      canRescheduleBooking(
        booking,
      ) ||
      booking.status ===
        "cancelled";

    if (!allowed) {
      setError(
        "This appointment cannot be rescheduled in its current status.",
      );
      return;
    }

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

    setIsRescheduling(true);
    setError(null);
    setSuccess(null);

    const isCancelled =
      booking.status ===
      "cancelled";

    const oldSlotId =
      booking.slotId;

    /*
     * Redux is updated first so the
     * application immediately reflects
     * the authoritative state transition.
     *
     * The local store calls below persist
     * that transition for the existing
     * localStorage-backed application.
     */
    if (isCancelled) {
      dispatch(
        bookDoctorSlot({
          doctorId:
            booking.doctorId,
          slotId:
            selectedSlot.id,
        }),
      );

      bookSlot(
        booking.doctorId,
        selectedSlot.id,
      );
    } else {
      dispatch(
        rescheduleDoctorSlot({
          doctorId:
            booking.doctorId,
          currentSlotId:
            oldSlotId,
          newSlotId:
            selectedSlot.id,
        }),
      );

      rescheduleSlot(
        booking.doctorId,
        oldSlotId,
        selectedSlot.id,
      );
    }

    dispatch(
      updateAppointment({
        bookingId: booking.id,
        updates: {
          slotId:
            selectedSlot.id,
          date:
            selectedSlot.date,
          time:
            selectedSlot.time,
        },
      }),
    );

    rescheduleBooking(
      booking.id,
      selectedSlot.id,
      selectedSlot.date,
      selectedSlot.time,
    );

    const notification =
      createDoctorNotification({
        userId: booking.doctorId,
        title:
          "Appointment rescheduled",
        message: `${user.name} rescheduled their appointment to ${selectedSlot.date} at ${selectedSlot.time}.`,
        type: "reschedule",
        appointmentId:
          booking.id,
      });

    dispatch(
      addNotification(
        notification,
      ),
    );

    setSelectedSlotId(null);

    setSuccess(
      "Your appointment has been rescheduled successfully.",
    );

    setIsRescheduling(false);

    window.setTimeout(() => {
      router.push(
        `/appointments/${booking.id}`,
      );
    }, 700);
  }

  if (pageStatus === "loading") {
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
              {doctor.avatarInitials}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-[var(--ink)]">
                {doctor.name}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {doctor.specialty} •{" "}
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
              effectiveSelectedDate
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
              slots={morningSlots}
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
              slots={eveningSlots}
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
                isRescheduling ||
                !slotsInitialized
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