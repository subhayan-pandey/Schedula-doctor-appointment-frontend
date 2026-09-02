import type { Booking } from "@/types/booking";

const KEY = "schedula:bookings";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAllBookings(): Booking[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function getBookingById(bookingId: string): Booking | undefined {
  return getAllBookings().find((booking) => booking.id === bookingId);
}

export function addBooking(booking: Booking): void {
  if (!isBrowser()) return;
  const bookings = getAllBookings();
  window.localStorage.setItem(KEY, JSON.stringify([...bookings, booking]));
}

/** Updates a booking's status (e.g. marking a visit completed or cancelled). */
export function updateBookingStatus(bookingId: string, status: Booking["status"]): Booking[] {
  const bookings = getAllBookings();
  const updated = bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status } : booking,
  );
  if (isBrowser()) {
    window.localStorage.setItem(KEY, JSON.stringify(updated));
  }
  return updated;
}