import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { Doctor } from "@/types/doctor";

type DoctorsState = {
  doctors: Doctor[];
  initialized: boolean;
};

const initialState: DoctorsState = {
  doctors: [],
  initialized: false,
};

const doctorsSlice = createSlice({
  name: "doctors",

  initialState,

  reducers: {
    initializeDoctors(
      state,
    ) {
      state.initialized = true;
    },

    setDoctors(
      state,
      action: PayloadAction<Doctor[]>,
    ) {
      state.doctors =
        action.payload;

      state.initialized = true;
    },

    addDoctorToStore(
      state,
      action: PayloadAction<Doctor>,
    ) {
      const doctor =
        action.payload;

      const existingIndex =
        state.doctors.findIndex(
          (item) =>
            item.id === doctor.id,
        );

      if (existingIndex >= 0) {
        state.doctors[
          existingIndex
        ] = doctor;

        return;
      }

      state.doctors.push(
        doctor,
      );
    },

    updateDoctor(
      state,
      action: PayloadAction<Doctor>,
    ) {
      const doctor =
        action.payload;

      const index =
        state.doctors.findIndex(
          (item) =>
            item.id === doctor.id,
        );

      if (index === -1) {
        state.doctors.push(
          doctor,
        );

        return;
      }

      state.doctors[index] =
        doctor;
    },
  },
});

export const {
  initializeDoctors,
  setDoctors,
  addDoctorToStore,
  updateDoctor,
} = doctorsSlice.actions;

export default doctorsSlice.reducer;