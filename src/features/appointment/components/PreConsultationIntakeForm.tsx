"use client";

import {
  useState,
  useSyncExternalStore,
} from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import {
  getIntakeByAppointmentId,
  saveIntake,
} from "@/lib/intake-store";

import type {
  PreConsultationIntake,
} from "@/types/intake";

type PreConsultationIntakeFormProps = {
  appointmentId: string;
  patientId: string;
  onSaved?: (
    intake: PreConsultationIntake,
  ) => void;
};

type FormState = {
  primaryConcern: string;
  symptoms: string;
  symptomDuration: string;
  allergies: string;
  currentMedications: string;
  medicalConditions: string;
  additionalNotes: string;
};

const EMPTY_FORM: FormState = {
  primaryConcern: "",
  symptoms: "",
  symptomDuration: "",
  allergies: "",
  currentMedications: "",
  medicalConditions: "",
  additionalNotes: "",
};

function getFormFromIntake(
  intake:
    | PreConsultationIntake
    | undefined,
): FormState {
  if (!intake) {
    return EMPTY_FORM;
  }

  return {
    primaryConcern:
      intake.primaryConcern,

    symptoms:
      intake.symptoms,

    symptomDuration:
      intake.symptomDuration,

    allergies:
      intake.allergies,

    currentMedications:
      intake.currentMedications,

    medicalConditions:
      intake.medicalConditions,

    additionalNotes:
      intake.additionalNotes,
  };
}

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function PreConsultationIntakeForm({
  appointmentId,
  patientId,
  onSaved,
}: PreConsultationIntakeFormProps) {
  const isHydrated =
    useSyncExternalStore(
      subscribe,
      getClientSnapshot,
      getServerSnapshot,
    );

  const existingIntake =
    isHydrated
      ? getIntakeByAppointmentId(
          appointmentId,
          patientId,
        )
      : undefined;

  const [form, setForm] =
    useState<FormState>(
      EMPTY_FORM,
    );

  const [
    hasEdited,
    setHasEdited,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const displayedForm =
    !hasEdited &&
    existingIntake
      ? getFormFromIntake(
          existingIntake,
        )
      : form;

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...(hasEdited
          ? current
          : displayedForm),
        [field]: value,
      }),
    );

    setHasEdited(true);

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  }

  function validateForm(): string {
    if (
      !displayedForm.primaryConcern.trim()
    ) {
      return "Please enter the primary reason for your visit.";
    }

    if (
      !displayedForm.symptoms.trim()
    ) {
      return "Please describe your current symptoms.";
    }

    if (
      !displayedForm.symptomDuration.trim()
    ) {
      return "Please enter how long you have had these symptoms.";
    }

    if (
      !displayedForm.allergies.trim()
    ) {
      return "Please provide your allergy information.";
    }

    if (
      !displayedForm.currentMedications.trim()
    ) {
      return "Please provide your current medication information.";
    }

    if (
      !displayedForm.medicalConditions.trim()
    ) {
      return "Please provide your existing medical condition information.";
    }

    return "";
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );

      return;
    }

    setSaving(true);

    try {
      const savedIntake =
        saveIntake({
          appointmentId,
          patientId,

          symptoms:
            displayedForm.symptoms.trim(),

          primaryConcern:
            displayedForm.primaryConcern.trim(),

          symptomDuration:
            displayedForm.symptomDuration.trim(),

          currentMedications:
            displayedForm.currentMedications.trim(),

          allergies:
            displayedForm.allergies.trim(),

          medicalConditions:
            displayedForm.medicalConditions.trim(),

          additionalNotes:
            displayedForm.additionalNotes.trim(),

          status:
            "submitted",
        });

      setForm(
        getFormFromIntake(
          savedIntake,
        ),
      );

      setHasEdited(true);

      setSuccess(
        "Pre-consultation information saved successfully.",
      );

      onSaved?.(
        savedIntake,
      );
    } catch {
      setError(
        "Unable to save your pre-consultation information. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isHydrated) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-56 rounded bg-[var(--brand-soft)]" />

          <div className="h-4 w-80 max-w-full rounded bg-[var(--brand-soft)]" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-20 rounded-lg bg-[var(--brand-soft)]" />

            <div className="h-20 rounded-lg bg-[var(--brand-soft)]" />
          </div>

          <div className="h-24 rounded-lg bg-[var(--brand-soft)]" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Pre-consultation intake
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Share a few details before your appointment so the doctor can understand your concerns in advance.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="primary-concern"
            label="Primary concern"
            placeholder="e.g. Persistent headaches"
            value={
              displayedForm.primaryConcern
            }
            onChange={(event) =>
              updateField(
                "primaryConcern",
                event.target.value,
              )
            }
          />

          <TextField
            id="symptom-duration"
            label="Symptom duration"
            placeholder="e.g. 3 days"
            value={
              displayedForm.symptomDuration
            }
            onChange={(event) =>
              updateField(
                "symptomDuration",
                event.target.value,
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="symptoms"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Symptoms
          </label>

          <textarea
            id="symptoms"
            rows={4}
            placeholder="Describe your current symptoms..."
            value={
              displayedForm.symptoms
            }
            onChange={(event) =>
              updateField(
                "symptoms",
                event.target.value,
              )
            }
            className="w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="allergies"
            label="Allergies"
            placeholder="e.g. Penicillin, peanuts, or none"
            value={
              displayedForm.allergies
            }
            onChange={(event) =>
              updateField(
                "allergies",
                event.target.value,
              )
            }
          />

          <TextField
            id="current-medications"
            label="Current medications"
            placeholder="List any medicines you currently take"
            value={
              displayedForm.currentMedications
            }
            onChange={(event) =>
              updateField(
                "currentMedications",
                event.target.value,
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="medical-conditions"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Existing medical conditions
          </label>

          <textarea
            id="medical-conditions"
            rows={3}
            placeholder="Mention any existing conditions or write none"
            value={
              displayedForm.medicalConditions
            }
            onChange={(event) =>
              updateField(
                "medicalConditions",
                event.target.value,
              )
            }
            className="w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="additional-notes"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Additional notes
            <span className="ml-1 font-normal text-[var(--muted)]">
              (optional)
            </span>
          </label>

          <textarea
            id="additional-notes"
            rows={4}
            placeholder="Anything else you would like the doctor to know?"
            value={
              displayedForm.additionalNotes
            }
            onChange={(event) =>
              updateField(
                "additionalNotes",
                event.target.value,
              )
            }
            className="w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-[var(--urgent)]/30 bg-[var(--urgent-soft)] px-4 py-3 text-sm font-medium text-[var(--urgent-deep)]"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]"
          >
            {success}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save intake information"}
          </Button>
        </div>
      </form>
    </section>
  );
}