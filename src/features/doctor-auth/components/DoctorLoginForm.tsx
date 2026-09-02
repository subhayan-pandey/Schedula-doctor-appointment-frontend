"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { setSession } from "@/lib/storage";
import { matchesDoctorAccount } from "@/lib/doctor-account-store";
import { isValidEmailOrMobile, isValidPassword } from "@/lib/utils/validators";

type FieldErrors = {
  identifier?: string;
  password?: string;
  form?: string;
};

export default function DoctorLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!isValidEmailOrMobile(identifier)) {
      nextErrors.identifier = "Enter a valid email or 10-digit mobile number";
    }
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulated network delay — there is no real backend in this project.
    window.setTimeout(() => {
      const account = matchesDoctorAccount(identifier);
      if (!account) {
        setErrors({
          form: "No doctor account found with these details. Register first to continue.",
        });
        setIsSubmitting(false);
        return;
      }

      setSession({
        id: account.id,
        name: account.name,
        emailOrMobile: account.email,
        role: "doctor",
      });
      setIsSubmitting(false);
      router.push("/doctor/dashboard");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        id="doctor-login-identifier"
        label="Email / Mobile"
        placeholder="Login with your registered email or mobile"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={errors.identifier}
        autoComplete="username"
      />
      <TextField
        id="doctor-login-password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      {errors.form && (
        <p className="rounded-lg bg-[var(--urgent-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--urgent-deep)]">
          {errors.form}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login"}
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        New to Schedula?{" "}
        <Link href="/doctor/register" className="font-semibold text-[var(--brand-deep)]">
          Register as a doctor
        </Link>
      </p>
    </form>
  );
}