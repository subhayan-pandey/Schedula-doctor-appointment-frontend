import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";
import type { Slot } from "@/types/slot";
import type { AppNotification, NotificationRecipientRole, NotificationType } from "@/types/notification";

const BOOKINGS_KEY = "schedula:bookings";
const DOCTORS_KEY = "schedula:doctors";
const NOTIFICATIONS_KEY = "schedula:notifications";
const SLOTS_KEY_PREFIX = "schedula:slots:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeBooking(value: Partial<Booking>): Booking | null {
  if (
    typeof value.id !== "string" ||
    typeof value.doctorId !== "string" ||
    typeof value.slotId !== "string" ||
    typeof value.patientName !== "string" ||
    typeof value.date !== "string" ||
    typeof value.time !== "string" ||
    typeof value.status !== "string"
  ) {
    return null;
  }

  return {
    ...value,
    id: value.id,
    doctorId: value.doctorId,
    slotId: value.slotId,
    patientId: value.patientId ?? "",
    patientName: value.patientName,
    date: value.date,
    time: value.time,
    status: value.status as Booking["status"],
    consultationType: value.consultationType ?? "in-person",
    createdAt: value.createdAt ?? new Date().toISOString(),
    updatedAt: value.updatedAt,
    rescheduleCount: value.rescheduleCount ?? 0,
    actionReason: value.actionReason,
  };
}

function isSlotStatus(value: unknown): value is Slot["status"] {
  return (
    value === "available" ||
    value === "booked" ||
    value === "unavailable"
  );
}

function isSlotPeriod(value: unknown): value is Slot["period"] {
  return value === "Morning" || value === "Evening";
}

function normalizeSlot(
  value: Partial<Slot>,
  doctorId: string,
): Slot | null {
  if (
    typeof value.id !== "string" ||
    typeof value.date !== "string" ||
    typeof value.time !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    doctorId,
    date: value.date,
    time: value.time,
    period: isSlotPeriod(value.period) ? value.period : "Morning",
    status: isSlotStatus(value.status) ? value.status : "available",
  };
}

function isNotificationType(value: unknown): value is NotificationType {
  return (
    value === "appointment" ||
    value === "confirmation" ||
    value === "cancellation" ||
    value === "reschedule" ||
    value === "declined" ||
    value === "missed" ||
    value === "prescription" ||
    value === "system"
  );
}

function isRecipientRole(
  value: unknown,
): value is NotificationRecipientRole {
  return value === "patient" || value === "doctor";
}

function normalizeNotification(
  value: Record<string, unknown>,
): AppNotification {
  return {
    id:
      typeof value.id === "string"
        ? value.id
        : `notification-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
    userId:
      typeof value.userId === "string"
        ? value.userId
        : "",
    recipientRole: isRecipientRole(value.recipientRole)
      ? value.recipientRole
      : "patient",
    title:
      typeof value.title === "string"
        ? value.title
        : "Notification",
    message:
      typeof value.message === "string"
        ? value.message
        : "",
    type: isNotificationType(value.type)
      ? value.type
      : "system",
    appointmentId:
      typeof value.appointmentId === "string"
        ? value.appointmentId
        : undefined,
    isRead: value.isRead === true,
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : new Date().toISOString(),
  };
}

function readJson(key: string): unknown {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence failure must not break the application state.
  }
}

export function loadPersistedBookings(): Booking[] {
  const parsed = readJson(BOOKINGS_KEY);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) =>
      item && typeof item === "object"
        ? normalizeBooking(item as Partial<Booking>)
        : null,
    )
    .filter((item): item is Booking => item !== null);
}

export function persistBookings(bookings: Booking[]): void {
  writeJson(BOOKINGS_KEY, bookings);
}

export function loadPersistedDoctors(
  seedDoctors: Doctor[],
): Doctor[] {
  const parsed = readJson(DOCTORS_KEY);

  if (Array.isArray(parsed)) {
    const doctors = parsed.filter(
      (item): item is Doctor =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as Doctor).id === "string" &&
            typeof (item as Doctor).name === "string",
        ),
    );

    if (doctors.length > 0) {
      return doctors;
    }
  }

  persistDoctors(seedDoctors);
  return seedDoctors;
}

export function persistDoctors(doctors: Doctor[]): void {
  writeJson(DOCTORS_KEY, doctors);
}

export function loadPersistedSlots(
  doctorId: string,
  seedSlots: Slot[],
): Slot[] {
  if (!doctorId) {
    return [];
  }

  const parsed = readJson(`${SLOTS_KEY_PREFIX}${doctorId}`);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) =>
        item && typeof item === "object"
          ? normalizeSlot(item as Partial<Slot>, doctorId)
          : null,
      )
      .filter((item): item is Slot => item !== null);
  }

  const normalizedSeedSlots = seedSlots
    .map((slot) => normalizeSlot(slot, doctorId))
    .filter((slot): slot is Slot => slot !== null);

  persistSlots(doctorId, normalizedSeedSlots);
  return normalizedSeedSlots;
}

export function persistSlots(
  doctorId: string,
  slots: Slot[],
): void {
  if (!doctorId) {
    return;
  }

  writeJson(`${SLOTS_KEY_PREFIX}${doctorId}`, slots);
}

export function loadPersistedNotifications(): AppNotification[] {
  const parsed = readJson(NOTIFICATIONS_KEY);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object"),
    )
    .map(normalizeNotification);
}

export function persistNotifications(
  notifications: AppNotification[],
): void {
  writeJson(NOTIFICATIONS_KEY, notifications);
}

export function getSlotsStoragePrefix(): string {
  return SLOTS_KEY_PREFIX;
}

export function getStorageKeys() {
  return {
    bookings: BOOKINGS_KEY,
    doctors: DOCTORS_KEY,
    notifications: NOTIFICATIONS_KEY,
  };
}
