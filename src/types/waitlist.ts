import type { Slot } from "@/types/slot";

export type WaitlistStatus =
  | "waiting"
  | "notified"
  | "booked"
  | "cancelled";

export type WaitlistEntry = {
  id: string;
  patientId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime?: string;
  slotId?: string;
  status: WaitlistStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
  notifiedAt?: string;
};

export type WaitlistMatch = {
  entry: WaitlistEntry;
  slot: Slot;
};