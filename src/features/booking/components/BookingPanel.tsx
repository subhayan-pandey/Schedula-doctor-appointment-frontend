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
  addBooking,
} from "@/lib/bookings-store";

import {
  createDoctorNotification,
} from "@/lib/notifications-store";

import {
  bookSlot,
  getSlotsForDoctor,
} from "@/lib/slots-store";

import {
  syncWaitlistAvailability,
} from "@/lib/waitlist-store";

import {
  getNextDays,
  toISODate,
} from "@/lib/utils/date";

import {
  addAppointment,
} from "@/store/slices/appointmentsSlice";

import {
  addNotification,
} from "@/store/slices/notificationsSlice";

import {
  bookDoctorSlot,
  initializeDoctorSlots,
  setDoctorSlots,
} from "@/store/slices/slotsSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import type {
  ConsultationType,
} from "@/types/consultation";

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
    consultationType,
    setConsultationType,
  ] = useState<ConsultationType>(
    "in-person",
  );

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

  const refreshSlots =
    useCallback(() => {
      if (!doctorId) {
        return;
      }

      const currentSlots =
        getSlotsForDoctor(
          doctorId,
        );

      dispatch(
        setDoctorSlots({
          doctorId,
          slots:
            currentSlots,
        }),
      );
    }, [
      dispatch,
      doctorId,
    ]);

  useEffect(() => {
    if (
      doctorId &&
      !slotsInitialized
    ) {
      const currentSlots =
        getSlotsForDoctor(
          doctorId,
        );

      dispatch(
        initializeDoctorSlots({
          doctorId,
          slots:
            currentSlots,
        }),
      );
    }
  }, [
    dispatch,
    doctorId,
    slotsInitialized,
  ]);

  useEffect(() => {
    if (!slotsInitialized) {
      return;
    }

    syncWaitlistAvailability(
      doctorId,
      slots,
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

  const selectedSlot =
    slots.find(
      (slot) =>
        slot.id ===
        selectedSlotId,
    );

  const canBookSelectedSlot =
    selectedSlot?.status ===
    "available";

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

  function handleSelectConsultationType(
    type: ConsultationType,
  ) {
    setConsultationType(
      type,
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

    const slotToBook =
      slots.find(
        (slot) =>
          slot.id ===
          selectedSlotId,
      );

    if (
      !slotToBook ||
      slotToBook.status !==
        "available"
    ) {
      setBookingError(
        "Sorry, this slot was just booked or is no longer available. Please pick another slot.",
      );

      setSelectedSlotId(
        null,
      );

      refreshSlots();

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
        dispatch(
          bookDoctorSlot({
            doctorId,
            slotId:
              selectedSlotId,
          }),
        );

        const bookingId =
          `bk-${Date.now()}`;

        const appointment = {
          id:
            bookingId,

          doctorId,

          slotId:
            slotToBook.id,

          patientId:
            user.id,

          patientName:
            user.name,

          date:
            slotToBook.date,

          time:
            slotToBook.time,

          status:
            "pending" as const,

          consultationType,

          createdAt:
            new Date().toISOString(),
        };

        dispatch(
          addAppointment(
            appointment,
          ),
        );

        /*
         * Persist the Redux state changes
         * through the existing persistence
         * adapters. Redux remains the live
         * application authority.
         */
        addBooking(
          appointment,
        );

        bookSlot(
          doctorId,
          slotToBook.id,
        );

        const notification =
          createDoctorNotification(
            {
              userId:
                doctorId,

              title:
                "New appointment request",

              message:
                `${user.name} requested an ${consultationType === "online" ? "online" : "in-person"} appointment for ${slotToBook.date} at ${slotToBook.time}.`,

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

      <div className="mt-5">
        <p className="text-sm font-medium text-[var(--ink)]">
          Consultation type
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={
              consultationType ===
              "in-person"
            }
            onClick={() =>
              handleSelectConsultationType(
                "in-person",
              )
            }
            className={`rounded-xl border p-4 text-left transition ${
              consultationType ===
              "in-person"
                ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)]"
            }`}
          >
            <p className="text-sm font-semibold text-[var(--ink)]">
              In-Person
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Visit the doctor at the
              clinic.
            </p>
          </button>

          <button
            type="button"
            aria-pressed={
              consultationType ===
              "online"
            }
            onClick={() =>
              handleSelectConsultationType(
                "online",
              )
            }
            className={`rounded-xl border p-4 text-left transition ${
              consultationType ===
              "online"
                ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)]"
            }`}
          >
            <p className="text-sm font-semibold text-[var(--ink)]">
              Online
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Consult the doctor online.
            </p>
          </button>
        </div>
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
            !canBookSelectedSlot ||
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