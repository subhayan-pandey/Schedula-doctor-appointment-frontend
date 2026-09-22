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
  saveDoctorAccount,
} from "@/lib/doctor-account-store";

import { addDoctor } from "@/lib/doctors-store";
import { setSession } from "@/lib/storage";
import { getInitials } from "@/lib/utils/text";

import {
  isValidEmail,
  isValidMobile,
  isValidPassword,
} from "@/lib/utils/validators";

import {
  SPECIALTIES,
  type Specialty,
} from "@/types/doctor";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  experienceYears?: string;
  clinic?: string;
  location?: string;
};

export default function DoctorRegisterForm() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [specialty, setSpecialty] =
    useState<Specialty>(
      SPECIALTIES[0],
    );

  const [experienceYears, setExperienceYears] =
    useState("");

  const [clinic, setClinic] =
    useState("");

  const [location, setLocation] =
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

    if (!isValidEmail(email)) {
      nextErrors.email =
        "Enter a valid email address";
    }

    if (!isValidMobile(phone)) {
      nextErrors.phone =
        "Enter a valid 10-digit mobile number";
    }

    if (!isValidPassword(password)) {
      nextErrors.password =
        "Password must be at least 6 characters";
    }

    if (
      confirmPassword !==
      password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match";
    }

    const experience =
      Number(experienceYears);

    if (
      !experienceYears ||
      Number.isNaN(experience) ||
      experience < 0
    ) {
      nextErrors.experienceYears =
        "Enter years of experience";
    }

    if (clinic.trim().length < 2) {
      nextErrors.clinic =
        "Enter your clinic or hospital name";
    }

    if (location.trim().length < 2) {
      nextErrors.location =
        "Enter your practice location";
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
      const accountId =
        `doctor-${Date.now()}`;

      const trimmedName =
        name.trim();

      const trimmedEmail =
        email.trim();

      const trimmedPhone =
        phone.trim();

      const trimmedClinic =
        clinic.trim();

      const trimmedLocation =
        location.trim();

      const experience =
        Number(experienceYears);

      saveDoctorAccount(
        {
          id: accountId,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          specialty,
          experienceYears:
            experience,
          clinic: trimmedClinic,
          location: trimmedLocation,
        },
        password,
      );

      addDoctor({
        id: accountId,
        name: trimmedName,
        specialty,
        qualification: "MBBS",
        experienceYears:
          experience,
        clinic: trimmedClinic,
        location: trimmedLocation,
        rating: 5,
        reviewsCount: 0,
        patientsCount: 0,
        consultationFee: 500,
        availableToday: true,
        timing: "09:00 AM - 5:00 PM",
        bio: `${trimmedName} is a ${specialty.toLowerCase()} practicing at ${trimmedClinic}, ${trimmedLocation}.`,
        avatarInitials:
          getInitials(
            trimmedName,
          ),
      });

      setSession({
        id: accountId,
        name: trimmedName,
        emailOrMobile:
          trimmedEmail,
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
      className="flex flex-col gap-6"
    >
      <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <DoctorPlusIcon />
          </span>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Join Schedula as a doctor
            </p>

            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              Set up your professional details so
              patients can find and book you.
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-[var(--brand)]" />

          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">
              Account details
            </h2>

            <p className="text-xs text-[var(--muted)]">
              Used to access your doctor account.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <TextField
            id="doctor-register-name"
            label="Full name"
            placeholder="Dr. Your Name"
            value={name}
            onChange={(event) => {
              setName(
                event.target.value,
              );

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

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="doctor-register-email"
              label="Email"
              type="email"
              placeholder="you@clinic.com"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                );

                if (errors.email) {
                  setErrors((current) => ({
                    ...current,
                    email: undefined,
                  }));
                }
              }}
              error={errors.email}
              autoComplete="email"
            />

            <TextField
              id="doctor-register-phone"
              label="Phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(event) => {
                setPhone(
                  event.target.value,
                );

                if (errors.phone) {
                  setErrors((current) => ({
                    ...current,
                    phone: undefined,
                  }));
                }
              }}
              error={errors.phone}
              autoComplete="tel"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="doctor-register-password"
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
                    password:
                      undefined,
                  }));
                }
              }}
              error={errors.password}
              autoComplete="new-password"
            />

            <TextField
              id="doctor-register-confirm-password"
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              value={
                confirmPassword
              }
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value,
                );

                if (
                  errors.confirmPassword
                ) {
                  setErrors(
                    (current) => ({
                      ...current,
                      confirmPassword:
                        undefined,
                    }),
                  );
                }
              }}
              error={
                errors.confirmPassword
              }
              autoComplete="new-password"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-[var(--line)]" />

      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-[var(--brand)]" />

          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">
              Professional details
            </h2>

            <p className="text-xs text-[var(--muted)]">
              Information patients can use when choosing
              a doctor.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="doctor-register-specialty"
                className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
              >
                Specialty
              </label>

              <select
                id="doctor-register-specialty"
                value={specialty}
                onChange={(event) =>
                  setSpecialty(
                    event.target
                      .value as Specialty,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
              >
                {SPECIALTIES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </div>

            <TextField
              id="doctor-register-experience"
              label="Years of experience"
              type="number"
              min={0}
              placeholder="e.g. 8"
              value={
                experienceYears
              }
              onChange={(event) => {
                setExperienceYears(
                  event.target.value,
                );

                if (
                  errors.experienceYears
                ) {
                  setErrors(
                    (current) => ({
                      ...current,
                      experienceYears:
                        undefined,
                    }),
                  );
                }
              }}
              error={
                errors.experienceYears
              }
            />
          </div>

          <TextField
            id="doctor-register-clinic"
            label="Clinic / Hospital"
            placeholder="Name of your clinic or hospital"
            value={clinic}
            onChange={(event) => {
              setClinic(
                event.target.value,
              );

              if (errors.clinic) {
                setErrors((current) => ({
                  ...current,
                  clinic: undefined,
                }));
              }
            }}
            error={errors.clinic}
          />

          <TextField
            id="doctor-register-location"
            label="Location"
            placeholder="City / area you practice in"
            value={location}
            onChange={(event) => {
              setLocation(
                event.target.value,
              );

              if (errors.location) {
                setErrors((current) => ({
                  ...current,
                  location: undefined,
                }));
              }
            }}
            error={errors.location}
          />
        </div>
      </section>

      <div className="rounded-xl bg-[var(--canvas)] px-4 py-3">
        <p className="text-xs leading-5 text-[var(--muted)]">
          Registration is simulated locally in this
          frontend demo. Your professional information
          is also added to the patient-facing doctor
          catalog.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Creating account..."
          : "Create doctor account"}
      </Button>

      <div className="border-t border-[var(--line)] pt-5 text-center">
        <p className="text-sm text-[var(--muted)]">
          Already registered?{" "}
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

function DoctorPlusIcon() {
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
        d="M17 13v5M14.5 15.5h5"
        strokeLinecap="round"
      />
    </svg>
  );
}