import type { Metadata } from "next";

import AdminAuthCard from "@/components/admin/AdminAuthCard";
import AdminLoginForm from "@/features/admin-auth/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Schedula",
};

export default function AdminLoginPage() {
  return (
    <AdminAuthCard
      title="Admin Login"
      subtitle="Sign in to manage doctors, patients, appointments, and platform operations."
    >
      <AdminLoginForm />
    </AdminAuthCard>
  );
}
