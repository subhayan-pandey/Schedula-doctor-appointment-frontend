import type { Metadata } from "next";
import AuthCard from "@/components/layout/AuthCard";
import DoctorRegisterForm from "@/features/doctor-auth/components/DoctorRegisterForm";

export const metadata: Metadata = {
  title: "Doctor Registration | Schedula",
};

export default function DoctorRegisterPage() {
  return (
    <AuthCard title="Register as a doctor" subtitle="For Doctors" wide>
      <DoctorRegisterForm />
    </AuthCard>
  );
}