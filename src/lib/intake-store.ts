import type { PreConsultationIntake } from "@/types/intake";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const id = () => `intake-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export type SaveIntakeInput = Omit<PreConsultationIntake, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string };
const all = () => getSharedCollection<PreConsultationIntake>("intakes");
const write = (items: PreConsultationIntake[]) => { updateSharedCollection<PreConsultationIntake>("intakes", () => items); emitLegacyViewEvent("schedula:intakes-updated"); };
export function getIntakeByAppointmentId(appointmentId: string, patientId?: string): PreConsultationIntake | undefined { return all().find((x) => x.appointmentId === appointmentId && (!patientId || x.patientId === patientId)); }
export function getIntakesByPatientId(patientId: string): PreConsultationIntake[] { return all().filter((x) => x.patientId === patientId); }
export function saveIntake(input: SaveIntakeInput): PreConsultationIntake {
  const existing = getIntakeByAppointmentId(input.appointmentId, input.patientId); const now = new Date().toISOString();
  const saved: PreConsultationIntake = { ...input, id: existing?.id ?? input.id ?? id(), symptoms: input.symptoms.trim(), primaryConcern: input.primaryConcern.trim(), symptomDuration: input.symptomDuration.trim(), currentMedications: input.currentMedications.trim(), allergies: input.allergies.trim(), medicalConditions: input.medicalConditions.trim(), additionalNotes: input.additionalNotes.trim(), createdAt: existing?.createdAt ?? input.createdAt ?? now, updatedAt: now, ...(input.status === "submitted" ? { submittedAt: input.submittedAt ?? existing?.submittedAt ?? now } : {}) };
  write(existing ? all().map((x) => x.id === existing.id ? saved : x) : [...all(), saved]); return saved;
}
export function updateIntake(intakeId: string, updates: Partial<Omit<PreConsultationIntake, "id" | "appointmentId" | "patientId" | "createdAt" | "updatedAt">>): PreConsultationIntake | null {
  const current = all().find((x) => x.id === intakeId); if (!current) return null; const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
  if (updated.status === "submitted") updated.submittedAt = updates.submittedAt ?? current.submittedAt ?? updated.updatedAt; else delete updated.submittedAt;
  write(all().map((x) => x.id === intakeId ? updated : x)); return updated;
}
export function deleteIntake(intakeId: string): boolean { const next = all().filter((x) => x.id !== intakeId); if (next.length === all().length) return false; write(next); return true; }
