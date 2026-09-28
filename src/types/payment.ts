import type { PaymentMethod } from "@/types/booking";

export type PaymentRecord = {
  id: string;
  bookingId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  amountInr: number;
  method: PaymentMethod;
  status: "paid" | "failed" | "refund-processing" | "refunded";
  reference: string;
  createdAt: string;
};
