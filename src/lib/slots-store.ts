import type {
  Slot,
} from "@/types/slot";

import {
  buildSeedSlots,
} from "@/lib/mock-data/slots";

const KEY_PREFIX =
  "schedula:slots:";

function isBrowser(): boolean {
  return (
    typeof window !==
    "undefined"
  );
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

function isSlotStatus(
  value: unknown,
): value is Slot["status"] {
  return (
    value === "available" ||
    value === "booked" ||
    value === "unavailable"
  );
}

function isSlotPeriod(
  value: unknown,
): value is Slot["period"] {
  return (
    value === "Morning" ||
    value === "Evening"
  );
}

function normalizeSlot(
  slot: Partial<Slot>,
  doctorId: string,
): Slot | null {
  if (
    typeof slot.id !==
      "string" ||
    typeof slot.date !==
      "string" ||
    typeof slot.time !==
      "string"
  ) {
    return null;
  }

  const status: Slot["status"] =
    isSlotStatus(
      slot.status,
    )
      ? slot.status
      : "available";

  const period: Slot["period"] =
    isSlotPeriod(
      slot.period,
    )
      ? slot.period
      : "Morning";

  return {
    id: slot.id,
    doctorId,
    date: slot.date,
    time: slot.time,
    period,
    status,
  };
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
      const parsed =
        JSON.parse(
          raw,
        ) as unknown;

      if (
        Array.isArray(
          parsed,
        )
      ) {
        const normalized: Slot[] =
          parsed
            .map(
              (slot) =>
                normalizeSlot(
                  slot as Partial<Slot>,
                  doctorId,
                ),
            )
            .filter(
              (
                slot,
              ): slot is Slot =>
                slot !== null,
            );

        return normalized;
      }
    } catch {
      /*
       * If localStorage contains
       * invalid JSON, fall through
       * and rebuild the seed data.
       */
    }
  }

  const seeded =
    buildSeedSlots(
      doctorId,
    );

  const normalizedSeeded: Slot[] =
    seeded
      .map(
        (slot) =>
          normalizeSlot(
            slot,
            doctorId,
          ),
      )
      .filter(
        (
          slot,
        ): slot is Slot =>
          slot !== null,
      );

  window.localStorage.setItem(
    key,
    JSON.stringify(
      normalizedSeeded,
    ),
  );

  return normalizedSeeded;
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

export function getSlotsForDoctor(
  doctorId: string,
): Slot[] {
  if (!doctorId) {
    return [];
  }

  return readSlots(
    doctorId,
  );
}

export function bookSlot(
  doctorId: string,
  slotId: string,
): Slot[] | null {
  if (
    !doctorId ||
    !slotId
  ) {
    return null;
  }

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

  const updated: Slot[] =
    slots.map(
      (slot): Slot =>
        slot.id === slotId
          ? {
              ...slot,
              status:
                "booked",
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
 * Atomically changes:
 *
 * current slot:
 *   booked -> available
 *
 * new slot:
 *   available -> booked
 *
 * The current slot must still be
 * booked and the destination slot
 * must still be available.
 */
export function rescheduleSlot(
  doctorId: string,
  currentSlotId: string,
  newSlotId: string,
): Slot[] | null {
  if (
    !doctorId ||
    !currentSlotId ||
    !newSlotId
  ) {
    return null;
  }

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

  const updated: Slot[] =
    slots.map(
      (slot): Slot => {
        if (
          slot.id ===
          currentSlotId
        ) {
          return {
            ...slot,
            status:
              "available",
          };
        }

        if (
          slot.id ===
          newSlotId
        ) {
          return {
            ...slot,
            status:
              "booked",
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

export function createSlot(
  doctorId: string,
  slot: {
    date: string;
    time: string;
    period: Slot["period"];
  },
): Slot[] {
  if (
    !doctorId ||
    !slot.date ||
    !slot.time
  ) {
    return getSlotsForDoctor(
      doctorId,
    );
  }

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

  if (duplicate) {
    return slots;
  }

  const newSlot: Slot = {
    id: `${doctorId}-${slot.date}-${slot.period.toLowerCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

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

  const updated: Slot[] = [
    ...slots,
    newSlot,
  ];

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}

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
    !target ||
    target.doctorId !==
      doctorId
  ) {
    return slots;
  }

  /*
   * Never remove a slot that
   * currently belongs to a booking.
   */
  if (
    target.status ===
    "booked"
  ) {
    return slots;
  }

  const updated: Slot[] =
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

export function toggleSlotAvailability(
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
      doctorId ||
    target.status ===
      "booked"
  ) {
    return slots;
  }

  const nextStatus: Slot["status"] =
    target.status ===
    "available"
      ? "unavailable"
      : "available";

  const updated: Slot[] =
    slots.map(
      (slot): Slot =>
        slot.id === slotId
          ? {
              ...slot,
              status:
                nextStatus,
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
 * Releases a booked slot.
 *
 * This is used when:
 * - a patient cancels
 * - a doctor cancels
 * - a doctor declines a pending
 *   appointment
 * - a reschedule operation needs
 *   to restore a previous slot
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
   * Only release an actually
   * booked slot.
   */
  if (
    target.status !==
    "booked"
  ) {
    return slots;
  }

  const updated: Slot[] =
    slots.map(
      (slot): Slot =>
        slot.id === slotId
          ? {
              ...slot,
              status:
                "available",
            }
          : slot,
    );

  writeSlots(
    doctorId,
    updated,
  );

  return updated;
}