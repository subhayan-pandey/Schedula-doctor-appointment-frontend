import type { Metadata } from "next";

import AdminDoctorsList from "@/features/admin-doctors/components/AdminDoctorsList";

export const metadata: Metadata = {
  title: "Doctors | Schedula Admin",
};

export default function AdminDoctorsPage() {
  return <AdminDoctorsList />;
}
