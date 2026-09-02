import type { Metadata } from "next";
import AuthCard from "@/components/layout/AuthCard";
import DoctorLoginForm from "@/features/doctor-auth/components/DoctorLoginForm";

export const metadata: Metadata = {
  title: "Doctor Login | Schedula",
};

export default function DoctorLoginPage() {
  return (
    <AuthCard title="Doctor Login" subtitle="For Doctors">
      <DoctorLoginForm />
    </AuthCard>
  );
}