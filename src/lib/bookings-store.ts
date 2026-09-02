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