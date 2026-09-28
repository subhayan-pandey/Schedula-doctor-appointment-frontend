import type { WaitlistEntry, WaitlistStatus } from "@/types/waitlist";
import type { Slot } from "@/types/slot";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
import { createPatientNotification } from "@/lib/notifications-store";
const all = () => getSharedCollection<WaitlistEntry>("waitlist");
const write = (entries: WaitlistEntry[]) => { updateSharedCollection<WaitlistEntry>("waitlist", () => entries); emitLegacyViewEvent("schedula:waitlist-updated"); };
export function getAllWaitlistEntries(): WaitlistEntry[] { return all(); }
export function getWaitlistEntriesForDoctorDate(doctorId: string, preferredDate: string): WaitlistEntry[] { return all().filter((x) => x.doctorId === doctorId && x.preferredDate === preferredDate && x.status === "waiting").sort((a, b) => a.position - b.position); }
export function getWaitlistEntriesByPatient(patientId: string): WaitlistEntry[] { return all().filter((x) => x.patientId === patientId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)); }
export function addWaitlistEntry(input: { patientId: string; doctorId: string; preferredDate: string; preferredTime?: string; slotId?: string }): WaitlistEntry | null {
  const { patientId, doctorId, preferredDate, preferredTime, slotId } = input; if (!patientId || !doctorId || !preferredDate) return null;
  const entries = all(); const duplicate = entries.find((x) => x.patientId === patientId && x.doctorId === doctorId && x.preferredDate === preferredDate && x.preferredTime === preferredTime && ["waiting", "notified"].includes(x.status)); if (duplicate) return duplicate;
  const now = new Date().toISOString(); const entry: WaitlistEntry = { id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, patientId, doctorId, preferredDate, preferredTime, slotId, status: "waiting", position: entries.filter((x) => x.doctorId === doctorId && x.preferredDate === preferredDate && x.status === "waiting").length + 1, createdAt: now, updatedAt: now }; write([...entries, entry]); return entry;
}
export function updateWaitlistStatus(entryId: string, status: WaitlistStatus): WaitlistEntry | null { const current = all().find((x) => x.id === entryId); if (!current) return null; const now = new Date().toISOString(); const updated = { ...current, status, updatedAt: now, notifiedAt: status === "notified" ? now : current.notifiedAt }; write(all().map((x) => x.id === entryId ? updated : x)); return updated; }
export function cancelWaitlistEntry(entryId: string): WaitlistEntry | null { return updateWaitlistStatus(entryId, "cancelled"); }
export function syncWaitlistAvailability(doctorId: string, slots: Slot[]): void {
  if (!doctorId) return; let changed = false;
  const next = all().map((entry) => {
    if (entry.doctorId !== doctorId || entry.status !== "waiting") return entry;
    const slot = slots.find((candidate) => candidate.status === "available" && candidate.date === entry.preferredDate && (!entry.preferredTime || candidate.time === entry.preferredTime) && (!entry.slotId || candidate.id === entry.slotId));
    if (!slot) return entry; changed = true; const now = new Date().toISOString();
    createPatientNotification({ userId: entry.patientId, title: "Waitlist slot available", message: `A slot is now available on ${slot.date} at ${slot.time}. Open the doctor booking page to book it.`, type: "system" });
    return { ...entry, status: "notified" as const, slotId: slot.id, notifiedAt: now, updatedAt: now };
  });
  if (changed) write(next);
}
