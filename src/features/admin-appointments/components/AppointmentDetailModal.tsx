import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import { getDoctorById } from "@/lib/doctors-store";
import {
  getBookingStatusLabel,
  getBookingStatusTone,
  isBookingRescheduled,
} from "@/lib/booking-status";

import type { Booking } from "@/types/booking";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-[var(--ink)]">{value}</p>
    </div>
  );
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type AppointmentDetailModalProps = {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
};

export default function AppointmentDetailModal({
  booking,
  open,
  onClose,
}: AppointmentDetailModalProps) {
  if (!booking) {
    return null;
  }

  const doctor = getDoctorById(booking.doctorId);
  const rescheduled = isBookingRescheduled(booking);

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Appointment details">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={getBookingStatusLabel(booking.status)}
            tone={getBookingStatusTone(booking.status)}
          />
          <StatusBadge
            label={booking.consultationType === "online" ? "Online" : "In-person"}
            tone="neutral"
          />
          {rescheduled && (
            <StatusBadge
              label={`Rescheduled ×${booking.rescheduleCount}`}
              tone="warning"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailRow label="Patient" value={booking.patientName} />
          <DetailRow
            label="Doctor"
            value={doctor ? `${doctor.name} · ${doctor.specialty}` : "Unknown doctor"}
          />
          <DetailRow label="Date" value={booking.date} />
          <DetailRow label="Time" value={booking.time} />
          <DetailRow
            label="Consultation type"
            value={booking.consultationType === "online" ? "Online" : "In-person"}
          />
          <DetailRow label="Booked on" value={formatDateTime(booking.createdAt)} />
        </div>

        {booking.updatedAt && (
          <DetailRow label="Last updated" value={formatDateTime(booking.updatedAt)} />
        )}

        {booking.actionReason && (
          <DetailRow
            label={
              booking.status === "cancelled" || booking.status === "declined"
                ? "Cancellation reason"
                : "Notes"
            }
            value={booking.actionReason}
          />
        )}

        {rescheduled && (
          <p className="text-xs leading-5 text-[var(--muted)]">
            This appointment has been rescheduled {booking.rescheduleCount} time
            {booking.rescheduleCount === 1 ? "" : "s"}. The date/time above is
            the current slot — the app doesn&apos;t keep a history of
            previous slots, so earlier times aren&apos;t available here.
          </p>
        )}
      </div>
    </Modal>
  );
}
