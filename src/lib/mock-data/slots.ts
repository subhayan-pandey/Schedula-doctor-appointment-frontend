import type { Slot } from "@/types/slot";
import { getNextDays, toISODate } from "@/lib/utils/date";

const MORNING_TIMES = [
  "09:00 AM - 09:15 AM",
  "09:30 AM - 09:45 AM",
  "10:00 AM - 10:15 AM",
  "10:30 AM - 10:45 AM",
  "11:00 AM - 11:15 AM",
  "11:30 AM - 11:45 AM",
  "12:00 PM - 12:15 PM",
];

const EVENING_TIMES = [
  "04:00 PM - 04:15 PM",
  "04:30 PM - 04:45 PM",
  "05:00 PM - 05:15 PM",
  "05:30 PM - 05:45 PM",
];

const DAYS_AHEAD = 6;

/**
 * Deterministically seeds a doctor's slot calendar. This is the "doctor has
 * already created these slots" starting point — once a patient books one, or
 * a doctor edits their availability (Phase 9), the localStorage copy takes
 * over and this function is no longer consulted for that doctor.
 */
export function buildSeedSlots(doctorId: string): Slot[] {
  const days = getNextDays(DAYS_AHEAD);
  const slots: Slot[] = [];

  days.forEach((day, dayIndex) => {
    const date = toISODate(day);

    MORNING_TIMES.forEach((time, timeIndex) => {
      slots.push({
        id: `${doctorId}-${date}-morning-${timeIndex}`,
        doctorId,
        date,
        time,
        period: "Morning",
        status: (dayIndex + timeIndex) % 5 === 0 ? "booked" : "available",
      });
    });

    EVENING_TIMES.forEach((time, timeIndex) => {
      slots.push({
        id: `${doctorId}-${date}-evening-${timeIndex}`,
        doctorId,
        date,
        time,
        period: "Evening",
        status: (dayIndex + timeIndex) % 6 === 0 ? "unavailable" : "available",
      });
    });
  });

  return slots;
}