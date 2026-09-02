import type { Metadata } from "next";
import AuthCard from "@/components/layout/AuthCard";
import SignupForm from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Schedula",
};

export default function SignupPage() {
  return (
    <AuthCard title="Create your account">
      <SignupForm />
    </AuthCard>
  );
}