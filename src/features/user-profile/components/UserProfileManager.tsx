"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

import { getBookingsByPatientId } from "@/lib/bookings-store";
import { getAllPrescriptions } from "@/lib/prescriptions-store";
import { getSession } from "@/lib/storage";
import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/user-profile-store";

import type { UserProfile } from "@/types/user-profile";

export default function UserProfileManager() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [userName, setUserName] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [stats, setStats] = useState({
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
        getBookingsByPatientId(session.id);

      const prescriptions =
        getAllPrescriptions();

      const completedAppointments =
        bookings.filter(
          (booking) =>
            booking.status === "completed",
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

      setProfile(loadedProfile);
      setUserName(session.name ?? "");

      setStats({
        prescriptions:
          userPrescriptions.length,

        completedAppointments,

        /*
         * There is currently no test-report
         * data model in the project.
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
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-8">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-6"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.2" />
            <path
              d="M5.5 20c.8-3.4 3-5.2 6.5-5.2s5.7 1.8 6.5 5.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Patient account required
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Please log in with a patient
          account to manage your profile.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block"
        >
          <Button>
            Patient login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
              {getInitials(userName)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                Patient profile
              </p>

              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--ink)]">
                {userName || "My Profile"}
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Keep your personal and health
                information up to date.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/appointments">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
              >
                My appointments
              </Button>
            </Link>

            <Link href="/doctors">
              <Button className="w-full sm:w-auto">
                Find a doctor
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section
        aria-label="Profile summary"
        className="mt-5 grid gap-3 sm:grid-cols-3"
      >
        <StatCard
          label="Prescriptions"
          value={stats.prescriptions}
          icon={<PrescriptionIcon />}
        />

        <StatCard
          label="Completed appointments"
          value={stats.completedAppointments}
          icon={<CalendarIcon />}
        />

        <StatCard
          label="Test reports"
          value={stats.testReports}
          icon={<ReportIcon />}
        />
      </section>

      <div className="mt-5 grid gap-5">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <SectionHeader
            eyebrow="Identity"
            title="Personal information"
            description="Basic details used across your Schedula account."
          />

          <div className="border-t border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <SectionHeader
            eyebrow="Measurements"
            title="Physical details"
            description="Optional information that can help doctors understand your profile."
          />

          <div className="border-t border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                label="Blood group"
                value={profile.bloodGroup}
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
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <SectionHeader
            eyebrow="Health"
            title="Medical information"
            description="Keep relevant medical information available for appointments."
          />

          <div className="border-t border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4">
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
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <SectionHeader
            eyebrow="Coverage"
            title="Insurance details"
            description="Store your insurance information for reference."
          />

          <div className="border-t border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <SectionHeader
            eyebrow="Safety"
            title="Emergency contact"
            description="A person Schedula can associate with your emergency information."
          />

          <div className="border-t border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
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
          </div>
        </section>
      </div>

      <div className="sticky bottom-3 z-10 mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-3 shadow-lg backdrop-blur sm:static sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            aria-live="polite"
            className="min-h-5"
          >
            {message ? (
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--success)]">
                <span className="grid size-5 place-items-center rounded-full bg-[var(--success-soft)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    className="size-3"
                    aria-hidden="true"
                  >
                    <path
                      d="m6 12 4 4 8-8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {message}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Your profile is stored locally in
                this frontend demo.
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "PT";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
    <div className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          {icon}
        </div>

        <p className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-[var(--muted)]">
        {label}
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
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 disabled:cursor-not-allowed disabled:bg-[var(--canvas)] disabled:text-[var(--muted)]"
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
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
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
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
      >
        <option value="">Select</option>

        {options
          .filter((option) => option !== "")
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

function PrescriptionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
      />
      <path
        d="M8.5 8h7M8.5 11.5h7M8.5 15h4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        d="M6 20V10M12 20V4M18 20v-7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-label="Loading profile"
    >
      <div className="h-32 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-[var(--canvas)]" />
        <div className="h-28 rounded-2xl bg-[var(--canvas)]" />
        <div className="h-28 rounded-2xl bg-[var(--canvas)]" />
      </div>

      <div className="mt-5 space-y-5">
        <div className="h-72 rounded-2xl bg-[var(--canvas)]" />
        <div className="h-48 rounded-2xl bg-[var(--canvas)]" />
        <div className="h-72 rounded-2xl bg-[var(--canvas)]" />
      </div>
    </div>
  );
}