export type IntakeFormStatus =
  | "draft"
  | "submitted";

export type PreConsultationIntake = {
  id: string;
  appointmentId: string;
  patientId: string;

  symptoms: string;
  primaryConcern: string;
  symptomDuration: string;
  currentMedications: string;
  allergies: string;
  medicalConditions: string;
  additionalNotes: string;

  status: IntakeFormStatus;

  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
};