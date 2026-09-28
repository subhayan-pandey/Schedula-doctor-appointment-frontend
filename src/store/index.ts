import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import doctorsReducer from "@/store/slices/doctorsSlice";
import appointmentsReducer from "@/store/slices/appointmentsSlice";
import slotsReducer from "@/store/slices/slotsSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import sharedDataReducer from "@/store/slices/sharedDataSlice";
import { persistRootState } from "@/store/persistence";

export const store = configureStore({ reducer: {
  auth: authReducer, doctors: doctorsReducer, appointments: appointmentsReducer,
  slots: slotsReducer, notifications: notificationsReducer, sharedData: sharedDataReducer,
} });
let lastSerialized = "";
store.subscribe(() => {
  if (typeof window === "undefined") return;
  const state = store.getState();
  if (!state.appointments.initialized || !state.doctors.initialized || !state.notifications.initialized) return;
  const serialized = JSON.stringify(state);
  if (serialized !== lastSerialized) { persistRootState(serialized); lastSerialized = serialized; }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { hydratePersistedState } from "@/store/persistence";
