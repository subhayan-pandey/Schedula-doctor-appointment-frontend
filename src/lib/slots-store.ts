import type { Slot } from "@/types/slot";
import { buildSeedSlots } from "@/lib/mock-data/slots";

const KEY_PREFIX = "schedula:slots:";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitSlotsUpdated(
  doctorId: string,
): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "schedula:slots-updated",
      {
        detail: {
          doctorId,
        },
      },
    ),
  );
}

function readSlots(
  doctorId: string,
): Slot[] {
  if (!isBrowser()) {
    return [];
  }

  const key =
    KEY_PREFIX + doctorId;

  const raw =
    window.localStorage.getItem(
      key,
    );

  if (raw) {
    try {
      return JSON.parse(raw) as Slot[];
    } catch {
      // Fall through and reseed if
      // the stored value is corrupted.
    }
  }

  const seeded =
    buildSeedSlots(doctorId);

  window.localStorage.setItem(
    key,
    JSON.stringify(seeded),
  );

  return seeded;
}

function writeSlots(
  doctorId: string,
  slots: Slot[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY_PREFIX + doctorId,
    JSON.stringify(slots),
  );

  emitSlotsUpdated(
    doctorId,
  );
}

/**
 * Reads the doctor's current
 * slot calendar.
 *
 * The calendar is seeded on
 * first access.
 */
export function getSlotsForDoctor(
  doctorId: string,
): Slot[] {
  return readSlots(doctorId);
}

/**
 * Marks an available slot as
 * booked.
 *
 * Returns null when:
 * - the slot does not exist
 * - the slot belongs to another
 *   doctor
 * - the slot is not available
 */
export function bookSlot(
  doctorId: string,
  slotId: string,
): Slot[] | null {
  const slots =
    readSlots(doctorId);

  const target =
    slots.find(
      (slot) =>
        slot.id === slotId,
    );

  if (
    !target ||
    target.doctorId !==
      doctorId ||
    target.status !==
      "available"
  ) {
    return null;
  }

  const updated =
    slots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            status:
              "booked" as const,
          }
        : slot,
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Reserves a new available slot
 * and releases the currently
 * booked slot in the same
 * localStorage write.
 *
 * This operation is intended
 * for rescheduling an existing
 * upcoming appointment.
 *
 * Returns null when:
 * - the current slot does not
 *   exist
 * - the current slot is not
 *   booked
 * - the new slot does not exist
 * - the new slot is not available
 * - either slot belongs to
 *   another doctor
 * - both slot IDs are identical
 */
export function rescheduleSlot(
  doctorId: string,
  currentSlotId: string,
  newSlotId: string,
): Slot[] | null {
  if (
    currentSlotId ===
    newSlotId
  ) {
    return null;
  }

  const slots =
    readSlots(doctorId);

  const currentSlot =
    slots.find(
      (slot) =>
        slot.id ===
        currentSlotId,
    );

  const newSlot =
    slots.find(
      (slot) =>
        slot.id ===
        newSlotId,
    );

  if (
    !currentSlot ||
    !newSlot
  ) {
    return null;
  }

  if (
    currentSlot.doctorId !==
      doctorId ||
    newSlot.doctorId !==
      doctorId
  ) {
    return null;
  }

  if (
    currentSlot.status !==
    "booked"
  ) {
    return null;
  }

  if (
    newSlot.status !==
    "available"
  ) {
    return null;
  }

  const updated =
    slots.map((slot) => {
      if (
        slot.id ===
        currentSlotId
      ) {
        return {
          ...slot,
          status:
            "available" as const,
        };
      }

      if (
        slot.id ===
        newSlotId
      ) {
        return {
          ...slot,
          status:
            "booked" as const,
        };
      }

      return slot;
    });

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Adds a new available slot
 * to the doctor's calendar.
 */
export function createSlot(
  doctorId: string,
  slot: {
    date: string;
    time: string;
    period: Slot["period"];
  },
): Slot[] {
  const slots =
    readSlots(doctorId);

  const newSlot: Slot = {
    id: `${doctorId}-${slot.date}-${slot.period.toLowerCase()}-${Date.now()}`,
    doctorId,
    date: slot.date,
    time: slot.time,
    period: slot.period,
    status: "available",
  };

  const updated = [
    ...slots,
    newSlot,
  ];

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Removes a slot entirely.
 *
 * Booked slots cannot be
 * removed because they belong
 * to appointments.
 */
export function removeSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(doctorId);

  const target =
    slots.find(
      (slot) =>
        slot.id === slotId,
    );

  if (
    target?.status ===
    "booked"
  ) {
    return slots;
  }

  const updated =
    slots.filter(
      (slot) =>
        slot.id !== slotId,
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Toggles an available /
 * unavailable slot.
 *
 * Booked slots remain
 * untouched.
 */
export function toggleSlotAvailability(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(doctorId);

  const updated =
    slots.map((slot) => {
      if (
        slot.id !== slotId ||
        slot.status ===
          "booked"
      ) {
        return slot;
      }

      return {
        ...slot,
        status:
          slot.status ===
          "available"
            ? "unavailable"
            : "available",
      } as Slot;
    });

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Releases a booked slot
 * back to available.
 *
 * Used when an appointment
 * is cancelled or moved
 * outside the dedicated
 * rescheduling transaction.
 */
export function releaseSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(doctorId);

  const updated =
    slots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            status:
              "available" as const,
          }
        : slot,
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}