import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge, { type StatusTone } from "@/components/admin/ui/StatusBadge";

import type { RecentAppointment } from "@/lib/admin/dashboard-metrics";
import type { BookingStatus } from "@/types/booking";

function statusTone(status: BookingStatus): StatusTone {
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

const columns: TableColumn<RecentAppointment>[] = [
  {
    key: "patient",
    header: "Patient",
    render: (row) => row.patientName,
  },
  {
    key: "doctor",
    header: "Doctor",
    render: (row) => row.doctorName,
  },
  {
    key: "when",
    header: "Date & time",
    render: (row) => `${row.date} · ${row.time}`,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusBadge label={statusLabel(row.status)} tone={statusTone(row.status)} />
    ),
  },
];

export default function RecentAppointmentsList({
  appointments,
}: {
  appointments: RecentAppointment[];
}) {
  return (
    <Table
      columns={columns}
      rows={appointments}
      keyExtractor={(row) => row.id}
      emptyTitle="No appointments yet"
      emptyDescription="Recent bookings will show up here."
    />
  );
}
