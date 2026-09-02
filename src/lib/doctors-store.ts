import type { Doctor } from "@/types/doctor";
import { doctors as seedDoctors } from "@/lib/mock-data/doctors";

const KEY = "schedula:doctors";

function isBrowser() {
  return typeof window !== "undefined";
}

function readDoctors(): Doctor[] {
  if (!isBrowser()) return seedDoctors;
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Doctor[];
    } catch {
      // fall through and reseed if the stored value is corrupted
    }
  }
  window.localStorage.setItem(KEY, JSON.stringify(seedDoctors));
  return seedDoctors;
}

function writeDoctors(doctors: Doctor[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(doctors));
}

/**
 * The doctor catalog patients browse. It starts as the 6 seed doctors, but
 * grows in the browser once real doctors register (see addDoctor) — this is
 * what lets a doctor register, create slots, and immediately be bookable by
 * a patient in the same browser, closing the loop your brief described.
 */
export function getAllDoctors(): Doctor[] {
  return readDoctors();
}

export function getDoctorById(id: string): Doctor | undefined {
  return readDoctors().find((doctor) => doctor.id === id);
}

export function addDoctor(doctor: Doctor): void {
  const doctors = readDoctors();
  writeDoctors([...doctors.filter((existing) => existing.id !== doctor.id), doctor]);
}