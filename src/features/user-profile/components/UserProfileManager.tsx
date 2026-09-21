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

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: FieldProps & {
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink)]">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="mt-1.5 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm leading-6 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
      />
    </label>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-deep)]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {children}
      </div>
    </section>
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
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
      <p className="text-xs font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

type ProfileStats = {
  prescriptions: number;
  completedAppointments: number;
  testReports: number;
};

function getProfileStats(
  patientId: string,
): ProfileStats {
  const bookings =
    getBookingsByPatientId(
      patientId,
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
          patientId ||
        bookings.some(
          (booking) =>
            booking.id ===
            prescription.appointmentId,
        ),
    );

  /*
   * There is currently no test-report
   * store or test-report data model in
   * the application. Keep this value at
   * zero rather than displaying fabricated
   * report data.
   */
  const testReports = 0;

  return {
    prescriptions:
      userPrescriptions.length,

    completedAppointments,

    testReports,
  };
}

function validateProfile(
  profile: UserProfile,
): string | null {
  if (
    profile.phone.trim() &&
    !/^[0-9+\-\s()]{7,20}$/.test(
      profile.phone.trim(),
    )
  ) {
    return "Please enter a valid phone number.";
  }

  if (
    profile.emergencyContactPhone.trim() &&
    !/^[0-9+\-\s()]{7,20}$/.test(
      profile.emergencyContactPhone.trim(),
    )
  ) {
    return "Please enter a valid emergency contact number.";
  }

  if (
    profile.dateOfBirth &&
    Number.isNaN(
      Date.parse(
        profile.dateOfBirth,
      ),
    )
  ) {
    return "Please enter a valid date of birth.";
  }

  if (
    profile.dateOfBirth &&
    new Date(
      `${profile.dateOfBirth}T00:00:00`,
    ) > new Date()
  ) {
    return "Date of birth cannot be in the future.";
  }

  return null;
}

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
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    stats,
    setStats,
  ] = useState<ProfileStats>({
    prescriptions: 0,
    completedAppointments: 0,
    testReports: 0,
  });

  function refreshStats() {
    const session =
      getSession();

    if (
      !session ||
      session.role !== "patient"
    ) {
      return;
    }

    setStats(
      getProfileStats(
        session.id,
      ),
    );
  }

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

      setProfile(
        loadedProfile,
      );

      setUserName(
        session.name ?? "",
      );

      setStats(
        getProfileStats(
          session.id,
        ),
      );

      setIsLoading(false);
    });

    function handleBookingsUpdated() {
      refreshStats();
    }

    function handlePrescriptionsUpdated() {
      refreshStats();
    }

    window.addEventListener(
      "schedula:bookings-updated",
      handleBookingsUpdated,
    );

    window.addEventListener(
      "schedula:prescriptions-updated",
      handlePrescriptionsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleBookingsUpdated,
      );

      window.removeEventListener(
        "schedula:prescriptions-updated",
        handlePrescriptionsUpdated,
      );
    };
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
    setError(null);
  }

  function handleSave() {
    if (!profile) {
      return;
    }

    setError(null);
    setMessage(null);

    const validationError =
      validateProfile(
        profile,
      );

    if (validationError) {
      setError(
        validationError,
      );

      return;
    }

    setIsSaving(true);

    const savedProfile =
      saveUserProfile(
        profile,
      );

    setProfile(
      savedProfile,
    );

    setMessage(
      "Profile saved successfully.",
    );

    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--muted)] sm:px-8">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-8">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
            S
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[var(--ink)]">
            Patient account required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Please log in with a patient
            account to manage your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[var(--canvas)]">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8 sm:py-9">
        <header className="border-b border-[var(--line)] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                {userName
                  .split(" ")
                  .filter(Boolean)
                  .map(
                    (part) =>
                      part[0],
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() ||
                  "U"}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                  Patient profile
                </p>

                <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-[var(--ink)]">
                  {userName ||
                    "My Profile"}
                </h1>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Keep your personal and health
                  information up to date.
                </p>
              </div>
            </div>

            {message && (
              <div
                className="rounded-lg border border-[var(--success)]/20 bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]"
                role="status"
              >
                {message}
              </div>
            )}
          </div>

          {error && (
            <div
              className="mt-4 rounded-lg border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3 py-2.5 text-sm font-medium text-[var(--urgent-deep)]"
              role="alert"
            >
              {error}
            </div>
          )}
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Prescriptions"
            value={
              stats.prescriptions
            }
            description="Available prescriptions"
          />

          <StatCard
            label="Completed appointments"
            value={
              stats.completedAppointments
            }
            description="Visits completed"
          />

          <StatCard
            label="Test reports"
            value={
              stats.testReports
            }
            description="Reports available"
          />
        </section>

        <div className="mt-6 space-y-4">
          <Section
            eyebrow="Personal"
            title="Personal information"
            description="Basic information used for your patient profile."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Date of birth"
                type="date"
                value={
                  profile.dateOfBirth
                }
                onChange={(value) =>
                  updateField(
                    "dateOfBirth",
                    value,
                  )
                }
              />

              <Field
                label="Gender"
                value={
                  profile.gender
                }
                onChange={(value) =>
                  updateField(
                    "gender",
                    value,
                  )
                }
                placeholder="e.g. Male, Female"
              />

              <Field
                label="Phone"
                value={
                  profile.phone
                }
                onChange={(value) =>
                  updateField(
                    "phone",
                    value,
                  )
                }
                placeholder="Your phone number"
              />

              <div className="sm:col-span-2">
                <TextAreaField
                  label="Address"
                  value={
                    profile.address
                  }
                  onChange={(value) =>
                    updateField(
                      "address",
                      value,
                    )
                  }
                  placeholder="Your residential address"
                  rows={2}
                />
              </div>
            </div>
          </Section>

          <Section
            eyebrow="Health"
            title="Physical information"
            description="Basic physical information that may help during consultations."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
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
                placeholder="e.g. O+"
              />

              <Field
                label="Height"
                value={
                  profile.height
                }
                onChange={(value) =>
                  updateField(
                    "height",
                    value,
                  )
                }
                placeholder="e.g. 170 cm"
              />

              <Field
                label="Weight"
                value={
                  profile.weight
                }
                onChange={(value) =>
                  updateField(
                    "weight",
                    value,
                  )
                }
                placeholder="e.g. 65 kg"
              />
            </div>
          </Section>

          <Section
            eyebrow="Medical"
            title="Medical information"
            description="Keep important health information available for your doctors."
          >
            <div className="space-y-4">
              <TextAreaField
                label="Medical conditions"
                value={
                  profile.medicalConditions
                }
                onChange={(value) =>
                  updateField(
                    "medicalConditions",
                    value,
                  )
                }
                placeholder="List any existing medical conditions"
              />

              <TextAreaField
                label="Allergies"
                value={
                  profile.allergies
                }
                onChange={(value) =>
                  updateField(
                    "allergies",
                    value,
                  )
                }
                placeholder="List known allergies"
              />

              <TextAreaField
                label="Current medications"
                value={
                  profile.currentMedications
                }
                onChange={(value) =>
                  updateField(
                    "currentMedications",
                    value,
                  )
                }
                placeholder="List medicines you currently take"
              />
            </div>
          </Section>

          <Section
            eyebrow="Coverage"
            title="Insurance information"
            description="Add your insurance details if applicable."
          >
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
                placeholder="Provider name"
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
                placeholder="Policy number"
              />
            </div>
          </Section>

          <Section
            eyebrow="Emergency"
            title="Emergency contact"
            description="Someone your care team can contact in an emergency."
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
                placeholder="Full name"
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
                placeholder="e.g. Parent, Spouse"
              />

              <div className="sm:col-span-2">
                <Field
                  label="Contact phone"
                  value={
                    profile.emergencyContactPhone
                  }
                  onChange={(value) =>
                    updateField(
                      "emergencyContactPhone",
                      value,
                    )
                  }
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="sticky bottom-0 z-10 mt-5 border-t border-[var(--line)] bg-[var(--canvas)]/95 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[var(--muted)]">
              Your profile information is saved
              locally to your Schedula account.
            </p>

            <Button
              onClick={
                handleSave
              }
              disabled={
                isSaving
              }
              className="w-full sm:w-auto"
            >
              {isSaving
                ? "Saving..."
                : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}