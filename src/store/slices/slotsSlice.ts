import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  addBooking,
  getAllBookings,
  updateBooking,
  updateBookingStatus,
} from "@/lib/bookings-store";

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

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    initializeAppointments(state) {
      state.appointments =
        getAllBookings();
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
        addBooking(
          action.payload,
        );

      const exists =
        state.appointments.some(
          (booking) =>
            booking.id ===
            appointment.id,
        );

      if (!exists) {
        state.appointments.push(
          appointment,
        );
      }
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
          >
        >;
      }>,
    ) {
      const updated =
        updateBooking(
          action.payload
            .bookingId,
          action.payload
            .updates,
        );

      if (!updated) {
        return;
      }

      state.appointments =
        state.appointments.map(
          (booking) =>
            booking.id ===
            updated.id
              ? updated
              : booking,
        );
    },

    updateAppointmentStatus(
      state,
      action: PayloadAction<{
        bookingId: string;
        status: BookingStatus;
        actionReason?: string;
      }>,
    ) {
      const updated =
        updateBookingStatus(
          action.payload
            .bookingId,
          action.payload
            .status,
          action.payload
            .actionReason,
        );

      if (!updated) {
        return;
      }

      state.appointments =
        state.appointments.map(
          (booking) =>
            booking.id ===
            updated.id
              ? updated
              : booking,
        );
    },
  },
});

export const {
  initializeAppointments,
  setAppointments,
  addAppointment,
  updateAppointment,
  updateAppointmentStatus,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;