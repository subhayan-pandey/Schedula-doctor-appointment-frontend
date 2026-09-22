export type MedicalDocumentCategory =
  | "prescription"
  | "lab-report"
  | "scan"
  | "medical-record"
  | "other";

export type MedicalDocument = {
  id: string;
  patientId: string;

  appointmentId?: string;

  name: string;
  category: MedicalDocumentCategory;

  fileName: string;
  fileType: string;
  fileSize: number;

  dataUrl: string;

  createdAt: string;
  updatedAt: string;
};