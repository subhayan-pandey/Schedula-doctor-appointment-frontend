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

function isBrowser() {
  return typeof window !==
    "undefined";
}

function normalizePrescription(
  prescription: StoredPrescription,
): Prescription {
  return {
    ...prescription,
    patientId:
      prescription.patientId ?? "",
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

    const prescriptions =
      JSON.parse(
        raw,
      ) as StoredPrescription[];

    return prescriptions.map(
      normalizePrescription,
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
    JSON.stringify(prescriptions),
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

  const normalizedPrescription: Prescription =
    {
      ...prescription,

      patientId,

      updatedAt:
        new Date().toISOString(),
    };

  let updated: Prescription[];

  if (existingIndex >= 0) {
    updated = prescriptions.map(
      (item) =>
        item.appointmentId ===
        normalizedPrescription.appointmentId
          ? normalizedPrescription
          : item,
    );
  } else {
    updated = [
      ...prescriptions,
      normalizedPrescription,
    ];
  }

  writePrescriptions(updated);

  /*
   * Notify only when the prescription
   * is created for the first time.
   *
   * Editing an existing prescription
   * does not generate duplicate alerts.
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

      type: "prescription",

      appointmentId:
        normalizedPrescription.appointmentId,
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

  writePrescriptions(updated);

  return updated;
}