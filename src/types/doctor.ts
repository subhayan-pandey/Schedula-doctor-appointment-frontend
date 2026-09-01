export type Specialty =
  | "Cardiologist"
  | "Dermatologist"
  | "Psychologist"
  | "General Physician"
  | "Pediatrician"
  | "Orthopedic";

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
};