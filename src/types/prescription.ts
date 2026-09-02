export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  instructions: string;
  createdAt: string;
  updatedAt: string;
}