import type {
  PreConsultationIntake,
} from "@/types/intake";

const STORAGE_KEY =
  "schedula:pre-consultation-intakes";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function createId(): string {
  return `intake-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isPreConsultationIntake(
  value: unknown,
): value is PreConsultationIntake {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const intake =
    value as Partial<PreConsultationIntake>;

  return (
    typeof intake.id === "string" &&
    typeof intake.appointmentId ===
      "string" &&
    typeof intake.patientId ===
      "string" &&
    typeof intake.symptoms ===
      "string" &&
    typeof intake.primaryConcern ===
      "string" &&
    typeof intake.symptomDuration ===
      "string" &&
    typeof intake.currentMedications ===
      "string" &&
    typeof intake.allergies ===
      "string" &&
    typeof intake.medicalConditions ===
      "string" &&
    typeof intake.additionalNotes ===
      "string" &&
    (intake.status === "draft" ||
      intake.status === "submitted") &&
    typeof intake.createdAt ===
      "string" &&
    typeof intake.updatedAt ===
      "string" &&
    (intake.submittedAt ===
      undefined ||
      typeof intake.submittedAt ===
        "string")
  );
}

function readIntakes(): PreConsultationIntake[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      isPreConsultationIntake,
    );
  } catch {
    return [];
  }
}

function writeIntakes(
  intakes: PreConsultationIntake[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(intakes),
  );

  window.dispatchEvent(
    new Event(
      "schedula:intakes-updated",
    ),
  );
}

export function getIntakeByAppointmentId(
  appointmentId: string,
  patientId?: string,
): PreConsultationIntake | undefined {
  if (!appointmentId) {
    return undefined;
  }

  return readIntakes().find(
    (intake) =>
      intake.appointmentId ===
        appointmentId &&
      (!patientId ||
        intake.patientId ===
          patientId),
  );
}

export function getIntakesByPatientId(
  patientId: string,
): PreConsultationIntake[] {
  if (!patientId) {
    return [];
  }

  return readIntakes().filter(
    (intake) =>
      intake.patientId === patientId,
  );
}

export type SaveIntakeInput = Omit<
  PreConsultationIntake,
  | "id"
  | "createdAt"
  | "updatedAt"
> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function saveIntake(
  input: SaveIntakeInput,
): PreConsultationIntake {
  const intakes =
    readIntakes();

  const existingIndex =
    intakes.findIndex(
      (intake) =>
        intake.appointmentId ===
          input.appointmentId &&
        intake.patientId ===
          input.patientId,
    );

  const existing =
    existingIndex >= 0
      ? intakes[existingIndex]
      : undefined;

  const now =
    new Date().toISOString();

  const status =
    input.status;

  const savedIntake: PreConsultationIntake =
    {
      id:
        existing?.id ??
        input.id ??
        createId(),

      appointmentId:
        input.appointmentId,

      patientId:
        input.patientId,

      symptoms:
        input.symptoms.trim(),

      primaryConcern:
        input.primaryConcern.trim(),

      symptomDuration:
        input.symptomDuration.trim(),

      currentMedications:
        input.currentMedications.trim(),

      allergies:
        input.allergies.trim(),

      medicalConditions:
        input.medicalConditions.trim(),

      additionalNotes:
        input.additionalNotes.trim(),

      status,

      createdAt:
        existing?.createdAt ??
        input.createdAt ??
        now,

      updatedAt:
        now,

      ...(status ===
      "submitted"
        ? {
            submittedAt:
              input.submittedAt ??
              existing?.submittedAt ??
              now,
          }
        : {}),
    };

  const updatedIntakes =
    [...intakes];

  if (
    existingIndex >= 0
  ) {
    updatedIntakes[
      existingIndex
    ] = savedIntake;
  } else {
    updatedIntakes.push(
      savedIntake,
    );
  }

  writeIntakes(
    updatedIntakes,
  );

  return savedIntake;
}

export function updateIntake(
  intakeId: string,
  updates: Partial<
    Omit<
      PreConsultationIntake,
      | "id"
      | "appointmentId"
      | "patientId"
      | "createdAt"
      | "updatedAt"
    >
  >,
): PreConsultationIntake | null {
  const intakes =
    readIntakes();

  const index =
    intakes.findIndex(
      (intake) =>
        intake.id === intakeId,
    );

  if (index < 0) {
    return null;
  }

  const current =
    intakes[index];

  const updated: PreConsultationIntake =
    {
      ...current,
      ...updates,
      updatedAt:
        new Date().toISOString(),
    };

  if (
    updated.status ===
    "submitted"
  ) {
    updated.submittedAt =
      updates.submittedAt ??
      current.submittedAt ??
      updated.updatedAt;
  }

  if (
    updated.status ===
    "draft"
  ) {
    delete updated.submittedAt;
  }

  intakes[index] =
    updated;

  writeIntakes(
    intakes,
  );

  return updated;
}

export function deleteIntake(
  intakeId: string,
): boolean {
  const intakes =
    readIntakes();

  const filtered =
    intakes.filter(
      (intake) =>
        intake.id !== intakeId,
    );

  if (
    filtered.length ===
    intakes.length
  ) {
    return false;
  }

  writeIntakes(
    filtered,
  );

  return true;
}