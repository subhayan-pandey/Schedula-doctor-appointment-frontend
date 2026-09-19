"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import {
  matchesDoctorAccount,
} from "@/lib/doctor-account-store";

import { setSession } from "@/lib/storage";

import {
  isValidEmailOrMobile,
  isValidPassword,
} from "@/lib/utils/validators";

type FieldErrors = {
  identifier?: string;
  password?: string;
  form?: string;
};

export default function DoctorLoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!isValidEmailOrMobile(identifier)) {
      nextErrors.identifier =
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

    window.setTimeout(() => {
      const account =
        matchesDoctorAccount(
          identifier,
        );

      if (!account) {
        setErrors({
          form:
            "No doctor account found with these details. Register first to continue.",
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

      router.push(
        "/doctor/dashboard",
      );
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
            <DoctorIcon />
          </span>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Doctor login
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              Access your practice dashboard and
              appointment tools.
            </p>
          </div>
        </div>
      </div>

      <TextField
        id="doctor-login-identifier"
        label="Email / Mobile"
        placeholder="Registered email or mobile"
        value={identifier}
        onChange={(event) => {
          setIdentifier(
            event.target.value,
          );

          if (
            errors.identifier ||
            errors.form
          ) {
            setErrors((current) => ({
              ...current,
              identifier:
                undefined,
              form: undefined,
            }));
          }
        }}
        error={errors.identifier}
        autoComplete="username"
      />

      <TextField
        id="doctor-login-password"
        label="Password"
        type="password"
        placeholder="Enter your password"
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
        autoComplete="current-password"
      />

      {errors.form && (
        <div
          className="rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3"
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 size-4 shrink-0 text-[var(--urgent-deep)]"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8" />
              <path
                d="M12 8v4M12 16h.01"
                strokeLinecap="round"
              />
            </svg>

            <p className="text-sm leading-5 text-[var(--urgent-deep)]">
              {errors.form}
            </p>
          </div>
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

      <div className="rounded-xl bg-[var(--canvas)] px-3.5 py-3">
        <p className="text-center text-xs leading-5 text-[var(--muted)]">
          Your doctor account is simulated locally
          for this frontend demo.
        </p>
      </div>

      <div className="border-t border-[var(--line)] pt-5 text-center">
        <p className="text-sm text-[var(--muted)]">
          New to Schedula?{" "}
          <Link
            href="/doctor/register"
            className="font-semibold text-[var(--brand-deep)] hover:underline"
          >
            Register as a doctor
          </Link>
        </p>
      </div>
    </form>
  );
}

function DoctorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M8 4h8v16H8z"
        strokeLinejoin="round"
      />
      <path
        d="M10 9h4M12 7v4"
        strokeLinecap="round"
      />
      <path
        d="M10 15h4"
        strokeLinecap="round"
      />
    </svg>
  );
}