import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import { getBookingStatusLabel, getBookingStatusTone } from "@/lib/booking-status";

import type { RecentAppointment } from "@/lib/admin/dashboard-metrics";

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
      <StatusBadge
        label={getBookingStatusLabel(row.status)}
        tone={getBookingStatusTone(row.status)}
      />
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
