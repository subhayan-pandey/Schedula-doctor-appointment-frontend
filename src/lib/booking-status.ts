import type { Booking, BookingStatus } from "@/types/booking";

export type BookingStatusTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger";

export function getBookingStatusLabel(status: BookingStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getBookingStatusTone(status: BookingStatus): BookingStatusTone {
  switch (status) {
    case "completed":
      return "success";
    case "upcoming":
    case "confirmed":
      return "brand";
    case "pending":
      return "warning";
    case "cancelled":
    case "declined":
    case "missed":
      return "danger";
    default:
      return "neutral";
  }
}

/**
 * NOTE: found while building Phase 3B — rescheduleBooking() in
 * src/lib/bookings-store.ts (and the underlying updateAppointment
 * reducer in src/store/slices/appointmentsSlice.ts) update slotId/
 * date/time but never increment rescheduleCount. So this will
 * currently always be false in practice, even for a booking that WAS
 * rescheduled through the real patient-facing flow. Left as-is
 * deliberately — that reducer looked like active work-in-progress
 * rather than something to change as a side effect of an admin
 * screen. Wiring rescheduleCount to actually increment is a small,
 * separate change if you want it.
 */
export function isBookingRescheduled(booking: Booking): boolean {
  return (booking.rescheduleCount ?? 0) > 0;
}
