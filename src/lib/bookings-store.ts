import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY = "schedula:bookings";

type StoredBooking = Omit<
  Booking,
  "patientId"
> & {
  patientId?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeBooking(
  booking: StoredBooking,
): Booking {
  return {
    ...booking,
    patientId:
      booking.patientId ?? "",
  };
}

function readBookings(): Booking[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(KEY);

    if (!raw) {
      return [];
    }

    const bookings =
      JSON.parse(raw) as StoredBooking[];

    return bookings.map(
      normalizeBooking,
    );
  } catch {
    return [];
  }
}

function writeBookings(
  bookings: Booking[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(bookings),
  );

  window.dispatchEvent(
    new Event(
      "schedula:bookings-updated",
    ),
  );
}

export function getAllBookings(): Booking[] {
  return readBookings();
}

export function getBookingById(
  bookingId: string,
): Booking | undefined {
  return readBookings().find(
    (booking) =>
      booking.id === bookingId,
  );
}

export function getBookingsByPatientId(
  patientId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.patientId === patientId,
  );
}

export function getBookingsByDoctorId(
  doctorId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.doctorId === doctorId,
  );
}

export function addBooking(
  booking: Booking,
): void {
  const bookings =
    readBookings();

  writeBookings([
    ...bookings,
    booking,
  ]);
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Booking[] {
  const updated =
    readBookings().map(
      (booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
            }
          : booking,
    );

  writeBookings(updated);

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
  const updated =
    readBookings().map(
      (booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              ...updates,
            }
          : booking,
    );

  writeBookings(updated);

  return updated;
}