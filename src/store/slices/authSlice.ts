import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  clearSession,
  getSession,
  setSession,
} from "@/lib/storage";

import type { User } from "@/types/user";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    initializeAuth(state) {
      const user = getSession();

      state.user = user;
      state.isAuthenticated = Boolean(user);
      state.initialized = true;
    },

    login(
      state,
      action: PayloadAction<User>,
    ) {
      setSession(action.payload);

      state.user = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
    },

    logout(state) {
      clearSession();

      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
    },

    setUser(
      state,
      action: PayloadAction<User | null>,
    ) {
      if (action.payload) {
        setSession(action.payload);
      } else {
        clearSession();
      }

      state.user = action.payload;
      state.isAuthenticated =
        Boolean(action.payload);
      state.initialized = true;
    },
  },
});

export const {
  initializeAuth,
  login,
  logout,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;