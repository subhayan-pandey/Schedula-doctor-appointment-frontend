import type { Slot } from "@/types/slot";

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

  window.setTimeout(() => {
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
  }, 0);
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

  let raw: string | null =
    null;

  try {
    raw =
      window.localStorage.getItem(
        key,
      );
  } catch {
    return [];
  }

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
        return parsed
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
      }
    } catch {
      // Fall through to seed data.
    }
  }

  const seeded =
    buildSeedSlots(
      doctorId,
    );

  const normalizedSeeded =
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

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(
        normalizedSeeded,
      ),
    );
  } catch {
    // Keep the in-memory seed result usable.
  }

  return normalizedSeeded;
}

function writeSlots(
  doctorId: string,
  slots: Slot[],
): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.setItem(
      KEY_PREFIX +
        doctorId,
      JSON.stringify(
        slots,
      ),
    );
  } catch {
    return false;
  }

  emitSlotsUpdated(
    doctorId,
  );

  return true;
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

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return null;
  }

  return updated;
}

export function rescheduleSlot(
  doctorId: string,
  currentSlotId: string,
  newSlotId: string,
): Slot[] | null {
  if (
    !doctorId ||
    !currentSlotId ||
    !newSlotId ||
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

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return null;
  }

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
    date: slot.date,
    time: slot.time,
    period: slot.period,
    status: "available",
  };

  const updated: Slot[] = [
    ...slots,
    newSlot,
  ];

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return slots;
  }

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
        slot.id === slotId,
    );

  if (
    !target ||
    target.doctorId !==
      doctorId
  ) {
    return slots;
  }

  if (
    target.status ===
    "booked"
  ) {
    return slots;
  }

  const updated: Slot[] =
    slots.filter(
      (slot) =>
        slot.id !== slotId,
    );

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return slots;
  }

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
        slot.id === slotId,
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

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return slots;
  }

  return updated;
}

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
        slot.id === slotId,
    );

  if (
    !target ||
    target.doctorId !==
      doctorId
  ) {
    return slots;
  }

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

  if (
    !writeSlots(
      doctorId,
      updated,
    )
  ) {
    return slots;
  }

  return updated;
}