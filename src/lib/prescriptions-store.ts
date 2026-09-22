import type {
  Prescription,
} from "@/types/prescription";

import {
  getBookingById,
} from "@/lib/bookings-store";

import {
  createNotification,
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
  return typeof window !==
    "undefined";
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

    return stored.map(
      (prescription) => ({
        ...prescription,
        patientId:
          prescription.patientId ??
          "",
      }),
    );
  } catch {
    return [];
  }
}

function writePrescriptions(
  prescriptions: Prescription[],
) {
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

export function getPrescriptionByAppointmentId(
  appointmentId: string,
): Prescription | undefined {
  return readPrescriptions().find(
    (prescription) =>
      prescription.appointmentId ===
      appointmentId,
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

  const normalized: Prescription =
    {
      ...prescription,

      patientId,

      updatedAt:
        new Date().toISOString(),
    };

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
   * Only the first creation generates
   * a prescription notification.
   *
   * Editing the prescription does not
   * spam the patient with duplicate alerts.
   */
  if (
    existingIndex === -1 &&
    patientId
  ) {
    createNotification({
      userId: patientId,

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