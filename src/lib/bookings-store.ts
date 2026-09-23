import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY =
  "schedula:bookings";

type StoredBooking =
  Omit<
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
  return (
    typeof window !==
    "undefined"
  );
}

function normalizeBooking(
  booking: StoredBooking,
): Booking {
  const createdAt =
    typeof booking.createdAt ===
    "string"
      ? booking.createdAt
      : new Date().toISOString();

  return {
    ...booking,

    patientId:
      booking.patientId ??
      "",

    createdAt,

    updatedAt:
      booking.updatedAt ??
      createdAt,

    rescheduleCount:
      typeof booking.rescheduleCount ===
      "number"
        ? booking.rescheduleCount
        : 0,

    actionReason:
      booking.actionReason,
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
      ) as unknown;

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item,
        ): item is StoredBooking =>
          Boolean(
            item &&
              typeof item ===
                "object",
          ),
      )
      .map(
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
    JSON.stringify(
      bookings,
    ),
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
): Booking {
  const bookings =
    readBookings();

  const existing =
    bookings.find(
      (item) =>
        item.id ===
        booking.id,
    );

  if (existing) {
    return existing;
  }

  const now =
    new Date().toISOString();

  const normalized: Booking =
    {
      ...booking,

      createdAt:
        booking.createdAt ||
        now,

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

  const existing =
    bookings.find(
      (booking) =>
        booking.id ===
        bookingId,
    );

  if (!existing) {
    return null;
  }

  const now =
    new Date().toISOString();

  const updatedBooking: Booking =
    {
      ...existing,

      status,

      updatedAt:
        now,

      actionReason:
        actionReason ??
        existing.actionReason,
    };

  const updated =
    bookings.map(
      (booking) =>
        booking.id ===
        bookingId
          ? updatedBooking
          : booking,
    );

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

  const existing =
    bookings.find(
      (booking) =>
        booking.id ===
        bookingId,
    );

  if (!existing) {
    return null;
  }

  const updatedBooking: Booking =
    {
      ...existing,

      ...updates,

      updatedAt:
        new Date().toISOString(),
    };

  const updated =
    bookings.map(
      (booking) =>
        booking.id ===
        bookingId
          ? updatedBooking
          : booking,
    );

  writeBookings(
    updated,
  );

  return updatedBooking;
}

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

  const existing =
    bookings.find(
      (booking) =>
        booking.id ===
        bookingId,
    );

  if (!existing) {
    return null;
  }

  if (
    existing.slotId ===
      updates.slotId &&
    existing.date ===
      updates.date &&
    existing.time ===
      updates.time
  ) {
    return existing;
  }

  const updatedBooking: Booking =
    {
      ...existing,

      slotId:
        updates.slotId,

      date:
        updates.date,

      time:
        updates.time,

      status:
        "upcoming",

      updatedAt:
        new Date().toISOString(),

      rescheduleCount:
        (existing.rescheduleCount ??
          0) + 1,

      actionReason:
        "Appointment rescheduled",
    };

  const updated =
    bookings.map(
      (booking) =>
        booking.id ===
        bookingId
          ? updatedBooking
          : booking,
    );

  writeBookings(
    updated,
  );

  return updatedBooking;
}

export function confirmBooking(
  bookingId: string,
): Booking | null {
  const booking =
    getBookingById(
      bookingId,
    );

  if (
    !booking ||
    booking.status !==
      "pending"
  ) {
    return null;
  }

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

  return (
    booking.status ===
      "pending" ||
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming"
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

  return (
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming"
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

  return (
    booking.status ===
      "pending" ||
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming"
  );
}