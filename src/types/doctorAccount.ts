import type { Specialty } from "@/types/doctor";

export type DoctorAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: Specialty;
  experienceYears: number;
  clinic: string;
  location: string;
};