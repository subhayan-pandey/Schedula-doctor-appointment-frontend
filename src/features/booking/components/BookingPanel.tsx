"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import DateStrip from "@/components/ui/DateStrip";
import SlotGrid from "@/features/booking/components/SlotGrid";

import {
  bookSlot,
  getSlotsForDoctor,
} from "@/lib/slots-store";

import {
  addBooking,
} from "@/lib/bookings-store";

import {
  getSession,
} from "@/lib/storage";

import {
  getNextDays,
  toISODate,
} from "@/lib/utils/date";

import type { Slot } from "@/types/slot";

export default function BookingPanel({
  doctorId,
}: {
  doctorId: string;
}) {
  const router =
    useRouter();

  const days = useMemo(
    () => getNextDays(6),
    [],
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () => toISODate(days[0]),
  );

  const [
    selectedSlotId,
    setSelectedSlotId,
  ] = useState<
    string | null
  >(null);

  const [
    slots,
    setSlots,
  ] = useState<Slot[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

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

  useEffect(() => {
    Promise.resolve().then(() => {
      setSlots(
        getSlotsForDoctor(
          doctorId,
        ),
      );

      setIsLoading(false);
    });
  }, [doctorId]);

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

  const selectedSlot =
    slotsForDate.find(
      (slot) =>
        slot.id ===
        selectedSlotId,
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
    if (!selectedSlotId) {
      return;
    }

    const session =
      getSession();

    if (!session) {
      setBookingError(
        "Please log in before booking an appointment.",
      );

      return;
    }

    if (
      session.role !==
      "patient"
    ) {
      setBookingError(
        "Please use a patient account to book an appointment.",
      );

      return;
    }

    setIsBooking(true);
    setBookingError(null);

    window.setTimeout(() => {
      const updatedSlots =
        bookSlot(
          doctorId,
          selectedSlotId,
        );

      if (!updatedSlots) {
        setBookingError(
          "Sorry, this slot was just booked or is no longer available. Please pick another slot.",
        );

        setSlots(
          getSlotsForDoctor(
            doctorId,
          ),
        );

        setSelectedSlotId(
          null,
        );

        setIsBooking(false);

        return;
      }

      const bookedSlot =
        updatedSlots.find(
          (slot) =>
            slot.id ===
            selectedSlotId,
        );

      if (!bookedSlot) {
        setBookingError(
          "Unable to complete the booking. Please try again.",
        );

        setIsBooking(false);

        return;
      }

      const bookingId =
        `bk-${Date.now()}`;

      addBooking({
        id: bookingId,
        doctorId,
        slotId:
          bookedSlot.id,
        patientId:
          session.id,
        patientName:
          session.name ??
          "Guest Patient",
        date:
          bookedSlot.date,
        time:
          bookedSlot.time,
        status: "pending",
        createdAt:
          new Date().toISOString(),
      });

      setSlots(
        updatedSlots,
      );

      setIsBooking(false);

      router.push(
        `/appointments/${bookingId}`,
      );
    }, 500);
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-deep)]">
            Availability
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--ink)]">
            Book an appointment
          </h2>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Select a date and available time
        </p>
      </div>

      <div className="mt-5">
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

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-[var(--line)]" />

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {Array.from(
                { length: 6 },
                (_, index) => (
                  <div
                    key={index}
                    className="h-11 animate-pulse rounded-lg bg-[var(--line)]"
                  />
                ),
              )}
            </div>
          </div>
        ) : slotsForDate.length ===
          0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-7 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="2"
                />
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <path d="M3 9h18" />
              </svg>
            </span>

            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
              No slots available
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              There are no configured slots for this date. Try another day.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <SlotGrid
              title="Morning"
              slots={morningSlots}
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                (
                  slotId,
                ) => {
                  setSelectedSlotId(
                    slotId,
                  );
                  setBookingError(
                    null,
                  );
                }
              }
            />

            <SlotGrid
              title="Evening"
              slots={eveningSlots}
              selectedSlotId={
                selectedSlotId
              }
              onSelect={
                (
                  slotId,
                ) => {
                  setSelectedSlotId(
                    slotId,
                  );
                  setBookingError(
                    null,
                  );
                }
              }
            />
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="mt-6 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-4 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-deep)]">
                Selected slot
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                {selectedSlot.time}
              </p>
            </div>

            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--brand-deep)]">
              Available
            </span>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="mt-4 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3">
          <p className="text-sm font-medium leading-5 text-[var(--urgent-deep)]">
            {bookingError}
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={
          !selectedSlotId ||
          isBooking
        }
        onClick={
          handleConfirmBooking
        }
      >
        {isBooking
          ? "Booking…"
          : "Book appointment"}
      </Button>

      <p className="mt-2 text-center text-xs text-[var(--muted)]">
        You can review your appointment details after booking.
      </p>
    </section>
  );
}