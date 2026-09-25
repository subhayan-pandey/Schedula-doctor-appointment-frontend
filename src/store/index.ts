import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import doctorsReducer from "@/store/slices/doctorsSlice";
import appointmentsReducer from "@/store/slices/appointmentsSlice";
import slotsReducer from "@/store/slices/slotsSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";

import {
  setAppointments,
} from "@/store/slices/appointmentsSlice";

import {
  setDoctors,
} from "@/store/slices/doctorsSlice";

import {
  setNotifications,
} from "@/store/slices/notificationsSlice";

import {
  loadPersistedBookings,
  loadPersistedDoctors,
  loadPersistedNotifications,
  persistBookings,
  persistDoctors,
  persistNotifications,
  persistSlots,
} from "@/store/persistence";

import {
  doctors as seedDoctors,
} from "@/lib/mock-data/doctors";

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    slots: slotsReducer,
    notifications: notificationsReducer,
  },
});

let previousAppointments = store.getState().appointments.appointments;
let previousDoctors = store.getState().doctors.doctors;
let previousSlots = store.getState().slots.slotsByDoctor;
let previousNotifications =
  store.getState().notifications.notifications;

store.subscribe(() => {
  if (typeof window === "undefined") {
    return;
  }

  const state = store.getState();

  if (
    state.appointments.initialized &&
    state.appointments.appointments !== previousAppointments
  ) {
    persistBookings(state.appointments.appointments);
    previousAppointments = state.appointments.appointments;
  }

  if (
    state.doctors.initialized &&
    state.doctors.doctors !== previousDoctors
  ) {
    persistDoctors(state.doctors.doctors);
    previousDoctors = state.doctors.doctors;
  }

  if (
    state.slots.slotsByDoctor !== previousSlots
  ) {
    const doctorIds = Object.keys(state.slots.slotsByDoctor);

    for (const doctorId of doctorIds) {
      persistSlots(
        doctorId,
        state.slots.slotsByDoctor[doctorId] ?? [],
      );
    }

    previousSlots = state.slots.slotsByDoctor;
  }

  if (
    state.notifications.initialized &&
    state.notifications.notifications !== previousNotifications
  ) {
    persistNotifications(state.notifications.notifications);
    previousNotifications =
      state.notifications.notifications;
  }
});

export { store };

export function hydratePersistedState(): void {
  if (typeof window === "undefined") {
    return;
  }

  const state = store.getState();

  if (!state.appointments.initialized) {
    store.dispatch(
      setAppointments(
        loadPersistedBookings(),
      ),
    );
  }

  if (!state.doctors.initialized) {
    store.dispatch(
      setDoctors(
        loadPersistedDoctors(seedDoctors),
      ),
    );
  }

  if (!state.notifications.initialized) {
    store.dispatch(
      setNotifications(
        loadPersistedNotifications(),
      ),
    );
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
