import type { Metadata } from "next";

import AdminAppointmentsList from "@/features/admin-appointments/components/AdminAppointmentsList";

export const metadata: Metadata = {
  title: "Appointments | Schedula Admin",
};

export default function AdminAppointmentsPage() {
  return <AdminAppointmentsList />;
}
