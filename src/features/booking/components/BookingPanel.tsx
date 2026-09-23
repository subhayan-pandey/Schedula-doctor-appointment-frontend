"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";
import DateStrip from "@/components/ui/DateStrip";

import SlotGrid from "@/features/booking/components/SlotGrid";
import WaitlistPanel from "@/features/booking/components/WaitlistPanel";

import {
  createDoctorNotification,
} from "@/lib/notifications-store";

import {
  syncWaitlistAvailability,
} from "@/lib/waitlist-store";

import {
  getNextDays,
  toISODate,
} from "@/lib/utils/date";

import {
  initializeDoctorSlots,
  bookDoctorSlot,
} from "@/store/slices/slotsSlice";

import {
  addAppointment,
} from "@/store/slices/appointmentsSlice";

import {
  addNotification,
} from "@/store/slices/notificationsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store";

export default function BookingPanel({
  doctorId,
}: {
  doctorId: string;
}) {
  const router =
    useRouter();

  const dispatch =
    useDispatch<AppDispatch>();

  const days = useMemo(
    () =>
      getNextDays(6),
    [],
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () =>
      toISODate(
        days[0],
      ),
  );

  const [
    selectedSlotId,
    setSelectedSlotId,
  ] = useState<
    string | null
  >(null);

  const [
    isBooking,
    setIsBooking,
  ] = useState(false);

  const [
    bookingError,
    setBookingError,
  ] = useState<
    string | null
  >(null);

  const user =
    useSelector(
      (state: RootState) =>
        state.auth.user,
    );

  const slots =
    useSelector(
      (state: RootState) =>
        state.slots.slotsByDoctor[
          doctorId
        ] ?? [],
    );

  const slotsInitialized =
    useSelector(
      (state: RootState) =>
        state.slots.initializedDoctors.includes(
          doctorId,
        ),
    );

  useEffect(() => {
    if (
      doctorId &&
      !slotsInitialized
    ) {
      dispatch(
        initializeDoctorSlots(
          doctorId,
        ),
      );
    }
  }, [
    dispatch,
    doctorId,
    slotsInitialized,
  ]);

  const refreshSlots =
    useCallback(() => {
      dispatch(
        initializeDoctorSlots(
          doctorId,
        ),
      );
    }, [
      dispatch,
      doctorId,
    ]);

  useEffect(() => {
    if (!slotsInitialized) {
      return;
    }

    syncWaitlistAvailability(
      doctorId,
      slots,
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
          slots.find(
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
    doctorId,
    slots,
    slotsInitialized,
  ]);

  useEffect(() => {
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
        doctorId
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
    doctorId,
    refreshSlots,
  ]);

  const slotsForDate =
    slots.filter(
      (slot) =>
        slot.date ===
        selectedDate,
    );

  const morningSlots =
    slotsForDate.filter(
      (slot) =>
        slot.period ===
        "Morning",
    );

  const eveningSlots =
    slotsForDate.filter(
      (slot) =>
        slot.period ===
        "Evening",
    );

  const hasAvailableSlots =
    slotsForDate.some(
      (slot) =>
        slot.status ===
        "available",
    );

  function handleSelectDate(
    isoDate: string,
  ) {
    setSelectedDate(
      isoDate,
    );

    setSelectedSlotId(
      null,
    );

    setBookingError(
      null,
    );
  }

  function handleConfirmBooking() {
    if (
      !selectedSlotId ||
      isBooking
    ) {
      return;
    }

    if (!user) {
      setBookingError(
        "Please log in before booking an appointment.",
      );

      return;
    }

    if (
      user.role !==
      "patient"
    ) {
      setBookingError(
        "Please use a patient account to book an appointment.",
      );

      return;
    }

    setIsBooking(
      true,
    );

    setBookingError(
      null,
    );

    window.setTimeout(
      () => {
        const selectedSlot =
          slots.find(
            (slot) =>
              slot.id ===
              selectedSlotId,
          );

        if (
          !selectedSlot ||
          selectedSlot.status !==
            "available"
        ) {
          setBookingError(
            "Sorry, this slot was just booked or is no longer available. Please pick another slot.",
          );

          refreshSlots();

          setSelectedSlotId(
            null,
          );

          setIsBooking(
            false,
          );

          return;
        }

        const bookingId =
          `bk-${Date.now()}`;

        const updatedSlots =
          dispatch(
            bookDoctorSlot({
              doctorId,
              slotId:
                selectedSlotId,
            }),
          );

        if (
          !updatedSlots
        ) {
          setBookingError(
            "Sorry, this slot was just booked or is no longer available. Please pick another slot.",
          );

          refreshSlots();

          setSelectedSlotId(
            null,
          );

          setIsBooking(
            false,
          );

          return;
        }

        const bookedSlot =
          selectedSlot;

        const appointment =
          {
            id:
              bookingId,

            doctorId,

            slotId:
              bookedSlot.id,

            patientId:
              user.id,

            patientName:
              user.name,

            date:
              bookedSlot.date,

            time:
              bookedSlot.time,

            status:
              "pending" as const,

            createdAt:
              new Date().toISOString(),
          };

        dispatch(
          addAppointment(
            appointment,
          ),
        );

        const notification =
          createDoctorNotification(
            {
              userId:
                doctorId,

              title:
                "New appointment request",

              message:
                `${user.name} requested an appointment for ${bookedSlot.date} at ${bookedSlot.time}.`,

              type:
                "appointment",

              appointmentId:
                bookingId,
            },
          );

        dispatch(
          addNotification(
            notification,
          ),
        );

        setSelectedSlotId(
          null,
        );

        setIsBooking(
          false,
        );

        router.push(
          `/appointments/${bookingId}`,
        );
      },
      500,
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <p className="font-semibold text-[var(--ink)]">
        Book Appointment
      </p>

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

      <div className="mt-5 flex flex-col gap-5">
        {!slotsInitialized ? (
          <p className="text-sm text-[var(--muted)]">
            Loading availability...
          </p>
        ) : slotsForDate.length ===
          0 ? (
          <WaitlistPanel
            doctorId={
              doctorId
            }
            selectedDate={
              selectedDate
            }
            slots={
              slotsForDate
            }
          />
        ) : (
          <>
            <SlotGrid
              title="Select slot"
              slots={
                morningSlots
              }
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                setSelectedSlotId
              }
            />

            <SlotGrid
              title="Evening Slot"
              slots={
                eveningSlots
              }
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                setSelectedSlotId
              }
            />

            {!hasAvailableSlots && (
              <WaitlistPanel
                doctorId={
                  doctorId
                }
                selectedDate={
                  selectedDate
                }
                slots={
                  slotsForDate
                }
              />
            )}
          </>
        )}
      </div>

      {bookingError && (
        <p className="mt-4 rounded-lg bg-[var(--urgent-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--urgent-deep)]">
          {bookingError}
        </p>
      )}

      {hasAvailableSlots && (
        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={
            !selectedSlotId ||
            isBooking
          }
          onClick={
            handleConfirmBooking
          }
        >
          {isBooking
            ? "Booking..."
            : "Book appointment"}
        </Button>
      )}
    </div>
  );
}