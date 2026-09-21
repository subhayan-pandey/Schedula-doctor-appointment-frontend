import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY =
  "schedula:bookings";

type StoredBooking = Omit<
  Booking,
  "patientId"
> & {
  patientId?: string;
};

function isBrowser() {
  return typeof window !==
    "undefined";
}

function normalizeBooking(
  booking: StoredBooking,
): Booking {
  return {
    ...booking,
    patientId:
      booking.patientId ??
      "",
  };
}

function readBookings(): Booking[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        KEY,
      );

    if (!raw) {
      return [];
    }

    const bookings =
      JSON.parse(
        raw,
      ) as StoredBooking[];

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
      booking.id ===
      bookingId,
  );
}

export function getBookingsByPatientId(
  patientId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.patientId ===
      patientId,
  );
}

export function getBookingsByDoctorId(
  doctorId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.doctorId ===
      doctorId,
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
        booking.id ===
        bookingId
          ? {
              ...booking,
              status,
            }
          : booking,
    );

  writeBookings(
    updated,
  );

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
        booking.id ===
        bookingId
          ? {
              ...booking,
              ...updates,
            }
          : booking,
    );

  writeBookings(
    updated,
  );

  return updated;
}

/**
 * Updates an existing appointment
 * with its new slot information.
 *
 * All appointment fields related
 * to the reschedule are written
 * together:
 *
 * - slotId
 * - date
 * - time
 * - status
 *
 * No second booking is created.
 *
 * Returns the updated booking,
 * or null if the appointment
 * no longer exists.
 */
export function rescheduleBooking(
  bookingId: string,
  updates: Pick<
    Booking,
    | "slotId"
    | "date"
    | "time"
    | "status"
  >,
): Booking | null {
  const bookings =
    readBookings();

  let updatedBooking:
    | Booking
    | null = null;

  const updated =
    bookings.map(
      (booking) => {
        if (
          booking.id !==
          bookingId
        ) {
          return booking;
        }

        updatedBooking = {
          ...booking,
          slotId:
            updates.slotId,
          date:
            updates.date,
          time:
            updates.time,
          status:
            updates.status,
        };

        return updatedBooking;
      },
    );

  if (
    !updatedBooking
  ) {
    return null;
  }

  writeBookings(
    updated,
  );

  return updatedBooking;
}