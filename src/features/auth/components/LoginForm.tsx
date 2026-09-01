"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { setSession } from "@/lib/storage";
import { isValidEmailOrMobile, isValidPassword } from "@/lib/utils/validators";

type FieldErrors = {
  emailOrMobile?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleNote, setGoogleNote] = useState(false);
  const [forgotNote, setForgotNote] = useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!isValidEmailOrMobile(emailOrMobile)) {
      nextErrors.emailOrMobile = "Enter a valid email or 10-digit mobile number";
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
      setSession({
        id: `patient-${Date.now()}`,
        name: emailOrMobile.split("@")[0] || "Patient",
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
        id="login-identifier"
        label="Mobile / Email"
        placeholder="Login with mobile or email"
        value={emailOrMobile}
        onChange={(event) => setEmailOrMobile(event.target.value)}
        error={errors.emailOrMobile}
        autoComplete="username"
      />
      <TextField
        id="login-password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[var(--muted)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-[var(--line)] text-[var(--brand)]"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => setForgotNote((value) => !value)}
          className="font-medium text-[var(--urgent-deep)] hover:underline"
        >
          Forgot password?
        </button>
      </div>
      {forgotNote && (
        <p className="-mt-2 text-xs text-[var(--muted)]">
          Password reset isn&apos;t part of this demo yet — this is a
          frontend-only project with simulated login.
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        Or login with
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setGoogleNote(true)}
      >
        Continue with Google
      </Button>
      {googleNote && (
        <p className="text-center text-xs text-[var(--muted)]">
          Google sign-in isn&apos;t wired up in this frontend-only demo — use
          the form above instead.
        </p>
      )}

      <p className="text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[var(--brand-deep)]">
          Sign up
        </Link>
      </p>
    </form>
  );
}