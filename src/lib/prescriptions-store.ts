import type { Prescription } from "@/types/prescription";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const all = () => getSharedCollection<Prescription>("prescriptions");
const write = (items: Prescription[]) => { updateSharedCollection<Prescription>("prescriptions", () => items); emitLegacyViewEvent("schedula:prescriptions-updated"); };
export function getAllPrescriptions(): Prescription[] { return all(); }
export function getPrescriptionById(id: string): Prescription | undefined { return all().find((x) => x.id === id); }
export function getPrescriptionByAppointmentId(appointmentId: string): Prescription | undefined { return all().find((x) => x.appointmentId === appointmentId); }
export function getPrescriptionsByPatientId(patientId: string): Prescription[] { return all().filter((x) => x.patientId === patientId); }
export function getPrescriptionsByDoctorId(doctorId: string): Prescription[] { return all().filter((x) => x.doctorId === doctorId); }
export function savePrescription(value: Prescription): Prescription { const now = new Date().toISOString(); const saved = { ...value, updatedAt: now }; write(all().some((x) => x.id === saved.id) ? all().map((x) => x.id === saved.id ? saved : x) : [...all(), { ...saved, createdAt: saved.createdAt ?? now }]); return saved; }
export function deletePrescription(id: string): boolean { const next = all().filter((x) => x.id !== id); if (next.length === all().length) return false; write(next); return true; }
