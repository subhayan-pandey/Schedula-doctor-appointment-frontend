import {
  getAllDoctors,
  getDoctorById,
} from "@/lib/doctors-store";

import type { Doctor, DoctorVerificationStatus } from "@/types/doctor";

export type AdminDoctorView = Doctor & {
  isActive: boolean;
  verificationStatus: DoctorVerificationStatus;
};

/**
 * Pre-existing seed doctors have no isActive/verificationStatus (those
 * fields didn't exist before Phase 2A) — they're treated as already
 * active and already verified, rather than dropped into a "pending"
 * queue unexpectedly.
 */
export function normalizeDoctorForAdmin(doctor: Doctor): AdminDoctorView {
  return {
    ...doctor,
    isActive: doctor.isActive ?? true,
    verificationStatus: doctor.verificationStatus ?? "approved",
  };
}

export function getAllDoctorsForAdmin(): AdminDoctorView[] {
  return getAllDoctors().map(normalizeDoctorForAdmin);
}

export function getDoctorForAdmin(id: string): AdminDoctorView | null {
  const doctor = getDoctorById(id);

  return doctor ? normalizeDoctorForAdmin(doctor) : null;
}

export function getVerificationLabel(
  status: DoctorVerificationStatus,
): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

export function getVerificationTone(
  status: DoctorVerificationStatus,
): "success" | "danger" | "warning" {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}
