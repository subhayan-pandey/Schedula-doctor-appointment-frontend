export type Specialty =
  | "Cardiologist"
  | "Dermatologist"
  | "Psychologist"
  | "General Physician"
  | "Pediatrician"
  | "Orthopedic";

export type DoctorVerificationStatus = "pending" | "approved" | "rejected";

export type Doctor = {
  id: string;
  name: string;
  specialty: Specialty;
  qualification: string;
  experienceYears: number;
  clinic: string;
  location: string;
  rating: number;
  reviewsCount: number;
  patientsCount: number;
  consultationFee: number;
  availableToday: boolean;
  timing: string;
  bio: string;
  avatarInitials: string;
  /**
   * Admin Portal fields (Phase 2A). Optional so every existing doctor
   * object/literal in the app still type-checks without changes.
   * src/lib/admin/admin-doctors.ts normalizes missing values to
   * isActive: true / verificationStatus: "approved" for display —
   * i.e. pre-existing seed doctors are treated as already active and
   * verified. Update through src/lib/doctors-store.ts's
   * updateDoctorFields()/setDoctorActiveStatus(), not by writing to
   * these fields directly, so the change goes through Redux and gets
   * persisted the same way every other doctor mutation does.
   */
  isActive?: boolean;
  verificationStatus?: DoctorVerificationStatus;
};

export const SPECIALTIES: Specialty[] = [
  "Cardiologist",
  "Dermatologist",
  "Psychologist",
  "General Physician",
  "Pediatrician",
  "Orthopedic",
];
