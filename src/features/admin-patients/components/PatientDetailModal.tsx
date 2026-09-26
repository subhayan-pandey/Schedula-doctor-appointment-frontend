import Button from "@/components/ui/Button";

import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/admin/ui/Table";

import { getBookingsByPatientId } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";
import { getInitials } from "@/lib/utils/text";

import type { AdminPatientView } from "@/lib/admin/admin-patients-store";
import type { Booking, BookingStatus } from "@/types/booking";

type PatientDetailModalProps = {
  patient: AdminPatientView | null;
  open: boolean;
  onClose: () => void;
  onRequestToggleActive: (patient: AdminPatientView) => void;
};

function statusTone(
  status: BookingStatus,
): "success" | "brand" | "warning" | "danger" | "neutral" {
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

function statusLabel(status: BookingStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const historyColumns: TableColumn<Booking>[] = [
  {
    key: "doctor",
    header: "Doctor",
    render: (row) => getDoctorById(row.doctorId)?.name ?? "Unknown doctor",
  },
  {
    key: "when",
    header: "Date & time",
    render: (row) => `${row.date} · ${row.time}`,
  },
  {
    key: "type",
    header: "Type",
    render: (row) => (row.consultationType === "online" ? "Online" : "In-person"),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusBadge label={statusLabel(row.status)} tone={statusTone(row.status)} />
    ),
  },
];

export default function PatientDetailModal({
  patient,
  open,
  onClose,
  onRequestToggleActive,
}: PatientDetailModalProps) {
  if (!patient) {
    return null;
  }

  const history = getBookingsByPatientId(patient.id);

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Patient profile">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
            {getInitials(patient.name)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-[var(--ink)]">
              {patient.name}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {patient.emailOrMobile}
            </p>

            <div className="mt-2">
              <StatusBadge
                label={patient.isActive ? "Active" : "Inactive"}
                tone={patient.isActive ? "success" : "neutral"}
                withDot
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Appointment history
          </p>

          <div className="mt-2">
            <Table
              columns={historyColumns}
              rows={history}
              keyExtractor={(row) => row.id}
              emptyTitle="No appointments yet"
              emptyDescription="This patient hasn't booked anything."
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--line)] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onRequestToggleActive(patient)}
            className={
              patient.isActive
                ? "border-[var(--urgent)] text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                : undefined
            }
          >
            {patient.isActive ? "Deactivate patient" : "Activate patient"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
