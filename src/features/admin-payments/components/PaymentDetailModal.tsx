import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import { getPaymentDisplayStatus, getPaymentStatusTone } from "@/lib/admin/admin-payments";
import { formatInr } from "@/lib/payments";

import type { Booking } from "@/types/booking";
import type { PaymentRecord } from "@/types/payment";

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

type PaymentDetailModalProps = {
  record: PaymentRecord | null;
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
};

export default function PaymentDetailModal({
  record,
  booking,
  open,
  onClose,
}: PaymentDetailModalProps) {
  if (!record) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Payment details">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-[var(--ink)]">
            {formatInr(record.amountInr)}
          </p>
          <StatusBadge
            label={getPaymentDisplayStatus(record, booking ?? undefined)}
            tone={getPaymentStatusTone(record, booking ?? undefined)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailRow label="Patient" value={record.patientName} />
          <DetailRow label="Doctor" value={record.doctorName} />
          <DetailRow label="Method" value={record.method.toUpperCase()} />
          <DetailRow label="Reference" value={record.reference} />
          <DetailRow
            label="Paid on"
            value={new Date(record.createdAt).toLocaleString("en-IN")}
          />
        </div>

        {booking ? (
          <div className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Linked appointment
            </p>

            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Date & time" value={`${booking.date} · ${booking.time}`} />
              <DetailRow
                label="Type"
                value={booking.consultationType === "online" ? "Online" : "In-person"}
              />
              <DetailRow
                label="Appointment status"
                value={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              />
            </div>

            {(booking.refundStatus && booking.refundStatus !== "none") && (
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Refund
                </p>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <DetailRow
                    label="Refund status"
                    value={
                      booking.refundStatus.charAt(0).toUpperCase() +
                      booking.refundStatus.slice(1)
                    }
                  />
                  {typeof booking.refundAmountInr === "number" && (
                    <DetailRow
                      label="Refund amount"
                      value={formatInr(booking.refundAmountInr)}
                    />
                  )}
                </div>
                {booking.refundReason && (
                  <div className="mt-3">
                    <DetailRow label="Refund reason" value={booking.refundReason} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            No linked appointment on file for this payment.
          </p>
        )}
      </div>
    </Modal>
  );
}
