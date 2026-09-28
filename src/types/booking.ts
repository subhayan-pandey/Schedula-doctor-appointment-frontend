import type { ConsultationType } from "@/types/consultation";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "declined"
  | "missed";

export type PaymentMethod = "card" | "upi";
export type PaymentStatus =
  | "paid"
  | "failed"
  | "refund-requested"
  | "refund-approved"
  | "refunded";
export type RefundStatus = "none" | "eligible" | "requested" | "approved" | "rejected" | "refunded";
export type MissedBy = "patient" | "doctor";

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
  /** INR amount captured at booking time; later fee edits never change it. */
  amountInr?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paymentUpdatedAt?: string;
  moneyDeductedOnFailure?: boolean;
  refundStatus?: RefundStatus;
  refundAmountInr?: number;
  refundReason?: string;
  missedBy?: MissedBy;
  rescheduleProposedBy?: "doctor" | "patient";
  reschedulePendingPatient?: boolean;
};
