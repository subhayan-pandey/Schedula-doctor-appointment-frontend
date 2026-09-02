import type { Metadata } from "next";

import DoctorPrescriptions from "@/features/doctor-prescriptions/components/DoctorPrescription";

export const metadata: Metadata = {
  title: "Prescriptions | Schedula",
};

export default function DoctorPrescriptionsPage() {
  return <DoctorPrescriptions />;
}