"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store, hydratePersistedState } from "@/store";

import {
  initializeAuth,
} from "@/store/slices/authSlice";

import {
  setAppointments,
} from "@/store/slices/appointmentsSlice";

import {
  setDoctors,
} from "@/store/slices/doctorsSlice";

import {
  setDoctorSlots,
} from "@/store/slices/slotsSlice";

import {
  setNotifications,
} from "@/store/slices/notificationsSlice";

import {
  loadPersistedBookings,
  loadPersistedDoctors,
  loadPersistedNotifications,
  loadPersistedSlots,
  getSlotsStoragePrefix,
} from "@/store/persistence";

import {
  doctors as seedDoctors,
} from "@/lib/mock-data/doctors";

import {
  buildSeedSlots,
} from "@/lib/mock-data/slots";

type ReduxProviderProps = {
  children: React.ReactNode;
};

function hydrateSlotsFromStorageKey(key: string): void {
  const prefix = getSlotsStoragePrefix();

  if (!key.startsWith(prefix)) {
    return;
  }

  const doctorId = key.slice(prefix.length);

  if (!doctorId) {
    return;
  }

  const slots = loadPersistedSlots(
    doctorId,
    buildSeedSlots(doctorId),
  );

  store.dispatch(
    setDoctorSlots({
      doctorId,
      slots,
    }),
  );
}

export default function ReduxProvider({
  children,
}: ReduxProviderProps) {
  useEffect(() => {
    hydratePersistedState();

    if (!store.getState().auth.initialized) {
      store.dispatch(initializeAuth());
    }

    function handleStorageChange(event: StorageEvent): void {
      if (!event.key) {
        return;
      }

      const state = store.getState();

      if (event.key === "schedula:bookings") {
        store.dispatch(
          setAppointments(loadPersistedBookings()),
        );
        return;
      }

      if (event.key === "schedula:doctors") {
        store.dispatch(
          setDoctors(
            loadPersistedDoctors(seedDoctors),
          ),
        );
        return;
      }

      if (event.key === "schedula:notifications") {
        store.dispatch(
          setNotifications(
            loadPersistedNotifications(),
          ),
        );
        return;
      }

      if (event.key.startsWith(getSlotsStoragePrefix())) {
        hydrateSlotsFromStorageKey(event.key);
      }

      void state;
    }

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
