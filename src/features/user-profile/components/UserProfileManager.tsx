"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import Button from "@/components/ui/Button";

import {
  getBookingsByPatientId,
} from "@/lib/bookings-store";

import {
  getAllPrescriptions,
} from "@/lib/prescriptions-store";

import {
  getSession,
} from "@/lib/storage";

import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/user-profile-store";

import type {
  UserProfile,
} from "@/types/user-profile";

export default function UserProfileManager() {
  const [
    profile,
    setProfile,
  ] = useState<UserProfile | null>(
    null,
  );

  const [
    userName,
    setUserName,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    stats,
    setStats,
  ] = useState({
    prescriptions: 0,
    completedAppointments: 0,
    testReports: 0,
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (
        !session ||
        session.role !== "patient"
      ) {
        setIsLoading(false);
        return;
      }

      const loadedProfile =
        getUserProfile(session.id);

      const bookings =
        getBookingsByPatientId(
          session.id,
        );

      const prescriptions =
        getAllPrescriptions();

      const completedAppointments =
        bookings.filter(
          (booking) =>
            booking.status ===
            "completed",
        ).length;

      const userPrescriptions =
        prescriptions.filter(
          (prescription) =>
            prescription.patientId ===
              session.id ||
            bookings.some(
              (booking) =>
                booking.id ===
                prescription.appointmentId,
            ),
        );

      setProfile(
        loadedProfile,
      );

      setUserName(
        session.name ?? "",
      );

      setStats({
        prescriptions:
          userPrescriptions.length,

        completedAppointments,

        /*
         * There is currently no
         * test-report data model
         * in the project.
         */
        testReports: 0,
      });

      setIsLoading(false);
    });
  }, []);

  function updateField<
    Key extends keyof UserProfile,
  >(
    field: Key,
    value: UserProfile[Key],
  ) {
    setProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });

    setMessage(null);
  }

  function handleSave() {
    if (!profile) {
      return;
    }

    setIsSaving(true);

    saveUserProfile(profile);

    setMessage(
      "Profile saved successfully.",
    );

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--brand-soft)]">
            <span className="size-5 animate-pulse rounded-full bg-[var(--brand)]" />
          </div>

          <p className="mt-4 text-sm font-medium text-[var(--muted)]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
            S
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]">
            Patient account required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Please log in with a patient account to manage your profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block"
          >
            <Button>
              Log in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-7">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
            Patient profile
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Keep your personal and health information up to date so your
            appointment records stay complete.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
                {getInitials(userName)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[var(--ink)]">
                  {userName || "Patient"}
                </p>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Your saved health and contact details
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--canvas)] px-3.5 py-2.5">
              <p className="text-xs font-medium text-[var(--muted)]">
                Profile information
              </p>

              <p className="mt-0.5 text-xs font-semibold text-[var(--ink)]">
                Stored locally in this demo
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Prescriptions"
            value={stats.prescriptions}
            description="Available in your records"
          />

          <StatCard
            label="Completed appointments"
            value={
              stats.completedAppointments
            }
            description="Finished consultations"
          />

          <StatCard
            label="Test reports"
            value={stats.testReports}
            description="Reports currently recorded"
          />
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Personal details"
              title="Personal Information"
              description="Basic information used for your appointment records."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={userName}
                disabled
              />

              <Field
                label="Date of birth"
                type="date"
                value={profile.dateOfBirth}
                onChange={(value) =>
                  updateField(
                    "dateOfBirth",
                    value,
                  )
                }
              />

              <SelectField
                label="Gender"
                value={profile.gender}
                onChange={(value) =>
                  updateField(
                    "gender",
                    value,
                  )
                }
                options={[
                  "",
                  "Male",
                  "Female",
                  "Other",
                  "Prefer not to say",
                ]}
              />

              <Field
                label="Phone number"
                type="tel"
                value={profile.phone}
                onChange={(value) =>
                  updateField(
                    "phone",
                    value,
                  )
                }
              />

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Address"
                  value={profile.address}
                  onChange={(value) =>
                    updateField(
                      "address",
                      value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Physical information"
              title="Physical Details"
              description="Basic physical details that can help contextualize your records."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SelectField
                label="Blood group"
                value={
                  profile.bloodGroup
                }
                onChange={(value) =>
                  updateField(
                    "bloodGroup",
                    value,
                  )
                }
                options={[
                  "",
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ]}
              />

              <Field
                label="Height"
                placeholder="Example: 175 cm"
                value={profile.height}
                onChange={(value) =>
                  updateField(
                    "height",
                    value,
                  )
                }
              />

              <Field
                label="Weight"
                placeholder="Example: 70 kg"
                value={profile.weight}
                onChange={(value) =>
                  updateField(
                    "weight",
                    value,
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Health records"
              title="Medical Information"
              description="Keep these details current for more complete appointment records."
            />

            <div className="mt-6 flex flex-col gap-4">
              <TextAreaField
                label="Medical conditions"
                placeholder="List any ongoing medical conditions"
                value={
                  profile.medicalConditions
                }
                onChange={(value) =>
                  updateField(
                    "medicalConditions",
                    value,
                  )
                }
              />

              <TextAreaField
                label="Allergies"
                placeholder="List any known allergies"
                value={profile.allergies}
                onChange={(value) =>
                  updateField(
                    "allergies",
                    value,
                  )
                }
              />

              <TextAreaField
                label="Current medications"
                placeholder="List medicines you are currently taking"
                value={
                  profile.currentMedications
                }
                onChange={(value) =>
                  updateField(
                    "currentMedications",
                    value,
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Coverage"
              title="Insurance Details"
              description="Add your insurance information for reference."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Insurance provider"
                value={
                  profile.insuranceProvider
                }
                onChange={(value) =>
                  updateField(
                    "insuranceProvider",
                    value,
                  )
                }
              />

              <Field
                label="Policy number"
                value={
                  profile.insurancePolicyNumber
                }
                onChange={(value) =>
                  updateField(
                    "insurancePolicyNumber",
                    value,
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <SectionHeader
              eyebrow="Safety information"
              title="Emergency Contact"
              description="Provide a person who can be contacted when necessary."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Field
                label="Contact name"
                value={
                  profile.emergencyContactName
                }
                onChange={(value) =>
                  updateField(
                    "emergencyContactName",
                    value,
                  )
                }
              />

              <Field
                label="Relationship"
                value={
                  profile.emergencyContactRelationship
                }
                onChange={(value) =>
                  updateField(
                    "emergencyContactRelationship",
                    value,
                  )
                }
              />

              <Field
                label="Phone number"
                type="tel"
                value={
                  profile.emergencyContactPhone
                }
                onChange={(value) =>
                  updateField(
                    "emergencyContactPhone",
                    value,
                  )
                }
              />
            </div>
          </section>
        </div>

        <div className="sticky bottom-3 z-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-3 shadow-lg backdrop-blur sm:bottom-5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {message ? (
                <p
                  className="text-sm font-medium text-[var(--success)]"
                  role="status"
                >
                  {message}
                </p>
              ) : (
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Save your latest profile changes when you&apos;re finished.
                </p>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving
                ? "Saving..."
                : "Save profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--line)] pb-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
        {title}
      </h2>

      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">
            {value}
          </p>
        </div>

        <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-deep)]">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (
    value: string,
  ) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--ink)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange?.(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] hover:border-slate-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:cursor-not-allowed disabled:bg-[var(--canvas)] disabled:text-[var(--muted)]"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--ink)]">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] hover:border-slate-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--ink)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm text-[var(--ink)] outline-none transition-colors hover:border-slate-300 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
      >
        <option value="">
          Select
        </option>

        {options
          .filter(
            (option) =>
              option !== "",
          )
          .map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
      </select>
    </label>
  );
}

function getInitials(
  name: string,
): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "S";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ??
        "",
    )
    .join("");
}