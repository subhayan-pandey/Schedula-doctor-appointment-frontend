import type {
  Metadata,
} from "next";

import PatientHistory from "@/features/patient-history/components/PatientHistory";

export const metadata: Metadata = {
  title: "Patient History | Schedula",
};

type PatientPageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function DoctorPatientHistoryPage({
  params,
}: PatientPageProps) {
  const {
    patientId,
  } = await params;

  return (
    <PatientHistory
      patientId={
        decodeURIComponent(
          patientId,
        )
      }
    />
  );
}