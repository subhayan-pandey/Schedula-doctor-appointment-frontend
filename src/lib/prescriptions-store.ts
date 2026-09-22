import type {
  Prescription,
} from "@/types/prescription";

import {
  getBookingById,
} from "@/lib/bookings-store";

import {
  createPatientNotification,
} from "@/lib/notifications-store";

const KEY =
  "schedula:prescriptions";

type StoredPrescription =
  Omit<
    Prescription,
    "patientId"
  > & {
    patientId?: string;
  };

function isBrowser(): boolean {
  return (
    typeof window !==
    "undefined"
  );
}

function normalizePrescription(
  prescription: StoredPrescription,
): Prescription {
  return {
    ...prescription,

    patientId:
      prescription.patientId ??
      "",

    medicines:
      Array.isArray(
        prescription.medicines,
      )
        ? prescription.medicines.map(
            (medicine) => ({
              id:
                medicine.id ||
                `med-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,

              name:
                medicine.name ??
                "",

              dosage:
                medicine.dosage ??
                "",

              duration:
                medicine.duration ??
                "",

              instructions:
                medicine.instructions ??
                "",
            }),
          )
        : [],

    diagnosis:
      prescription.diagnosis ??
      "",

    instructions:
      prescription.instructions ??
      "",

    createdAt:
      prescription.createdAt ||
      new Date().toISOString(),

    updatedAt:
      prescription.updatedAt ||
      prescription.createdAt ||
      new Date().toISOString(),
  };
}

function readPrescriptions(): Prescription[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        KEY,
      );

    if (!raw) {
      return [];
    }

    const stored =
      JSON.parse(
        raw,
      ) as StoredPrescription[];

    if (
      !Array.isArray(
        stored,
      )
    ) {
      return [];
    }

    return stored.map(
      normalizePrescription,
    );
  } catch {
    return [];
  }
}

function writePrescriptions(
  prescriptions: Prescription[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(
      prescriptions,
    ),
  );

  window.dispatchEvent(
    new Event(
      "schedula:prescriptions-updated",
    ),
  );
}

export function getAllPrescriptions(): Prescription[] {
  return readPrescriptions();
}

export function getPrescriptionById(
  prescriptionId: string,
): Prescription | undefined {
  return readPrescriptions().find(
    (prescription) =>
      prescription.id ===
      prescriptionId,
  );
}

export function getPrescriptionByAppointmentId(
  appointmentId: string,
): Prescription | undefined {
  return readPrescriptions().find(
    (prescription) =>
      prescription.appointmentId ===
      appointmentId,
  );
}

export function getPrescriptionsByPatientId(
  patientId: string,
): Prescription[] {
  return readPrescriptions().filter(
    (prescription) =>
      prescription.patientId ===
      patientId,
  );
}

export function getPrescriptionsByDoctorId(
  doctorId: string,
): Prescription[] {
  return readPrescriptions().filter(
    (prescription) =>
      prescription.doctorId ===
      doctorId,
  );
}

export function savePrescription(
  prescription: Prescription,
): Prescription[] {
  const prescriptions =
    readPrescriptions();

  const existingIndex =
    prescriptions.findIndex(
      (item) =>
        item.appointmentId ===
        prescription.appointmentId,
    );

  const booking =
    getBookingById(
      prescription.appointmentId,
    );

  const patientId =
    prescription.patientId ||
    booking?.patientId ||
    "";

  const createdAt =
    existingIndex >= 0
      ? prescriptions[
          existingIndex
        ].createdAt
      : prescription.createdAt ||
        new Date().toISOString();

  const normalized =
    normalizePrescription({
      ...prescription,

      patientId,

      createdAt,

      updatedAt:
        new Date().toISOString(),
    });

  let updated: Prescription[];

  if (
    existingIndex >= 0
  ) {
    updated =
      prescriptions.map(
        (item) =>
          item.appointmentId ===
          normalized.appointmentId
            ? normalized
            : item,
      );
  } else {
    updated = [
      ...prescriptions,
      normalized,
    ];
  }

  writePrescriptions(
    updated,
  );

  /*
   * Notify the patient only when
   * the prescription is created for
   * the first time.
   *
   * Editing an existing prescription
   * must not generate duplicate
   * prescription notifications.
   */
  if (
    existingIndex === -1 &&
    patientId
  ) {
    createPatientNotification({
      userId:
        patientId,

      title:
        "New prescription available",

      message:
        "Your doctor has added a prescription for your completed appointment.",

      type:
        "prescription",

      appointmentId:
        normalized.appointmentId,
    });
  }

  return updated;
}

export function deletePrescription(
  appointmentId: string,
): Prescription[] {
  const updated =
    readPrescriptions().filter(
      (prescription) =>
        prescription.appointmentId !==
        appointmentId,
    );

  writePrescriptions(
    updated,
  );

  return updated;
}