export type BookingStatus = "upcoming" | "completed" | "cancelled";

export type Booking = {
  id: string;
  doctorId: string;
  slotId: string;
  patientName: string;
  date: string; // ISO date, e.g. "2026-09-10"
  time: string; // display range, e.g. "09:30 AM - 09:45 AM"
  status: BookingStatus;
  createdAt: string; // ISO timestamp
};