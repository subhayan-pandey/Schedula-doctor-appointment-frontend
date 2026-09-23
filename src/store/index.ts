import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import doctorsReducer from "@/store/slices/doctorsSlice";
import appointmentsReducer from "@/store/slices/appointmentsSlice";
import slotsReducer from "@/store/slices/slotsSlice";
import notificationsReducer from "@/store/slices/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    slots: slotsReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;