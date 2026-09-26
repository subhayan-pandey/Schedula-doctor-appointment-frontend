import type { Metadata } from "next";

import AdminPatientsList from "@/features/admin-patients/components/AdminPatientsList";

export const metadata: Metadata = {
  title: "Patients | Schedula Admin",
};

export default function AdminPatientsPage() {
  return <AdminPatientsList />;
}
