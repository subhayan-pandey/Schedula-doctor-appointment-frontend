import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

import {
  store,
} from "@/store";

import {
  addAppointment,
  setAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "@/store/slices/appointmentsSlice";

import {
  loadPersistedBookings,
} from "@/store/persistence";

function ensureHydrated(): void {
  if (!store.getState().appointments.initialized) {
    store.dispatch(
      setAppointments(
        loadPersistedBookings(),
      ),
    );
  }
}

export function getAllBookings(): Booking[] {
  ensureHydrated();
  return store.getState().appointments.appointments;
}

export function getBookingById(
  id: string,
): Booking | null {
  return (
    getAllBookings().find(
      (booking) => booking.id === id,
    ) ?? null
  );
}

export function getBookingsByPatientId(
  patientId: string,
): Booking[] {
  return getAllBookings().filter(
    (booking) => booking.patientId === patientId,
  );
}

export function getBookingsByDoctorId(
  doctorId: string,
): Booking[] {
  return getAllBookings().filter(
    (booking) => booking.doctorId === doctorId,
  );
}

/**
 * Compatibility facade.
 *
 * Runtime appointment state is owned by Redux.
 * These functions are retained only so existing
 * feature code continues to compile while all
 * mutations are routed through the Redux slice.
 */
export function addBooking(
  booking: Booking,
): Booking {
  ensureHydrated();

  store.dispatch(addAppointment(booking));
  return (
    getBookingById(booking.id) ?? booking
  );
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  actionReason?: string,
): Booking | null {
  ensureHydrated();

  store.dispatch(
    updateAppointmentStatus({
      bookingId,
      status,
      actionReason,
    }),
  );

  return getBookingById(bookingId);
}

export function updateBooking(
  bookingId: string,
  updates: Partial<
    Pick<
      Booking,
      | "slotId"
      | "date"
      | "time"
      | "status"
      | "actionReason"
      | "consultationType"
    >
  >,
): Booking | null {
  ensureHydrated();

  store.dispatch(
    updateAppointment({
      bookingId,
      updates,
    }),
  );

  return getBookingById(bookingId);
}

export function rescheduleBooking(
  bookingId: string,
  slotId: string,
  date: string,
  time: string,
): Booking | null {
  return updateBooking(
    bookingId,
    {
      slotId,
      date,
      time,
    },
  );
}

export function confirmBooking(
  bookingId: string,
): Booking | null {
  return updateBookingStatus(
    bookingId,
    "confirmed",
  );
}

export function canCancelBooking(
  booking: Booking,
): boolean {
  return ![
    "completed",
    "cancelled",
    "declined",
    "missed",
  ].includes(booking.status);
}

export function canRescheduleBooking(
  booking: Booking,
): boolean {
  return ![
    "completed",
    "cancelled",
    "declined",
    "missed",
  ].includes(booking.status);
}

export function canCompleteBooking(
  booking: Booking,
): boolean {
  return [
    "confirmed",
    "upcoming",
  ].includes(booking.status);
}

export function canMarkMissed(
  booking: Booking,
): boolean {
  return [
    "confirmed",
    "upcoming",
  ].includes(booking.status);
}
