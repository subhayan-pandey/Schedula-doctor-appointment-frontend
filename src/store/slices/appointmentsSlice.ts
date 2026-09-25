import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

type AppointmentsState = {
  appointments: Booking[];
  initialized: boolean;
};

const initialState: AppointmentsState = {
  appointments: [],
  initialized: false,
};

const appointmentsSlice =
  createSlice({
    name: "appointments",

    initialState,

    reducers: {
      initializeAppointments(
        state,
      ) {
        state.initialized = true;
      },

      setAppointments(
        state,
        action: PayloadAction<Booking[]>,
      ) {
        state.appointments =
          action.payload;

        state.initialized = true;
      },

      addAppointment(
        state,
        action: PayloadAction<Booking>,
      ) {
        const appointment =
          action.payload;

        const existingIndex =
          state.appointments.findIndex(
            (booking) =>
              booking.id ===
              appointment.id,
          );

        if (existingIndex >= 0) {
          state.appointments[
            existingIndex
          ] = appointment;

          return;
        }

        state.appointments.push(
          appointment,
        );
      },

      updateAppointment(
        state,
        action: PayloadAction<{
          bookingId: string;
          updates: Partial<
            Pick<
              Booking,
              | "slotId"
              | "date"
              | "time"
              | "status"
              | "actionReason"
              | "consultationType"
            >
          >;
        }>,
      ) {
        const {
          bookingId,
          updates,
        } = action.payload;

        const index =
          state.appointments.findIndex(
            (booking) =>
              booking.id ===
              bookingId,
          );

        if (index === -1) {
          return;
        }

        state.appointments[index] = {
          ...state.appointments[index],
          ...updates,
          updatedAt:
            new Date().toISOString(),
        };
      },

      updateAppointmentStatus(
        state,
        action: PayloadAction<{
          bookingId: string;
          status: BookingStatus;
          actionReason?: string;
        }>,
      ) {
        const {
          bookingId,
          status,
          actionReason,
        } = action.payload;

        const index =
          state.appointments.findIndex(
            (booking) =>
              booking.id ===
              bookingId,
          );

        if (index === -1) {
          return;
        }

        const current =
          state.appointments[index];

        state.appointments[index] = {
          ...current,
          status,
          updatedAt:
            new Date().toISOString(),
          ...(actionReason !==
          undefined
            ? {
                actionReason,
              }
            : {}),
        };
      },
    },
  });

export const {
  initializeAppointments,
  setAppointments,
  addAppointment,
  updateAppointment,
  updateAppointmentStatus,
} =
  appointmentsSlice.actions;

export default appointmentsSlice.reducer;