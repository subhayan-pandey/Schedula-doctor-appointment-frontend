import type { Metadata } from "next";
import DoctorDashboard from "@/features/doctor-dashboard/components/DoctorDashboard";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Schedula",
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}