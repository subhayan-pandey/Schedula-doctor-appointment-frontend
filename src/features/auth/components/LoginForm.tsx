"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import { setSession } from "@/lib/storage";

import {
  isValidEmailOrMobile,
  isValidPassword,
} from "@/lib/utils/validators";

type FieldErrors = {
  emailOrMobile?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [emailOrMobile, setEmailOrMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [googleNote, setGoogleNote] =
    useState(false);

  const [forgotNote, setForgotNote] =
    useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!isValidEmailOrMobile(emailOrMobile)) {
      nextErrors.emailOrMobile =
        "Enter a valid email or 10-digit mobile number";
    }

    if (!isValidPassword(password)) {
      nextErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGoogleNote(false);
    setForgotNote(false);

    /*
     * Simulated network delay.
     * This project has no real backend.
     */
    window.setTimeout(() => {
      setSession({
        id: `patient-${Date.now()}`,
        name:
          emailOrMobile.split("@")[0] ||
          "Patient",
        emailOrMobile,
        role: "patient",
      });

      setIsSubmitting(false);

      router.push("/");
    }, 600);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <UserIcon />
          </span>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Patient login
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              Use your registered email or mobile
              number.
            </p>
          </div>
        </div>
      </div>

      <TextField
        id="login-identifier"
        label="Mobile / Email"
        placeholder="you@example.com or 9876543210"
        value={emailOrMobile}
        onChange={(event) => {
          setEmailOrMobile(
            event.target.value,
          );

          if (errors.emailOrMobile) {
            setErrors((current) => ({
              ...current,
              emailOrMobile: undefined,
            }));
          }
        }}
        error={errors.emailOrMobile}
        autoComplete="username"
      />

      <TextField
        id="login-password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);

          if (errors.password) {
            setErrors((current) => ({
              ...current,
              password: undefined,
            }));
          }
        }}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) =>
              setRememberMe(
                event.target.checked,
              )
            }
            className="size-4 rounded border-[var(--line)] accent-[var(--brand)]"
          />

          <span>Remember me</span>
        </label>

        <button
          type="button"
          onClick={() =>
            setForgotNote(
              (value) => !value,
            )
          }
          className="text-left text-sm font-semibold text-[var(--brand-deep)] hover:underline sm:text-right"
        >
          Forgot password?
        </button>
      </div>

      {forgotNote && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-3">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Password reset is not wired into this
            frontend-only demo yet. Use the login
            form above to continue.
          </p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Logging in..."
          : "Login"}
      </Button>

      <div
        className="flex items-center gap-3"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-[var(--line)]" />

        <span className="text-xs font-medium text-[var(--muted)]">
          OR
        </span>

        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => {
          setGoogleNote(true);
          setForgotNote(false);
        }}
        className="w-full"
      >
        <span className="mr-2 inline-grid size-5 place-items-center rounded-full border border-[var(--line)] text-[10px] font-bold text-[var(--brand-deep)]">
          G
        </span>

        Continue with Google
      </Button>

      {googleNote && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-3 text-center">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Google sign-in is not wired up in this
            frontend-only demo. Use the form above
            instead.
          </p>
        </div>
      )}

      <div className="border-t border-[var(--line)] pt-5 text-center">
        <p className="text-sm text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--brand-deep)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" />
      <path
        d="M5.5 20c.8-3.5 3-5.3 6.5-5.3s5.7 1.8 6.5 5.3"
        strokeLinecap="round"
      />
    </svg>
  );
}