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

  createdAt: string;

  /**
   * Updated whenever the appointment
   * changes state or is rescheduled.
   */
  updatedAt?: string;

  /**
   * Number of times the appointment
   * has been rescheduled.
   */
  rescheduleCount?: number;

  /**
   * Optional human-readable reason
   * for the most recent lifecycle action.
   */
  actionReason?: string;
};