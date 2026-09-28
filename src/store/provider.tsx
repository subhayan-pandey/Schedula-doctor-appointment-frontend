"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store, hydratePersistedState } from "@/store";
import { initializeAuth } from "@/store/slices/authSlice";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydratePersistedState();
    if (!store.getState().auth.initialized) store.dispatch(initializeAuth());
    const onStorage = (event: StorageEvent) => {
      if (event.key === "schedula:redux-state:v1" && event.newValue) hydratePersistedState();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
