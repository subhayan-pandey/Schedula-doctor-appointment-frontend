import type { Doctor } from "@/types/doctor";
import type { User } from "@/types/user";
import type { AdminUser } from "@/types/admin/admin-user";
import { doctors as seedDoctors } from "@/lib/mock-data/doctors";
import { buildSeedSlots } from "@/lib/mock-data/slots";
import { store } from "@/store";
import { setAppointments } from "@/store/slices/appointmentsSlice";
import { setDoctors } from "@/store/slices/doctorsSlice";
import { setDoctorSlots } from "@/store/slices/slotsSlice";
import { setNotifications } from "@/store/slices/notificationsSlice";
import { initializeAuth, setAdminUser, setUser } from "@/store/slices/authSlice";
import { setSharedData, type SharedDataState } from "@/store/slices/sharedDataSlice";

export const ROOT_STATE_KEY = "schedula:redux-state:v1";
const legacyKeys: Record<string, string> = {
  patientAccounts: "schedula:patient-accounts", userProfiles: "schedula:user-profiles",
  notificationPreferences: "schedula:notification-preferences", intakes: "schedula:pre-consultation-intakes",
  medicalDocuments: "schedula:medical-documents", prescriptions: "schedula:prescriptions",
  reviews: "schedula:doctor-reviews", waitlist: "schedula:waitlist", supportTickets: "schedula:support-tickets",
  supportTicketMessages: "schedula:support-ticket-messages", payments: "schedula:payments",
  adminAccounts: "schedula:admin-accounts", auditLogs: "schedula:admin-audit-logs",
};
function read<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function persistRootState(serialized: string): void {
  try { localStorage.setItem(ROOT_STATE_KEY, serialized); } catch { /* in-memory app remains usable */ }
}
export { persistRootState };

// Compatibility readers used by retained store facades. Redux is now the sole
// owner; these never read/write the retired per-domain localStorage keys.
export function loadPersistedBookings() { return store.getState().appointments.appointments; }
export function loadPersistedDoctors(fallback: Doctor[]) { const current = store.getState().doctors.doctors; return current.length ? current : fallback; }
export function loadPersistedNotifications() { return store.getState().notifications.notifications; }
export function loadPersistedSlots(doctorId: string, fallback: import("@/types/slot").Slot[]) { return store.getState().slots.slotsByDoctor[doctorId] ?? fallback; }
export function persistBookings(): void { persistRootState(JSON.stringify(store.getState())); }
export function persistDoctors(): void { persistRootState(JSON.stringify(store.getState())); }
export function persistNotifications(): void { persistRootState(JSON.stringify(store.getState())); }
export function persistSlots(): void { persistRootState(JSON.stringify(store.getState())); }
export function getSlotsStoragePrefix(): string { return "schedula:slots:"; }
export function getStorageKeys() { return { bookings: ROOT_STATE_KEY, doctors: ROOT_STATE_KEY, notifications: ROOT_STATE_KEY }; }

export function hydratePersistedState(): void {
  if (typeof window === "undefined") return;
  const saved = read<Record<string, unknown> | null>(ROOT_STATE_KEY, null);
  if (saved) {
    if (saved.appointments && typeof saved.appointments === "object") store.dispatch(setAppointments(array((saved.appointments as { appointments?: unknown }).appointments) as never));
    if (saved.doctors && typeof saved.doctors === "object") store.dispatch(setDoctors(array((saved.doctors as { doctors?: unknown }).doctors) as Doctor[]));
    if (saved.notifications && typeof saved.notifications === "object") store.dispatch(setNotifications(array((saved.notifications as { notifications?: unknown }).notifications) as never));
    const slots = saved.slots as { slotsByDoctor?: Record<string, unknown[]> } | undefined;
    for (const [doctorId, values] of Object.entries(slots?.slotsByDoctor ?? {})) store.dispatch(setDoctorSlots({ doctorId, slots: array(values) as never }));
    const auth = saved.auth as { user?: User | null; adminUser?: AdminUser | null } | undefined;
    if (auth) { store.dispatch(setUser(auth.user ?? null)); store.dispatch(setAdminUser(auth.adminUser ?? null)); }
    const shared = saved.sharedData as Partial<SharedDataState> | undefined;
    if (shared) store.dispatch(setSharedData(shared));
  } else {
    store.dispatch(setAppointments(array(read("schedula:bookings", [])) as never));
    const doctors = array(read("schedula:doctors", seedDoctors)) as Doctor[];
    store.dispatch(setDoctors(doctors.length ? doctors : seedDoctors));
    store.dispatch(setNotifications(array(read("schedula:notifications", [])) as never));
    const collections = Object.fromEntries(Object.entries(legacyKeys).map(([name, key]) => [name, array(read(key, []))])) as SharedDataState["collections"];
    const legacyPatient = read<unknown>("schedula:patient-account", null);
    if (legacyPatient && !collections.patientAccounts.length) collections.patientAccounts = [legacyPatient];
    store.dispatch(setSharedData({ collections, singletons: {
      doctorAccount: read("schedula:doctor-account", null), doctorPassword: read("schedula:doctor-password", null),
      adminNotificationPreferences: read("schedula:admin-notification-preferences", null),
      platformSettings: read("schedula:platform-settings", null),
    } }));
    const slotDoctorIds = new Set(doctors.map((doctor) => doctor.id));
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("schedula:slots:")) slotDoctorIds.add(key.slice("schedula:slots:".length));
    }
    for (const doctorId of slotDoctorIds) store.dispatch(setDoctorSlots({ doctorId, slots: array(read(`schedula:slots:${doctorId}`, buildSeedSlots(doctorId))) as never }));
    store.dispatch(setUser(read("schedula:session", null)));
    store.dispatch(setAdminUser(read("schedula:admin-session", null)));
    store.dispatch(initializeAuth());
    persistRootState(JSON.stringify(store.getState()));
  }
}
