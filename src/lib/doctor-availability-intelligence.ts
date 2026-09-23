import type { Doctor } from "@/types/doctor";
import type { Slot } from "@/types/slot";

import { getSlotsForDoctor } from "@/lib/slots-store";

export type DoctorAvailabilityStatus =
  | "available"
  | "limited"
  | "unavailable";

export type DoctorAvailabilityIntelligence = {
  doctor: Doctor;
  slots: Slot[];
  availableSlots: Slot[];
  bookedSlots: Slot[];
  unavailableSlots: Slot[];
  availableToday: boolean;
  nextAvailableDate?: string;
  nextAvailableSlot?: Slot;
  status: DoctorAvailabilityStatus;
  totalAvailableSlots: number;
  morningAvailableSlots: number;
  eveningAvailableSlots: number;
};

function sortSlots(slots: Slot[]): Slot[] {
  return [...slots].sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return a.time.localeCompare(b.time);
  });
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTodayKey(): string {
  return getDateKey(new Date());
}

function getAvailabilityStatus(
  availableSlots: Slot[],
  totalSlots: number,
): DoctorAvailabilityStatus {
  if (availableSlots.length === 0) {
    return "unavailable";
  }

  if (totalSlots <= 0) {
    return "unavailable";
  }

  const availabilityRatio = availableSlots.length / totalSlots;

  if (availabilityRatio <= 0.25) {
    return "limited";
  }

  return "available";
}

export function getDoctorAvailabilityIntelligence(
  doctor: Doctor,
): DoctorAvailabilityIntelligence {
  const slots = sortSlots(getSlotsForDoctor(doctor.id));

  const availableSlots = slots.filter(
    (slot) => slot.status === "available",
  );

  const bookedSlots = slots.filter(
    (slot) => slot.status === "booked",
  );

  const unavailableSlots = slots.filter(
    (slot) => slot.status === "unavailable",
  );

  const today = getTodayKey();

  const availableToday = availableSlots.some(
    (slot) => slot.date === today,
  );

  const nextAvailableSlot = availableSlots.find(
    (slot) => slot.date >= today,
  );

  const nextAvailableDate = nextAvailableSlot?.date;

  return {
    doctor,
    slots,
    availableSlots,
    bookedSlots,
    unavailableSlots,
    availableToday,
    nextAvailableDate,
    nextAvailableSlot,
    status: getAvailabilityStatus(
      availableSlots,
      slots.length,
    ),
    totalAvailableSlots: availableSlots.length,
    morningAvailableSlots: availableSlots.filter(
      (slot) => slot.period === "Morning",
    ).length,
    eveningAvailableSlots: availableSlots.filter(
      (slot) => slot.period === "Evening",
    ).length,
  };
}

export function getDoctorsAvailabilityIntelligence(
  doctors: Doctor[],
): DoctorAvailabilityIntelligence[] {
  return doctors.map((doctor) =>
    getDoctorAvailabilityIntelligence(doctor),
  );
}

export function getAvailableDoctors(
  doctors: Doctor[],
): DoctorAvailabilityIntelligence[] {
  return getDoctorsAvailabilityIntelligence(doctors).filter(
    (intelligence) =>
      intelligence.status !== "unavailable",
  );
}

export function getNextAvailableDoctor(
  doctors: Doctor[],
): DoctorAvailabilityIntelligence | undefined {
  const availability = getAvailableDoctors(doctors);

  return [...availability].sort((a, b) => {
    const dateA = a.nextAvailableDate ?? "";
    const dateB = b.nextAvailableDate ?? "";

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    return (
      a.totalAvailableSlots -
      b.totalAvailableSlots
    );
  })[0];
}