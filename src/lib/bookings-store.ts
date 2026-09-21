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

/**
 * Returns every booking stored
 * in the application.
 */
export function getAllBookings(): Booking[] {
  return readBookings();
}

/**
 * Returns a single booking.
 */
export function getBookingById(
  bookingId: string,
): Booking | undefined {
  return readBookings().find(
    (booking) =>
      booking.id ===
      bookingId,
  );
}

/**
 * Returns all bookings belonging
 * to a patient.
 */
export function getBookingsByPatientId(
  patientId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.patientId ===
      patientId,
  );
}

/**
 * Returns all bookings belonging
 * to a doctor.
 */
export function getBookingsByDoctorId(
  doctorId: string,
): Booking[] {
  return readBookings().filter(
    (booking) =>
      booking.doctorId ===
      doctorId,
  );
}

/**
 * Adds a new booking.
 */
export function addBooking(
  booking: Booking,
): void {
  const bookings =
    readBookings();

  /*
   * Prevent accidental duplicate
   * booking IDs.
   */
  const alreadyExists =
    bookings.some(
      (existing) =>
        existing.id ===
        booking.id,
    );

  if (
    alreadyExists
  ) {
    return;
  }

  writeBookings([
    ...bookings,
    booking,
  ]);
}

/**
 * Updates only the status of
 * an existing booking.
 *
 * Returns the complete updated
 * booking collection so callers
 * can immediately refresh their
 * local state.
 */
export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Booking[] {
  const bookings =
    readBookings();

  const updated =
    bookings.map(
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

/**
 * Updates appointment fields.
 *
 * Intended for ordinary booking
 * updates where the caller does
 * not need a dedicated reschedule
 * transaction.
 */
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
  const bookings =
    readBookings();

  const updated =
    bookings.map(
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
 * Reschedules an existing
 * appointment.
 *
 * The appointment's related
 * fields are updated together:
 *
 * - slotId
 * - date
 * - time
 * - status
 *
 * No second booking is created.
 *
 * Returns:
 * - updated Booking when found
 * - null when the booking no
 *   longer exists
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