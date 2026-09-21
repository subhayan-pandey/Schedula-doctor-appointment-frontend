import type {
  Slot,
} from "@/types/slot";

import {
  buildSeedSlots,
} from "@/lib/mock-data/slots";

const KEY_PREFIX =
  "schedula:slots:";

function isBrowser() {
  return typeof window !==
    "undefined";
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
    KEY_PREFIX +
    doctorId;

  const raw =
    window.localStorage.getItem(
      key,
    );

  if (raw) {
    try {
      return JSON.parse(
        raw,
      ) as Slot[];
    } catch {
      /*
       * Fall through and reseed
       * corrupted storage.
       */
    }
  }

  const seeded =
    buildSeedSlots(
      doctorId,
    );

  window.localStorage.setItem(
    key,
    JSON.stringify(
      seeded,
    ),
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
    KEY_PREFIX +
      doctorId,
    JSON.stringify(
      slots,
    ),
  );

  emitSlotsUpdated(
    doctorId,
  );
}

/**
 * Returns the doctor's current
 * slot calendar.
 */
export function getSlotsForDoctor(
  doctorId: string,
): Slot[] {
  return readSlots(
    doctorId,
  );
}

/**
 * Books an available slot.
 *
 * Returns null when:
 * - slot does not exist
 * - slot belongs to another
 *   doctor
 * - slot is not available
 */
export function bookSlot(
  doctorId: string,
  slotId: string,
): Slot[] | null {
  const slots =
    readSlots(
      doctorId,
    );

  const target =
    slots.find(
      (slot) =>
        slot.id ===
        slotId,
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
    slots.map(
      (slot) =>
        slot.id ===
        slotId
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
 * Atomically swaps an existing
 * booked slot with a new
 * available slot.
 *
 * Used for rescheduling an
 * upcoming appointment.
 *
 * old slot:
 *     booked → available
 *
 * new slot:
 *     available → booked
 *
 * Both changes are persisted
 * through one localStorage write.
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
    readSlots(
      doctorId,
    );

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

  /*
   * The appointment being
   * rescheduled must still own
   * its original booked slot.
   */
  if (
    currentSlot.status !==
    "booked"
  ) {
    return null;
  }

  /*
   * The destination must be
   * genuinely available.
   */
  if (
    newSlot.status !==
    "available"
  ) {
    return null;
  }

  const updated =
    slots.map(
      (slot) => {
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
      },
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Creates a new available
 * appointment slot.
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
    readSlots(
      doctorId,
    );

  const duplicate =
    slots.some(
      (existing) =>
        existing.date ===
          slot.date &&
        existing.time ===
          slot.time,
    );

  /*
   * Do not create two identical
   * availability slots.
   */
  if (duplicate) {
    return slots;
  }

  const newSlot: Slot = {
    id: `${doctorId}-${slot.date}-${slot.period.toLowerCase()}-${Date.now()}`,

    doctorId,

    date:
      slot.date,

    time:
      slot.time,

    period:
      slot.period,

    status:
      "available",
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
 * Removes an available or
 * unavailable slot.
 *
 * Booked slots are protected.
 */
export function removeSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(
      doctorId,
    );

  const target =
    slots.find(
      (slot) =>
        slot.id ===
        slotId,
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
        slot.id !==
        slotId,
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Toggles availability.
 *
 * Booked slots cannot be
 * toggled because they belong
 * to active appointment records.
 */
export function toggleSlotAvailability(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(
      doctorId,
    );

  const updated =
    slots.map(
      (slot) => {
        if (
          slot.id !==
            slotId ||
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
      },
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

/**
 * Releases a booked slot.
 *
 * Important:
 * only a currently booked
 * slot is released.
 *
 * This prevents a stale
 * cancelled/declined booking
 * from accidentally changing a
 * slot that is already available
 * or has been reused.
 */
export function releaseSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  const slots =
    readSlots(
      doctorId,
    );

  const target =
    slots.find(
      (slot) =>
        slot.id ===
        slotId,
    );

  if (
    !target ||
    target.doctorId !==
      doctorId
  ) {
    return slots;
  }

  /*
   * Already available or
   * unavailable means there is
   * nothing to release.
   */
  if (
    target.status !==
    "booked"
  ) {
    return slots;
  }

  const updated =
    slots.map(
      (slot) =>
        slot.id ===
        slotId
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