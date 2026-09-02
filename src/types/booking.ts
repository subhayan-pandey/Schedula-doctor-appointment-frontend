export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
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

  createdAt: string;
};