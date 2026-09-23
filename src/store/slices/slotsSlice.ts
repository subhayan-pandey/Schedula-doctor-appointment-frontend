import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  bookSlot,
  createSlot,
  getSlotsForDoctor,
  releaseSlot,
  removeSlot,
  rescheduleSlot,
  toggleSlotAvailability,
} from "@/lib/slots-store";

import type {
  Slot,
} from "@/types/slot";

type SlotsState = {
  slotsByDoctor: Record<
    string,
    Slot[]
  >;
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
      action: PayloadAction<string>,
    ) {
      const doctorId =
        action.payload;

      if (!doctorId) {
        return;
      }

      state.slotsByDoctor[
        doctorId
      ] =
        getSlotsForDoctor(
          doctorId,
        );

      if (
        !state.initializedDoctors.includes(
          doctorId,
        )
      ) {
        state.initializedDoctors.push(
          doctorId,
        );
      }
    },

    setDoctorSlots(
      state,
      action: PayloadAction<{
        doctorId: string;
        slots: Slot[];
      }>,
    ) {
      const {
        doctorId,
        slots,
      } = action.payload;

      state.slotsByDoctor[
        doctorId
      ] = slots;

      if (
        !state.initializedDoctors.includes(
          doctorId,
        )
      ) {
        state.initializedDoctors.push(
          doctorId,
        );
      }
    },

    bookDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const {
        doctorId,
        slotId,
      } = action.payload;

      const updated =
        bookSlot(
          doctorId,
          slotId,
        );

      if (!updated) {
        return;
      }

      state.slotsByDoctor[
        doctorId
      ] = updated;
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

      const updated =
        rescheduleSlot(
          doctorId,
          currentSlotId,
          newSlotId,
        );

      if (!updated) {
        return;
      }

      state.slotsByDoctor[
        doctorId
      ] = updated;
    },

    releaseDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const {
        doctorId,
        slotId,
      } = action.payload;

      state.slotsByDoctor[
        doctorId
      ] = releaseSlot(
        doctorId,
        slotId,
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
      const {
        doctorId,
        slot,
      } = action.payload;

      state.slotsByDoctor[
        doctorId
      ] = createSlot(
        doctorId,
        slot,
      );
    },

    removeDoctorSlot(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const {
        doctorId,
        slotId,
      } = action.payload;

      state.slotsByDoctor[
        doctorId
      ] = removeSlot(
        doctorId,
        slotId,
      );
    },

    toggleDoctorSlotAvailability(
      state,
      action: PayloadAction<{
        doctorId: string;
        slotId: string;
      }>,
    ) {
      const {
        doctorId,
        slotId,
      } = action.payload;

      state.slotsByDoctor[
        doctorId
      ] =
        toggleSlotAvailability(
          doctorId,
          slotId,
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