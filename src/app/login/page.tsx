import type { Metadata } from "next";
import AuthCard from "@/components/layout/AuthCard";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Schedula",
};

export default function LoginPage() {
  return (
    <AuthCard title="Login">
      <LoginForm />
    </AuthCard>
  );
}