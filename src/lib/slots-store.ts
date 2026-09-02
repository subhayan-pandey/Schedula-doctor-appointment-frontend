import type { Slot } from "@/types/slot";
import { buildSeedSlots } from "@/lib/mock-data/slots";

const KEY_PREFIX = "schedula:slots:";

function isBrowser() {
  return typeof window !== "undefined";
}

function readSlots(doctorId: string): Slot[] {
  if (!isBrowser()) return [];
  const key = KEY_PREFIX + doctorId;
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as Slot[];
    } catch {
      // fall through and reseed if the stored value is corrupted
    }
  }
  const seeded = buildSeedSlots(doctorId);
  window.localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

function writeSlots(doctorId: string, slots: Slot[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY_PREFIX + doctorId, JSON.stringify(slots));
}

/** Read a doctor's current slot calendar (seeds it on first read). */
export function getSlotsForDoctor(doctorId: string): Slot[] {
  return readSlots(doctorId);
}

/**
 * Marks a slot as booked. Returns the updated list, or null if the slot
 * could not be booked (already taken, or someone booked it a moment ago).
 */
export function bookSlot(doctorId: string, slotId: string): Slot[] | null {
  const slots = readSlots(doctorId);
  const target = slots.find((slot) => slot.id === slotId);
  if (!target || target.status !== "available") {
    return null;
  }
  const updated = slots.map((slot) =>
    slot.id === slotId ? { ...slot, status: "booked" as const } : slot,
  );
  writeSlots(doctorId, updated);
  return updated;
}

/** Adds a new available slot to a doctor's calendar. */
export function createSlot(
  doctorId: string,
  slot: { date: string; time: string; period: Slot["period"] },
): Slot[] {
  const slots = readSlots(doctorId);
  const newSlot: Slot = {
    id: `${doctorId}-${slot.date}-${slot.period.toLowerCase()}-${Date.now()}`,
    doctorId,
    date: slot.date,
    time: slot.time,
    period: slot.period,
    status: "available",
  };
  const updated = [...slots, newSlot];
  writeSlots(doctorId, updated);
  return updated;
}

/**
 * Removes a slot entirely. Booked slots can't be removed this way — a
 * doctor shouldn't be able to silently delete a patient's appointment by
 * deleting the slot underneath it.
 */
export function removeSlot(doctorId: string, slotId: string): Slot[] {
  const slots = readSlots(doctorId);
  const target = slots.find((slot) => slot.id === slotId);
  if (target?.status === "booked") {
    return slots;
  }
  const updated = slots.filter((slot) => slot.id !== slotId);
  writeSlots(doctorId, updated);
  return updated;
}

/** Toggles a slot between "available" and "unavailable". Has no effect on booked slots. */
export function toggleSlotAvailability(doctorId: string, slotId: string): Slot[] {
  const slots = readSlots(doctorId);
  const updated = slots.map((slot) => {
    if (slot.id !== slotId || slot.status === "booked") return slot;
    return { ...slot, status: slot.status === "available" ? "unavailable" : "available" } as Slot;
  });
  writeSlots(doctorId, updated);
  return updated;
}