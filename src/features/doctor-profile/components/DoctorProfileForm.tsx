"use client";

import {
  useState,
  type FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import {
  isValidEmail,
  isValidMobile,
} from "@/lib/utils/validators";

import {
  SPECIALTIES,
  type Specialty,
} from "@/types/doctor";

import type { DoctorAccount } from "@/types/doctorAccount";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  experienceYears?: string;
  clinic?: string;
  location?: string;
};

export default function DoctorProfileForm({
  account,
  onCancel,
  onSave,
}: {
  account: DoctorAccount;
  onCancel: () => void;
  onSave: (
    updated: Omit<DoctorAccount, "id">,
  ) => void;
}) {
  const [name, setName] =
    useState(account.name);

  const [email, setEmail] =
    useState(account.email);

  const [phone, setPhone] =
    useState(account.phone);

  const [specialty, setSpecialty] =
    useState<Specialty>(
      account.specialty,
    );

  const [experienceYears, setExperienceYears] =
    useState(
      String(account.experienceYears),
    );

  const [clinic, setClinic] =
    useState(account.clinic);

  const [location, setLocation] =
    useState(account.location);

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [isSaving, setIsSaving] =
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

    setIsSaving(true);

    /*
     * Simulated save delay. The actual data is
     * persisted by the parent manager.
     */
    window.setTimeout(() => {
      onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialty,
        experienceYears:
          Number(experienceYears),
        clinic: clinic.trim(),
        location: location.trim(),
      });

      setIsSaving(false);
    }, 400);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
    >
      <div className="bg-[var(--canvas)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
          Professional profile
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Edit profile
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Update the professional information
          associated with your doctor account.
        </p>
      </div>

      <div className="border-t border-[var(--line)] p-5 sm:p-6">
        <section>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <PersonIcon />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Identity
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Your name and contact details.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            <TextField
              id="profile-name"
              label="Full name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              error={errors.name}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="profile-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                error={errors.email}
              />

              <TextField
                id="profile-phone"
                label="Phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value,
                  )
                }
                error={errors.phone}
              />
            </div>
          </div>
        </section>

        <div className="my-7 border-t border-[var(--line)]" />

        <section>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <MedicalIcon />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Professional details
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Details used in your professional
                doctor listing.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="profile-specialty"
                  className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
                >
                  Specialty
                </label>

                <select
                  id="profile-specialty"
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
                id="profile-experience"
                label="Years of experience"
                type="number"
                min={0}
                value={
                  experienceYears
                }
                onChange={(event) =>
                  setExperienceYears(
                    event.target.value,
                  )
                }
                error={
                  errors.experienceYears
                }
              />
            </div>

            <TextField
              id="profile-clinic"
              label="Clinic / Hospital"
              value={clinic}
              onChange={(event) =>
                setClinic(
                  event.target.value,
                )
              }
              error={errors.clinic}
            />

            <TextField
              id="profile-location"
              label="Location"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              error={errors.location}
            />
          </div>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] bg-[var(--canvas)] p-4 sm:flex-row sm:justify-end sm:p-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving
            ? "Saving..."
            : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function PersonIcon() {
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

function MedicalIcon() {
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