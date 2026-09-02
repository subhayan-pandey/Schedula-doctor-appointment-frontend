import type { Metadata } from "next";
import DoctorProfileManager from "@/features/doctor-profile/components/DoctorProfileManager";

export const metadata: Metadata = {
  title: "My Profile | Schedula",
};

export default function DoctorProfilePage() {
  return <DoctorProfileManager />;
}