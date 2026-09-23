"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "@/store";
import {
  initializeAuth,
} from "@/store/slices/authSlice";

type ReduxProviderProps = {
  children: React.ReactNode;
};

export default function ReduxProvider({
  children,
}: ReduxProviderProps) {
  useEffect(() => {
    if (
      !store.getState().auth.initialized
    ) {
      store.dispatch(
        initializeAuth(),
      );
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}