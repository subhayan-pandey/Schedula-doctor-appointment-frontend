"use client";

import {
  useEffect,
  useState,
} from "react";

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
  ] =
    useState<UserProfile | null>(
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
      const session =
        getSession();

      if (
        !session ||
        session.role !== "patient"
      ) {
        setIsLoading(false);

        return;
      }

      const loadedProfile =
        getUserProfile(
          session.id,
        );

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
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Patient account required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Please log in with a patient
          account to manage your
          profile.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Keep your personal and
          health information up to
          date.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Prescriptions"
          value={stats.prescriptions}
        />

        <StatCard
          label="Completed appointments"
          value={
            stats.completedAppointments
          }
        />

        <StatCard
          label="Test reports"
          value={stats.testReports}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <SectionTitle>
            Personal Information
          </SectionTitle>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <SectionTitle>
            Physical Details
          </SectionTitle>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <SectionTitle>
            Medical Information
          </SectionTitle>

          <div className="mt-5 grid gap-4">
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
          <SectionTitle>
            Insurance Details
          </SectionTitle>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <SectionTitle>
            Emergency Contact
          </SectionTitle>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
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

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--success)]">
          {message}
        </p>

        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving…"
            : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-base font-semibold text-[var(--ink)]">
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
        {value}
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
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
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
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--muted)]"
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
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
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
        className="w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
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
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
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