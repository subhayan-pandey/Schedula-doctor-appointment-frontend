import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { Slot } from "@/types/slot";

type SlotsState = {
  slotsByDoctor: Record<string, Slot[]>;
  initializedDoctors: string[];
};

const initialState: SlotsState = {
  slotsByDoctor: {},
  initializedDoctors: [],
};

const slotsSlice = createSlice({
  name: "slots",
  initialState,
  reducers: {
    initializeDoctorSlots(
      state,
      action: PayloadAction<{
        doctorId: string;
        slots: Slot[];
      }>,
    ) {
      const { doctorId, slots } = action.payload;

      if (!doctorId) {
        return;
      }

      state.slotsByDoctor[doctorId] = slots;

      if (!state.initializedDoctors.includes(doctorId)) {
        state.initializedDoctors.push(doctorId);
      }
    },

    setDoctorSlots(
      state,
      action: PayloadAction<{
        doctorId: string;
        slots: Slot[];
      }>,
    ) {
      const { doctorId, slots } = action.payload;

      if (!doctorId) {
        return;
      }

      state.slotsByDoctor[doctorId] = slots;

      if (!state.initializedDoctors.includes(doctorId)) {
        state.initializedDoctors.push(doctorId);
      }
    },

    bookDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const { doctorId, slotId } = action.payload;
      const slots = state.slotsByDoctor[doctorId];

      if (!slots) {
        return;
      }

      const target = slots.find(
        (slot) => slot.id === slotId,
      );

      if (!target || target.status !== "available") {
        return;
      }

      state.slotsByDoctor[doctorId] = slots.map(
        (slot): Slot =>
          slot.id === slotId
            ? { ...slot, status: "booked" }
            : slot,
      );
    },

    rescheduleDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        currentSlotId: string;
        newSlotId: string;
      }>,
    ) {
      const {
        doctorId,
        currentSlotId,
        newSlotId,
      } = action.payload;

      if (currentSlotId === newSlotId) {
        return;
      }

      const slots = state.slotsByDoctor[doctorId];

      if (!slots) {
        return;
      }

      const currentSlot = slots.find(
        (slot) => slot.id === currentSlotId,
      );
      const newSlot = slots.find(
        (slot) => slot.id === newSlotId,
      );

      if (
        !currentSlot ||
        !newSlot ||
        currentSlot.status !== "booked" ||
        newSlot.status !== "available"
      ) {
        return;
      }

      state.slotsByDoctor[doctorId] = slots.map(
        (slot): Slot => {
          if (slot.id === currentSlotId) {
            return { ...slot, status: "available" };
          }

          if (slot.id === newSlotId) {
            return { ...slot, status: "booked" };
          }

          return slot;
        },
      );
    },

    releaseDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const { doctorId, slotId } = action.payload;
      const slots = state.slotsByDoctor[doctorId];

      if (!slots) {
        return;
      }

      state.slotsByDoctor[doctorId] = slots.map(
        (slot): Slot =>
          slot.id === slotId && slot.status === "booked"
            ? { ...slot, status: "available" }
            : slot,
      );
    },

    createDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slot: {
          date: string;
          time: string;
          period: Slot["period"];
        };
      }>,
    ) {
      const { doctorId, slot } = action.payload;

      if (!doctorId || !slot.date || !slot.time) {
        return;
      }

      const existing = state.slotsByDoctor[doctorId] ?? [];

      const duplicate = existing.some(
        (item) =>
          item.date === slot.date &&
          item.time === slot.time,
      );

      if (duplicate) {
        return;
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

      state.slotsByDoctor[doctorId] = [
        ...existing,
        newSlot,
      ];

      if (!state.initializedDoctors.includes(doctorId)) {
        state.initializedDoctors.push(doctorId);
      }
    },

    removeDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const { doctorId, slotId } = action.payload;
      const slots = state.slotsByDoctor[doctorId];

      if (!slots) {
        return;
      }

      const target = slots.find(
        (slot) => slot.id === slotId,
      );

      if (!target || target.status === "booked") {
        return;
      }

      state.slotsByDoctor[doctorId] = slots.filter(
        (slot) => slot.id !== slotId,
      );
    },

    toggleDoctorSlotAvailability(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const { doctorId, slotId } = action.payload;
      const slots = state.slotsByDoctor[doctorId];

      if (!slots) {
        return;
      }

      state.slotsByDoctor[doctorId] = slots.map(
        (slot): Slot => {
          if (
            slot.id !== slotId ||
            slot.status === "booked"
          ) {
            return slot;
          }

          return {
            ...slot,
            status:
              slot.status === "available"
                ? "unavailable"
                : "available",
          };
        },
      );
    },
  },
});

export const {
  initializeDoctorSlots,
  setDoctorSlots,
  bookDoctorSlot,
  rescheduleDoctorSlot,
  releaseDoctorSlot,
  createDoctorSlot,
  removeDoctorSlot,
  toggleDoctorSlotAvailability,
} = slotsSlice.actions;

export default slotsSlice.reducer;
