import type { Slot } from "@/types/slot";
import type {
  WaitlistEntry,
  WaitlistStatus,
} from "@/types/waitlist";

import {
  createPatientNotification,
} from "@/lib/notifications-store";

const KEY = "schedula:waitlist";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readWaitlist(): WaitlistEntry[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is WaitlistEntry =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as WaitlistEntry).id === "string" &&
            typeof (item as WaitlistEntry).patientId === "string" &&
            typeof (item as WaitlistEntry).doctorId === "string" &&
            typeof (item as WaitlistEntry).preferredDate === "string",
        ),
    );
  } catch {
    return [];
  }
}

function writeWaitlist(
  entries: WaitlistEntry[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    KEY,
    JSON.stringify(entries),
  );

  window.dispatchEvent(
    new Event("schedula:waitlist-updated"),
  );
}

export function getAllWaitlistEntries(): WaitlistEntry[] {
  return readWaitlist();
}

export function getWaitlistEntriesForDoctorDate(
  doctorId: string,
  preferredDate: string,
): WaitlistEntry[] {
  return readWaitlist()
    .filter(
      (entry) =>
        entry.doctorId === doctorId &&
        entry.preferredDate === preferredDate &&
        entry.status === "waiting",
    )
    .sort(
      (a, b) =>
        a.position - b.position,
    );
}

export function getWaitlistEntriesByPatient(
  patientId: string,
): WaitlistEntry[] {
  return readWaitlist()
    .filter(
      (entry) =>
        entry.patientId === patientId,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
}

export function addWaitlistEntry({
  patientId,
  doctorId,
  preferredDate,
  preferredTime,
  slotId,
}: {
  patientId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime?: string;
  slotId?: string;
}): WaitlistEntry | null {
  if (
    !patientId ||
    !doctorId ||
    !preferredDate
  ) {
    return null;
  }

  const entries = readWaitlist();

  const duplicate = entries.find(
    (entry) =>
      entry.patientId === patientId &&
      entry.doctorId === doctorId &&
      entry.preferredDate === preferredDate &&
      entry.preferredTime === preferredTime &&
      entry.status === "waiting",
  );

  if (duplicate) {
    return duplicate;
  }

  const sameDoctorDate = entries.filter(
    (entry) =>
      entry.doctorId === doctorId &&
      entry.preferredDate === preferredDate &&
      entry.status === "waiting",
  );

  const now = new Date().toISOString();

  const entry: WaitlistEntry = {
    id: `wl-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    patientId,
    doctorId,
    preferredDate,
    preferredTime,
    slotId,
    status: "waiting",
    position: sameDoctorDate.length + 1,
    createdAt: now,
    updatedAt: now,
  };

  writeWaitlist([
    ...entries,
    entry,
  ]);

  return entry;
}

export function updateWaitlistStatus(
  entryId: string,
  status: WaitlistStatus,
): WaitlistEntry | null {
  const entries = readWaitlist();

  const existing = entries.find(
    (entry) =>
      entry.id === entryId,
  );

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  const updatedEntry: WaitlistEntry = {
    ...existing,
    status,
    updatedAt: now,
    notifiedAt:
      status === "notified"
        ? now
        : existing.notifiedAt,
  };

  writeWaitlist(
    entries.map((entry) =>
      entry.id === entryId
        ? updatedEntry
        : entry,
    ),
  );

  return updatedEntry;
}

export function cancelWaitlistEntry(
  entryId: string,
): WaitlistEntry | null {
  return updateWaitlistStatus(
    entryId,
    "cancelled",
  );
}

export function syncWaitlistAvailability(
  doctorId: string,
  slots: Slot[],
): void {
  if (
    !doctorId ||
    slots.length === 0
  ) {
    return;
  }

  const entries = readWaitlist();

  let changed = false;

  const updatedEntries = entries.map(
    (entry) => {
      if (
        entry.doctorId !== doctorId ||
        entry.status !== "waiting"
      ) {
        return entry;
      }

      const matchingSlot = slots.find(
        (slot) =>
          slot.status === "available" &&
          slot.date === entry.preferredDate &&
          (!entry.preferredTime ||
            slot.time === entry.preferredTime) &&
          (!entry.slotId ||
            slot.id === entry.slotId),
      );

      if (!matchingSlot) {
        return entry;
      }

      changed = true;

      createPatientNotification({
        userId: entry.patientId,
        title: "Waitlist slot available",
        message: `A slot is now available on ${matchingSlot.date} at ${matchingSlot.time}. Open the doctor booking page to book it.`,
        type: "system",
      });

      return {
        ...entry,
        status: "notified" as const,
        slotId: matchingSlot.id,
        notifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
  );

  if (changed) {
    writeWaitlist(updatedEntries);
  }
}