import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const KEY = "schedula:bookings";

type StoredBooking = Omit<
  Booking,
  | "patientId"
  | "consultationType"
  | "updatedAt"
  | "rescheduleCount"
  | "actionReason"
> & {
  patientId?: string;
  consultationType?: Booking["consultationType"];
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
  return {
    ...booking,
    patientId: booking.patientId ?? "",
    consultationType:
      booking.consultationType ?? "in-person",
    createdAt:
      booking.createdAt ??
      new Date().toISOString(),
    updatedAt: booking.updatedAt,
    rescheduleCount:
      booking.rescheduleCount ?? 0,
    actionReason: booking.actionReason,
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

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeBooking);
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
  id: string,
): Booking | null {
  return (
    readBookings().find(
      (booking) => booking.id === id,
    ) ?? null
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
): Booking {
  const bookings = readBookings();

  const normalizedBooking =
    normalizeBooking(booking);

  const existingIndex =
    bookings.findIndex(
      (item) =>
        item.id === normalizedBooking.id,
    );

  if (existingIndex >= 0) {
    bookings[existingIndex] =
      normalizedBooking;
  } else {
    bookings.push(normalizedBooking);
  }

  writeBookings(bookings);

  return normalizedBooking;
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  actionReason?: string,
): Booking | null {
  const bookings = readBookings();

  const index = bookings.findIndex(
    (booking) =>
      booking.id === bookingId,
  );

  if (index === -1) {
    return null;
  }

  const updatedBooking: Booking = {
    ...bookings[index],
    status,
    updatedAt:
      new Date().toISOString(),
    ...(actionReason !== undefined
      ? { actionReason }
      : {}),
  };

  bookings[index] = updatedBooking;

  writeBookings(bookings);

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
      | "consultationType"
    >
  >,
): Booking | null {
  const bookings = readBookings();

  const index = bookings.findIndex(
    (booking) =>
      booking.id === bookingId,
  );

  if (index === -1) {
    return null;
  }

  const updatedBooking: Booking = {
    ...bookings[index],
    ...updates,
    updatedAt:
      new Date().toISOString(),
  };

  bookings[index] = updatedBooking;

  writeBookings(bookings);

  return updatedBooking;
}

export function rescheduleBooking(
  bookingId: string,
  slotId: string,
  date: string,
  time: string,
): Booking | null {
  const booking =
    getBookingById(bookingId);

  if (!booking) {
    return null;
  }

  return updateBooking(bookingId, {
    slotId,
    date,
    time,
  });
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