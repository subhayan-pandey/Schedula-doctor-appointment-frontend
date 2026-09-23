import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  addDoctor,
  getAllDoctors,
} from "@/lib/doctors-store";

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
    initializeDoctors(state) {
      state.doctors = getAllDoctors();
      state.initialized = true;
    },

    setDoctors(
      state,
      action: PayloadAction<Doctor[]>,
    ) {
      state.doctors = action.payload;
      state.initialized = true;
    },

    addDoctorToStore(
      state,
      action: PayloadAction<Doctor>,
    ) {
      addDoctor(action.payload);

      state.doctors = [
        ...state.doctors.filter(
          (doctor) =>
            doctor.id !== action.payload.id,
        ),
        action.payload,
      ];
    },

    updateDoctor(
      state,
      action: PayloadAction<Doctor>,
    ) {
      addDoctor(action.payload);

      state.doctors = state.doctors.map(
        (doctor) =>
          doctor.id === action.payload.id
            ? action.payload
            : doctor,
      );
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