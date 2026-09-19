"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

import SlotGrid from "@/features/booking/components/SlotGrid";

import {
  bookSlot,
  getSlotsForDoctor,
} from "@/lib/slots-store";

import { addBooking } from "@/lib/bookings-store";

import { getSession } from "@/lib/storage";

import { toISODate } from "@/lib/utils/date";

import type { Slot } from "@/types/slot";

function getTodayISO(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toISODate(today);
}

function formatSelectedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BookingPanel({
  doctorId,
}: {
  doctorId: string;
}) {
  const router = useRouter();

  const today = useMemo(() => getTodayISO(), []);

  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayISO);

  const [selectedSlotId, setSelectedSlotId] =
    useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isBooking, setIsBooking] = useState(false);

  const [bookingError, setBookingError] =
    useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSlots(getSlotsForDoctor(doctorId));
      setIsLoading(false);
    });
  }, [doctorId]);

  useEffect(() => {
    function refreshSlots() {
      setSlots(getSlotsForDoctor(doctorId));
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === `schedula:slots:${doctorId}`) {
        refreshSlots();
      }
    }

    function handleSlotsUpdated(event: Event) {
      const customEvent = event as CustomEvent<{
        doctorId?: string;
      }>;

      if (
        !customEvent.detail?.doctorId ||
        customEvent.detail.doctorId === doctorId
      ) {
        refreshSlots();
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "schedula:slots-updated",
      handleSlotsUpdated,
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "schedula:slots-updated",
        handleSlotsUpdated,
      );
    };
  }, [doctorId]);

  const slotsForDate = useMemo(
    () =>
      slots.filter(
        (slot) => slot.date === selectedDate,
      ),
    [slots, selectedDate],
  );

  const availableSlotsForDate = useMemo(
    () =>
      slotsForDate.filter(
        (slot) => slot.status === "available",
      ),
    [slotsForDate],
  );

  const morningSlots = useMemo(
    () =>
      availableSlotsForDate.filter(
        (slot) => slot.period === "Morning",
      ),
    [availableSlotsForDate],
  );

  const eveningSlots = useMemo(
    () =>
      availableSlotsForDate.filter(
        (slot) => slot.period === "Evening",
      ),
    [availableSlotsForDate],
  );

  function handleSelectDate(value: string) {
    if (!value || value < today) {
      return;
    }

    setSelectedDate(value);
    setSelectedSlotId(null);
    setBookingError(null);
  }

  function handleConfirmBooking() {
    if (!selectedSlotId) {
      return;
    }

    const session = getSession();

    if (!session) {
      setBookingError(
        "Please log in before booking an appointment.",
      );
      return;
    }

    if (session.role !== "patient") {
      setBookingError(
        "Please use a patient account to book an appointment.",
      );
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    window.setTimeout(() => {
      const updatedSlots = bookSlot(
        doctorId,
        selectedSlotId,
      );

      if (!updatedSlots) {
        setBookingError(
          "Sorry, this slot was just booked or is no longer available. Please choose another slot.",
        );

        setSlots(getSlotsForDoctor(doctorId));
        setSelectedSlotId(null);
        setIsBooking(false);

        return;
      }

      const bookedSlot = updatedSlots.find(
        (slot) => slot.id === selectedSlotId,
      );

      if (!bookedSlot) {
        setBookingError(
          "Unable to complete the booking. Please try again.",
        );

        setIsBooking(false);
        return;
      }

      const bookingId = `bk-${Date.now()}`;

      addBooking({
        id: bookingId,
        doctorId,
        slotId: bookedSlot.id,
        patientId: session.id,
        patientName: session.name ?? "Guest Patient",
        date: bookedSlot.date,
        time: bookedSlot.time,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSlots(updatedSlots);
      setIsBooking(false);

      router.push(`/appointments/${bookingId}`);
    }, 500);
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div>
        <p className="text-lg font-semibold tracking-tight text-[var(--ink)]">
          Book appointment
        </p>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Choose any future date and select an available time.
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--canvas)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Selected date
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {formatSelectedDate(selectedDate)}
            </p>
          </div>

          <div>
            <label
              htmlFor="booking-date"
              className="mb-1.5 block text-xs font-semibold text-[var(--muted)]"
            >
              Choose a date
            </label>

            <input
              id="booking-date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(event) =>
                handleSelectDate(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] sm:w-52"
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-5 text-sm text-[var(--muted)]">
            Loading availability...
          </div>
        ) : slotsForDate.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 py-6 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">
              No slots configured
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              This doctor has not added availability for this date.
            </p>
          </div>
        ) : availableSlotsForDate.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 py-6 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">
              No slots available
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              All slots for this date are currently booked or unavailable.
              Choose another date.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <SlotGrid
              title="Morning"
              slots={morningSlots}
              selectedSlotId={selectedSlotId}
              onSelect={setSelectedSlotId}
            />

            <SlotGrid
              title="Evening"
              slots={eveningSlots}
              selectedSlotId={selectedSlotId}
              onSelect={setSelectedSlotId}
            />
          </div>
        )}
      </div>

      {bookingError && (
        <p
          className="mt-4 rounded-xl bg-[var(--urgent-soft)] px-3.5 py-2.5 text-sm font-medium leading-5 text-[var(--urgent-deep)]"
          role="alert"
        >
          {bookingError}
        </p>
      )}

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!selectedSlotId || isBooking}
        onClick={handleConfirmBooking}
      >
        {isBooking ? "Booking..." : "Book appointment"}
      </Button>
    </div>
  );
}