import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SharedCollectionName =
  | "patientAccounts" | "userProfiles" | "notificationPreferences"
  | "intakes" | "medicalDocuments" | "prescriptions" | "reviews"
  | "waitlist" | "supportTickets" | "supportTicketMessages" | "payments"
  | "adminAccounts" | "auditLogs";

export type SharedDataState = {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  collections: Record<SharedCollectionName, unknown[]>;
  singletons: { doctorAccount: unknown | null; doctorPassword: string | null };
};

const emptyCollections = (): SharedDataState["collections"] => ({
  patientAccounts: [], userProfiles: [], notificationPreferences: [], intakes: [],
  medicalDocuments: [], prescriptions: [], reviews: [], waitlist: [],
  supportTickets: [], supportTicketMessages: [], payments: [], adminAccounts: [], auditLogs: [],
});

const initialState: SharedDataState = {
  status: "idle", error: null, collections: emptyCollections(),
  singletons: { doctorAccount: null, doctorPassword: null },
};

const sharedDataSlice = createSlice({
  name: "sharedData", initialState,
  reducers: {
    beginSharedDataLoad(state) { state.status = "loading"; state.error = null; },
    setSharedData(state, action: PayloadAction<Partial<SharedDataState>>) {
      const incoming = action.payload;
      state.collections = { ...emptyCollections(), ...incoming.collections };
      state.singletons = { ...state.singletons, ...incoming.singletons };
      state.status = "ready"; state.error = null;
    },
    failSharedDataLoad(state, action: PayloadAction<string>) { state.status = "error"; state.error = action.payload; },
    replaceCollection(state, action: PayloadAction<{ name: SharedCollectionName; value: unknown[] }>) {
      state.collections[action.payload.name] = action.payload.value;
    },
    setSingleton(state, action: PayloadAction<{ name: keyof SharedDataState["singletons"]; value: unknown }>) {
      (state.singletons as Record<string, unknown>)[action.payload.name] = action.payload.value;
    },
  },
});

export const { beginSharedDataLoad, setSharedData, failSharedDataLoad, replaceCollection, setSingleton } = sharedDataSlice.actions;
export default sharedDataSlice.reducer;
