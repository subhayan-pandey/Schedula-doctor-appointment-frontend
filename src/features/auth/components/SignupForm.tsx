"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { setSession } from "@/lib/storage";
import { isValidEmailOrMobile, isValidPassword } from "@/lib/utils/validators";

type FieldErrors = {
  name?: string;
  emailOrMobile?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Enter your full name";
    }
    if (!isValidEmailOrMobile(emailOrMobile)) {
      nextErrors.emailOrMobile = "Enter a valid email or 10-digit mobile number";
    }
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
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
      setSession({
        id: `patient-${Date.now()}`,
        name: name.trim(),
        emailOrMobile,
        role: "patient",
      });
      setIsSubmitting(false);
      router.push("/");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        id="signup-name"
        label="Full name"
        placeholder="Your full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        autoComplete="name"
      />
      <TextField
        id="signup-identifier"
        label="Mobile / Email"
        placeholder="Sign up with mobile or email"
        value={emailOrMobile}
        onChange={(event) => setEmailOrMobile(event.target.value)}
        error={errors.emailOrMobile}
        autoComplete="username"
      />
      <TextField
        id="signup-password"
        label="Password"
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />
      <TextField
        id="signup-confirm-password"
        label="Confirm password"
        type="password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand-deep)]">
          Log in
        </Link>
      </p>
    </form>
  );
}