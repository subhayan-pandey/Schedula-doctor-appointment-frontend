import type { Slot } from "@/types/slot";

import {
  buildSeedSlots,
} from "@/lib/mock-data/slots";

import {
  store,
} from "@/store";

import {
  bookDoctorSlot,
  createDoctorSlot,
  initializeDoctorSlots,
  releaseDoctorSlot,
  removeDoctorSlot,
  rescheduleDoctorSlot,
  setDoctorSlots,
  toggleDoctorSlotAvailability,
} from "@/store/slices/slotsSlice";

import {
  loadPersistedSlots,
} from "@/store/persistence";

function ensureHydrated(
  doctorId: string,
): void {
  if (!doctorId) {
    return;
  }

  const state =
    store.getState().slots;

  if (
    state.initializedDoctors.includes(
      doctorId,
    )
  ) {
    return;
  }

  store.dispatch(
    initializeDoctorSlots({
      doctorId,
      slots: loadPersistedSlots(
        doctorId,
        buildSeedSlots(doctorId),
      ),
    }),
  );
}

export function getSlotsForDoctor(
  doctorId: string,
): Slot[] {
  ensureHydrated(doctorId);

  return (
    store.getState().slots
      .slotsByDoctor[doctorId] ?? []
  );
}

/**
 * Compatibility facade.
 *
 * Slot runtime state is owned by Redux. Existing
 * callers may keep using these functions, but every
 * mutation is routed through the slots slice.
 */
export function bookSlot(
  doctorId: string,
  slotId: string,
): Slot[] | null {
  ensureHydrated(doctorId);

  store.dispatch(
    bookDoctorSlot({
      doctorId,
      slotId,
    }),
  );

  return getSlotsForDoctor(doctorId);
}

export function rescheduleSlot(
  doctorId: string,
  currentSlotId: string,
  newSlotId: string,
): Slot[] | null {
  ensureHydrated(doctorId);

  store.dispatch(
    rescheduleDoctorSlot({
      doctorId,
      currentSlotId,
      newSlotId,
    }),
  );

  return getSlotsForDoctor(doctorId);
}

export function createSlot(
  doctorId: string,
  slot: {
    date: string;
    time: string;
    period: Slot["period"];
  },
): Slot[] {
  ensureHydrated(doctorId);

  store.dispatch(
    createDoctorSlot({
      doctorId,
      slot,
    }),
  );

  return getSlotsForDoctor(doctorId);
}

export function removeSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  ensureHydrated(doctorId);

  store.dispatch(
    removeDoctorSlot({
      doctorId,
      slotId,
    }),
  );

  return getSlotsForDoctor(doctorId);
}

export function toggleSlotAvailability(
  doctorId: string,
  slotId: string,
): Slot[] {
  ensureHydrated(doctorId);

  store.dispatch(
    toggleDoctorSlotAvailability({
      doctorId,
      slotId,
    }),
  );

  return getSlotsForDoctor(doctorId);
}

export function releaseSlot(
  doctorId: string,
  slotId: string,
): Slot[] {
  ensureHydrated(doctorId);

  store.dispatch(
    releaseDoctorSlot({
      doctorId,
      slotId,
    }),
  );

  return getSlotsForDoctor(doctorId);
}
