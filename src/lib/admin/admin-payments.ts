import type { Booking } from "@/types/booking";
import type { PaymentRecord } from "@/types/payment";

/**
 * Same precedence as src/features/payment/components/PaymentHistory.tsx:
 * the linked booking's refund fields are more specific than the raw
 * PaymentRecord status, so they take priority when present.
 */
export function getPaymentDisplayStatus(
  record: PaymentRecord,
  booking?: Booking,
): string {
  if (booking?.paymentStatus === "refunded" || booking?.refundStatus === "refunded") {
    return "Refunded";
  }

  if (booking?.refundStatus === "requested") {
    return "Refund requested";
  }

  if (booking?.refundStatus === "eligible") {
    return "Refund eligible";
  }

  if (record.status === "refund-processing") {
    return "Refund processing";
  }

  return record.status.charAt(0).toUpperCase() + record.status.slice(1);
}

export function getPaymentStatusTone(
  record: PaymentRecord,
  booking?: Booking,
): "success" | "danger" | "warning" | "neutral" {
  const status = getPaymentDisplayStatus(record, booking);

  if (status === "Paid") {
    return "success";
  }

  if (status === "Failed") {
    return "danger";
  }

  if (status === "Refunded") {
    return "neutral";
  }

  // Refund processing / requested / eligible
  return "warning";
}
