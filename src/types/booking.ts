import type { ConsultationType } from "@/types/consultation";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "declined"
  | "missed";

export type Booking = {
  id: string;
  doctorId: string;
  slotId: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: BookingStatus;
  consultationType: ConsultationType;
  createdAt: string;
  updatedAt?: string;
  rescheduleCount?: number;
  actionReason?: string;
};