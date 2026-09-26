import type { Doctor } from "@/types/doctor";

/**
 * Whether a doctor should show as "Verified" to patients. Doctors
 * created before Phase 2A/2B have no verificationStatus at all — those
 * are treated as verified, matching the same default
 * src/lib/admin/admin-doctors.ts uses for the Admin Portal (missing
 * status normalizes to "approved" there too), so a doctor's admin-side
 * status and this patient-facing badge never disagree.
 */
export function isDoctorVerified(doctor: Doctor): boolean {
  return (
    doctor.verificationStatus !== "pending" &&
    doctor.verificationStatus !== "rejected"
  );
}
