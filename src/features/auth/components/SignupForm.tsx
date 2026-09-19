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
  name?: string;
  emailOrMobile?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [emailOrMobile, setEmailOrMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name =
        "Enter your full name";
    }

    if (
      !isValidEmailOrMobile(
        emailOrMobile,
      )
    ) {
      nextErrors.emailOrMobile =
        "Enter a valid email or 10-digit mobile number";
    }

    if (!isValidPassword(password)) {
      nextErrors.password =
        "Password must be at least 6 characters";
    }

    if (
      confirmPassword !== password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match";
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

    /*
     * Simulated network delay.
     * This project has no real backend.
     */
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <UserPlusIcon />
          </span>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Create a patient account
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              Your account lets you browse doctors
              and manage appointments.
            </p>
          </div>
        </div>
      </div>

      <TextField
        id="signup-name"
        label="Full name"
        placeholder="Your full name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);

          if (errors.name) {
            setErrors((current) => ({
              ...current,
              name: undefined,
            }));
          }
        }}
        error={errors.name}
        autoComplete="name"
      />

      <TextField
        id="signup-identifier"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="signup-password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => {
            setPassword(
              event.target.value,
            );

            if (errors.password) {
              setErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }
          }}
          error={errors.password}
          autoComplete="new-password"
        />

        <TextField
          id="signup-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(
              event.target.value,
            );

            if (
              errors.confirmPassword
            ) {
              setErrors((current) => ({
                ...current,
                confirmPassword:
                  undefined,
              }));
            }
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <div className="rounded-xl bg-[var(--canvas)] px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 size-4 shrink-0 text-[var(--brand-deep)]"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="8" />
            <path
              d="M12 10v5"
              strokeLinecap="round"
            />
            <path
              d="M12 7.5h.01"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-xs leading-5 text-[var(--muted)]">
            Use a password with at least 6
            characters for this demo account.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Creating account..."
          : "Create account"}
      </Button>

      <div className="border-t border-[var(--line)] pt-5 text-center">
        <p className="text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--brand-deep)] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}

function UserPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path
        d="M3.5 20c.7-3.5 2.6-5.3 5.5-5.3 2.2 0 3.8 1 4.8 2.9"
        strokeLinecap="round"
      />
      <path
        d="M17 10v6M14 13h6"
        strokeLinecap="round"
      />
    </svg>
  );
}