"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";
import { useDispatch } from "react-redux";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import DoctorLoginForm from "@/features/doctor-auth/components/DoctorLoginForm";

import {
  getPatientAccount,
  savePatientAccount,
} from "@/lib/storage";

import {
  login,
} from "@/store/slices/authSlice";

import type { AppDispatch } from "@/store";

import {
  isValidEmailOrMobile,
  isValidPassword,
} from "@/lib/utils/validators";

type Role = "patient" | "doctor";

type FieldErrors = {
  emailOrMobile?: string;
  password?: string;
};

type Mode = "login" | "forgot";

export default function LoginForm() {
  const router = useRouter();
  const dispatch =
    useDispatch<AppDispatch>();

  const [role, setRole] =
    useState<Role>("patient");

  const [mode, setMode] =
    useState<Mode>("login");

  const [emailOrMobile, setEmailOrMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [formError, setFormError] =
    useState("");

  const [successNote, setSuccessNote] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [googleNote, setGoogleNote] =
    useState(false);

  function resetMessages() {
    setErrors({});
    setFormError("");
    setSuccessNote("");
    setGoogleNote(false);
  }

  function switchRole(nextRole: Role) {
    setRole(nextRole);
    setMode("login");
    setEmailOrMobile("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    resetMessages();
  }

  function validateLogin(): boolean {
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
      Object.keys(nextErrors).length ===
      0
    );
  }

  function validateForgot(): boolean {
    const nextErrors: FieldErrors = {};

    if (!isValidEmailOrMobile(emailOrMobile)) {
      nextErrors.emailOrMobile =
        "Enter a valid email or 10-digit mobile number";
    }

    if (!isValidPassword(newPassword)) {
      nextErrors.password =
        "Password must be at least 6 characters";
    }

    if (
      confirmPassword !==
      newPassword
    ) {
      nextErrors.password =
        "Passwords do not match";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  }

  function handlePatientLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    resetMessages();

    window.setTimeout(() => {
      const normalizedIdentifier =
        emailOrMobile.trim();

      const account =
        getPatientAccount(
          normalizedIdentifier,
        );

      if (
        account &&
        account.password !== password
      ) {
        setFormError(
          "The password is incorrect. Use Forgot password to reset it.",
        );

        setIsSubmitting(false);
        return;
      }

      const accountId =
        account?.id ??
        `patient-${normalizedIdentifier
          .toLowerCase()
          .replace(
            /[^a-z0-9]/g,
            "-",
          )}`;

      const name =
        account?.name ??
        (normalizedIdentifier.split(
          "@",
        )[0] || "Patient");

      if (!account) {
        savePatientAccount({
          id: accountId,
          name,
          emailOrMobile:
            normalizedIdentifier,
          password,
        });
      }

      dispatch(
        login({
          id: accountId,
          name,
          emailOrMobile:
            normalizedIdentifier,
          role: "patient",
        }),
      );

      setIsSubmitting(false);

      router.push("/");
    }, 600);
  }

  function handleForgotPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForgot()) {
      return;
    }

    setIsSubmitting(true);
    resetMessages();

    window.setTimeout(() => {
      if (role === "patient") {
        const account =
          getPatientAccount(
            emailOrMobile,
          );

        if (!account) {
          setFormError(
            "No patient account was found with these details.",
          );

          setIsSubmitting(false);
          return;
        }

        savePatientAccount({
          ...account,
          password: newPassword,
        });
      }

      setSuccessNote(
        "Your password has been reset. You can now log in with the new password.",
      );

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
      setMode("login");
    }, 600);
  }

  if (mode === "forgot") {
    return (
      <form
        onSubmit={
          handleForgotPassword
        }
        noValidate
        className="flex flex-col gap-5"
      >
        <RoleToggle
          role={role}
          onChange={switchRole}
        />

        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--ink)]">
            Reset your password
          </p>

          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
            Enter your registered email or mobile
            number and choose a new password.
          </p>
        </div>

        <TextField
          id="forgot-identifier"
          label="Mobile / Email"
          placeholder="you@example.com or 9876543210"
          value={emailOrMobile}
          onChange={(event) => {
            setEmailOrMobile(
              event.target.value,
            );

            if (
              errors.emailOrMobile
            ) {
              setErrors((current) => ({
                ...current,
                emailOrMobile:
                  undefined,
              }));
            }

            setFormError("");
          }}
          error={
            errors.emailOrMobile
          }
          autoComplete="username"
        />

        <TextField
          id="forgot-new-password"
          label="New password"
          type="password"
          placeholder="Create a new password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(
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
          id="forgot-confirm-password"
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(
              event.target.value,
            );

            if (errors.password) {
              setErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }
          }}
          autoComplete="new-password"
        />

        {formError && (
          <div
            className="rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3"
            role="alert"
          >
            <p className="text-sm leading-5 text-[var(--urgent-deep)]">
              {formError}
            </p>
          </div>
        )}

        {successNote && (
          <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-3.5 py-3">
            <p className="text-sm leading-5 text-[var(--success)]">
              {successNote}
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
            ? "Resetting password..."
            : "Reset password"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode("login");
            resetMessages();
          }}
          className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
        >
          Back to login
        </button>
      </form>
    );
  }

  if (role === "doctor") {
    return (
      <div className="flex flex-col gap-5">
        <RoleToggle
          role={role}
          onChange={switchRole}
        />

        <DoctorLoginForm
          onForgotPassword={() => {
            setMode("forgot");
            resetMessages();
          }}
        />

        <div className="border-t border-[var(--line)] pt-5 text-center">
          <p className="text-sm text-[var(--muted)]">
            Looking for patient login?{" "}
            <button
              type="button"
              onClick={() =>
                switchRole("patient")
              }
              className="font-semibold text-[var(--brand-deep)] hover:underline"
            >
              Switch to patient
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handlePatientLogin}
      noValidate
      className="flex flex-col gap-5"
    >
      <RoleToggle
        role={role}
        onChange={switchRole}
      />

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
              emailOrMobile:
                undefined,
            }));
          }

          setFormError("");
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
          setPassword(
            event.target.value,
          );

          if (errors.password) {
            setErrors((current) => ({
              ...current,
              password: undefined,
            }));
          }

          setFormError("");
        }}
        error={errors.password}
        autoComplete="current-password"
      />

      {formError && (
        <div
          className="rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3"
          role="alert"
        >
          <p className="text-sm leading-5 text-[var(--urgent-deep)]">
            {formError}
          </p>
        </div>
      )}

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
          onClick={() => {
            setMode("forgot");
            resetMessages();
          }}
          className="text-left text-sm font-semibold text-[var(--brand-deep)] hover:underline sm:text-right"
        >
          Forgot password?
        </button>
      </div>

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
          setFormError("");
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

function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-1.5">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChange("patient")}
          className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            role === "patient"
              ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          Patient
        </button>

        <button
          type="button"
          onClick={() => onChange("doctor")}
          className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            role === "doctor"
              ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          Doctor
        </button>
      </div>
    </div>
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