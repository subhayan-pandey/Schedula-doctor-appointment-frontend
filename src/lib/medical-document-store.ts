import type { MedicalDocument } from "@/types/medical-document";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const all = () => getSharedCollection<MedicalDocument>("medicalDocuments");
const write = (items: MedicalDocument[]) => { updateSharedCollection<MedicalDocument>("medicalDocuments", () => items); emitLegacyViewEvent("schedula:medical-documents-updated"); };
export function getAllMedicalDocuments(): MedicalDocument[] { return all(); }
export function getMedicalDocumentById(id: string): MedicalDocument | undefined { return all().find((x) => x.id === id); }
export function getMedicalDocumentsByPatientId(patientId: string): MedicalDocument[] { return all().filter((x) => x.patientId === patientId); }
export function getMedicalDocumentsByAppointmentId(appointmentId: string): MedicalDocument[] { return all().filter((x) => x.appointmentId === appointmentId); }
export function saveMedicalDocument(document: MedicalDocument): MedicalDocument { const now = new Date().toISOString(); const saved = { ...document, updatedAt: now }; write(all().some((x) => x.id === saved.id) ? all().map((x) => x.id === saved.id ? saved : x) : [...all(), { ...saved, createdAt: saved.createdAt ?? now }]); return saved; }
export function deleteMedicalDocument(id: string): boolean { const next = all().filter((x) => x.id !== id); if (next.length === all().length) return false; write(next); return true; }
export function clearMedicalDocumentsForPatient(patientId: string): void { write(all().filter((x) => x.patientId !== patientId)); }
export function getMedicalDocumentUpdatedEvent(): string { return "schedula:medical-documents-updated"; }
