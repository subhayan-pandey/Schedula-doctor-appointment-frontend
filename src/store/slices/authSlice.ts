import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/user";
import type { AdminUser } from "@/types/admin/admin-user";
type AuthState = { user: User | null; adminUser: AdminUser | null; isAuthenticated: boolean; initialized: boolean };
const initialState: AuthState = { user: null, adminUser: null, isAuthenticated: false, initialized: false };
const authSlice = createSlice({ name: "auth", initialState, reducers: {
  initializeAuth(state) { state.initialized = true; state.isAuthenticated = Boolean(state.user || state.adminUser); },
  login(state, action: PayloadAction<User>) { state.user = action.payload; state.isAuthenticated = true; state.initialized = true; },
  logout(state) { state.user = null; state.isAuthenticated = Boolean(state.adminUser); state.initialized = true; },
  setUser(state, action: PayloadAction<User | null>) { state.user = action.payload; state.isAuthenticated = Boolean(state.user || state.adminUser); state.initialized = true; },
  setAdminUser(state, action: PayloadAction<AdminUser | null>) { state.adminUser = action.payload; state.isAuthenticated = Boolean(state.user || state.adminUser); state.initialized = true; },
} });
export const { initializeAuth, login, logout, setUser, setAdminUser } = authSlice.actions;
export default authSlice.reducer;
