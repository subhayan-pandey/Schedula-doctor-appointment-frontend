import type { Metadata } from "next";

import DoctorVerificationList from "@/features/admin-doctor-verification/components/DoctorVerificationList";

export const metadata: Metadata = {
  title: "Doctor Verification | Schedula Admin",
};

export default function AdminDoctorVerificationPage() {
  return <DoctorVerificationList />;
}
