import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY = "schedula:bookings";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAllBookings(): Booking[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(KEY);

    return raw
      ? (JSON.parse(raw) as Booking[])
      : [];
  } catch {
    return [];
  }
}

export function getBookingById(
  bookingId: string,
): Booking | undefined {
  return getAllBookings().find(
    (booking) => booking.id === bookingId,
  );
}

export function addBooking(
  booking: Booking,
): void {
  if (!isBrowser()) {
    return;
  }

  const bookings = getAllBookings();

  window.localStorage.setItem(
    KEY,
    JSON.stringify([...bookings, booking]),
  );
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Booking[] {
  const bookings = getAllBookings();

  const updated = bookings.map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          status,
        }
      : booking,
  );

  if (isBrowser()) {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(updated),
    );
  }

  return updated;
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
    >
  >,
): Booking[] {
  const bookings = getAllBookings();

  const updated = bookings.map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          ...updates,
        }
      : booking,
  );

  if (isBrowser()) {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(updated),
    );
  }

  return updated;
}