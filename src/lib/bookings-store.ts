import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY = "schedula:bookings";

type StoredBooking = Omit<
  Booking,
  | "patientId"
  | "updatedAt"
  | "rescheduleCount"
  | "actionReason"
> & {
  patientId?: string;
  updatedAt?: string;
  rescheduleCount?: number;
  actionReason?: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeBooking(
  booking: StoredBooking,
): Booking {
  const createdAt =
    booking.createdAt ||
    new Date().toISOString();

  return {
    ...booking,

    patientId:
      booking.patientId ?? "",

    createdAt,

    updatedAt:
      booking.updatedAt ??
      createdAt,

    rescheduleCount:
      booking.rescheduleCount ?? 0,
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

    const parsed =
      JSON.parse(
        raw,
      ) as StoredBooking[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
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

  /*
   * Same-tab synchronization.
   */
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
): Booking {
  const bookings =
    readBookings();

  const existing =
    bookings.find(
      (item) =>
        item.id === booking.id,
    );

  if (existing) {
    return existing;
  }

  const now =
    new Date().toISOString();

  const normalized: Booking = {
    ...booking,

    createdAt:
      booking.createdAt || now,

    updatedAt:
      booking.updatedAt ||
      booking.createdAt ||
      now,

    rescheduleCount:
      booking.rescheduleCount ??
      0,
  };

  writeBookings([
    ...bookings,
    normalized,
  ]);

  return normalized;
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  actionReason?: string,
): Booking | null {
  const bookings =
    readBookings();

  const now =
    new Date().toISOString();

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

          status,

          updatedAt:
            now,

          actionReason:
            actionReason ??
            booking.actionReason,
        };

        return updatedBooking;
      },
    );

  if (!updatedBooking) {
    return null;
  }

  writeBookings(
    updated,
  );

  return updatedBooking;
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
    >
  >,
): Booking | null {
  const bookings =
    readBookings();

  const now =
    new Date().toISOString();

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

          ...updates,

          updatedAt:
            now,
        };

        return updatedBooking;
      },
    );

  if (!updatedBooking) {
    return null;
  }

  writeBookings(
    updated,
  );

  return updatedBooking;
}

/**
 * Increments the reschedule counter
 * and records the new appointment data.
 *
 * Slot ownership is handled by slots-store.
 */
export function rescheduleBooking(
  bookingId: string,
  updates: Pick<
    Booking,
    | "slotId"
    | "date"
    | "time"
  >,
): Booking | null {
  const bookings =
    readBookings();

  const now =
    new Date().toISOString();

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

          /*
           * A successfully rescheduled
           * appointment remains upcoming.
           */
          status:
            "upcoming",

          updatedAt:
            now,

          rescheduleCount:
            (booking.rescheduleCount ??
              0) + 1,

          actionReason:
            "Appointment rescheduled",
        };

        return updatedBooking;
      },
    );

  if (!updatedBooking) {
    return null;
  }

  writeBookings(
    updated,
  );

  return updatedBooking;
}

/**
 * Doctor confirmation moves the
 * appointment directly to upcoming.
 *
 * The appointment therefore appears
 * in the upcoming section for both
 * doctor and patient.
 */
export function confirmBooking(
  bookingId: string,
): Booking | null {
  return updateBookingStatus(
    bookingId,
    "upcoming",
    "Appointment confirmed by doctor",
  );
}

export function canCancelBooking(
  booking:
    | Booking
    | null
    | undefined,
): boolean {
  if (!booking) {
    return false;
  }

  return [
    "pending",
    "confirmed",
    "upcoming",
  ].includes(
    booking.status,
  );
}

export function canRescheduleBooking(
  booking:
    | Booking
    | null
    | undefined,
): boolean {
  if (!booking) {
    return false;
  }

  return [
    "confirmed",
    "upcoming",
  ].includes(
    booking.status,
  );
}

export function canCompleteBooking(
  booking:
    | Booking
    | null
    | undefined,
): boolean {
  return (
    booking?.status ===
    "upcoming"
  );
}

export function canMarkMissed(
  booking:
    | Booking
    | null
    | undefined,
): boolean {
  if (!booking) {
    return false;
  }

  return [
    "pending",
    "confirmed",
    "upcoming",
  ].includes(
    booking.status,
  );
}