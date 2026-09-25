import type { Doctor } from "@/types/doctor";

import {
  doctors as seedDoctors,
} from "@/lib/mock-data/doctors";

const KEY =
  "schedula:doctors";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readDoctors(): Doctor[] {
  if (!isBrowser()) {
    return seedDoctors;
  }

  const raw =
    window.localStorage.getItem(
      KEY,
    );

  if (raw) {
    try {
      const parsed =
        JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed as Doctor[];
      }
    } catch {
      // Fall through and reseed.
    }
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(
      seedDoctors,
    ),
  );

  return seedDoctors;
}

function writeDoctors(
  doctors: Doctor[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(
      doctors,
    ),
  );
}

/**
 * Persistence adapter.
 *
 * Redux doctors state is the application source
 * of truth. This function is used for hydration
 * and persistence access.
 */
export function getAllDoctors(): Doctor[] {
  return readDoctors();
}

export function getDoctorById(
  id: string,
): Doctor | undefined {
  return readDoctors().find(
    (doctor) =>
      doctor.id === id,
  );
}

/**
 * Persists a doctor record.
 *
 * Application state should be updated through
 * the doctors Redux slice.
 */
export function addDoctor(
  doctor: Doctor,
): void {
  const doctors =
    readDoctors();

  writeDoctors([
    ...doctors.filter(
      (existing) =>
        existing.id !==
        doctor.id,
    ),
    doctor,
  ]);
}