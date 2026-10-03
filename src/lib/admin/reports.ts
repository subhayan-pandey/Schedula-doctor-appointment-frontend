import { getAllBookings } from "@/lib/bookings-store";
import { getAllDoctors } from "@/lib/doctors-store";
import { getPaymentHistory } from "@/lib/payment-store";
import {
  getBookingStatusLabel,
  getBookingStatusTone,
} from "@/lib/booking-status";
import { formatInr } from "@/lib/payments";

import type { Booking, BookingStatus } from "@/types/booking";
import type { PaymentRecord } from "@/types/payment";
import type {
  ReportColumn,
  ReportFilters,
  ReportResult,
  ReportRow,
  ReportSummaryItem,
  ReportType,
} from "@/types/admin/reports";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  appointments: "Appointments report",
  payments: "Payments report",
};

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  type: "appointments",
  from: "",
  to: "",
  kind: "all",
  status: "all",
  search: "",
};

type Option = { value: string; label: string };

/** Filter options for the "type" dropdown, per report. */
export const REPORT_KIND_OPTIONS: Record<ReportType, Option[]> = {
  appointments: [
    { value: "all", label: "All consultation types" },
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-person" },
  ],
  payments: [
    { value: "all", label: "All payment methods" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
  ],
};

export const REPORT_STATUS_OPTIONS: Record<ReportType, Option[]> = {
  appointments: [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "declined", label: "Declined" },
    { value: "missed", label: "Missed" },
  ],
  payments: [
    { value: "all", label: "All statuses" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refund-pending", label: "Refund pending" },
    { value: "refunded", label: "Refunded" },
  ],
};

const APPOINTMENT_COLUMNS: ReportColumn[] = [
  { key: "id", header: "Booking ID", kind: "text", weight: 1.3 },
  { key: "date", header: "Date", kind: "text", weight: 1 },
  { key: "time", header: "Time", kind: "text", weight: 0.8 },
  { key: "patient", header: "Patient", kind: "text", weight: 1.5 },
  { key: "doctor", header: "Doctor", kind: "text", weight: 1.6 },
  { key: "type", header: "Type", kind: "text", weight: 0.9 },
  { key: "status", header: "Status", kind: "text", weight: 0.9 },
  { key: "fee", header: "Fee (INR)", kind: "currency", weight: 0.9 },
];

const PAYMENT_COLUMNS: ReportColumn[] = [
  { key: "id", header: "Payment ID", kind: "text", weight: 1.3 },
  { key: "date", header: "Date", kind: "text", weight: 1 },
  { key: "patient", header: "Patient", kind: "text", weight: 1.4 },
  { key: "doctor", header: "Doctor", kind: "text", weight: 1.5 },
  { key: "method", header: "Method", kind: "text", weight: 0.8 },
  { key: "status", header: "Status", kind: "text", weight: 1 },
  { key: "amount", header: "Amount (INR)", kind: "currency", weight: 1 },
  { key: "reference", header: "Reference", kind: "text", weight: 1.4 },
];

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function dayOf(value?: string): string {
  const day = (value ?? "").slice(0, 10);

  return ISO_DAY.test(day) ? day : "";
}

function withinRange(day: string, from: string, to: string): boolean {
  if (!from && !to) {
    return true;
  }

  // Undated records can't be placed in a range.
  if (!day) {
    return false;
  }

  const lower = from && to && from > to ? to : from;
  const upper = from && to && from > to ? from : to;

  return (!lower || day >= lower) && (!upper || day <= upper);
}

function matchesSearch(search: string, ...fields: (string | undefined)[]) {
  const query = search.trim().toLowerCase();

  return !query || fields.join(" ").toLowerCase().includes(query);
}

function optionLabel(options: Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function describeFilters(filters: ReportFilters): string[] {
  const lines: string[] = [];

  if (filters.from || filters.to) {
    const swap = filters.from && filters.to && filters.from > filters.to;

    lines.push(
      `Date: ${(swap ? filters.to : filters.from) || "any"} to ${
        (swap ? filters.from : filters.to) || "any"
      }`,
    );
  }

  if (filters.kind !== "all") {
    lines.push(
      `${filters.type === "appointments" ? "Type" : "Method"}: ${optionLabel(
        REPORT_KIND_OPTIONS[filters.type],
        filters.kind,
      )}`,
    );
  }

  if (filters.status !== "all") {
    lines.push(
      `Status: ${optionLabel(REPORT_STATUS_OPTIONS[filters.type], filters.status)}`,
    );
  }

  if (filters.search.trim()) {
    lines.push(`Search: "${filters.search.trim()}"`);
  }

  return lines;
}

function inrSummary(label: string, amount: number): ReportSummaryItem {
  return {
    label,
    display: formatInr(amount),
    plain: `INR ${new Intl.NumberFormat("en-IN").format(amount)}`,
  };
}

function countSummary(label: string, count: number): ReportSummaryItem {
  return { label, display: String(count), plain: String(count) };
}

function percentSummary(
  label: string,
  part: number,
  base: number,
): ReportSummaryItem {
  const text = base > 0 ? `${Math.round((part / base) * 100)}%` : "—";

  return { label, display: text, plain: base > 0 ? text : "n/a" };
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

function buildAppointmentsReport(filters: ReportFilters): ReportResult {
  const doctorNames = new Map(
    getAllDoctors().map((doctor) => [doctor.id, doctor.name]),
  );

  const matching = getAllBookings()
    .filter((booking) => {
      const doctorName = doctorNames.get(booking.doctorId) ?? "";

      return (
        withinRange(dayOf(booking.date), filters.from, filters.to) &&
        (filters.kind === "all" || booking.consultationType === filters.kind) &&
        (filters.status === "all" || booking.status === filters.status) &&
        matchesSearch(
          filters.search,
          booking.id,
          booking.patientName,
          doctorName,
        )
      );
    })
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.time.localeCompare(a.time),
    );

  const rows: ReportRow[] = matching.map((booking) => ({
    id: booking.id,
    statusTone: getBookingStatusTone(booking.status),
    cells: {
      id: booking.id,
      date: booking.date,
      time: booking.time,
      patient: booking.patientName,
      doctor: doctorNames.get(booking.doctorId) ?? "Unknown doctor",
      type: booking.consultationType === "online" ? "Online" : "In-person",
      status: getBookingStatusLabel(booking.status),
      fee: booking.amountInr ?? 0,
    },
  }));

  const count = (status: BookingStatus) =>
    matching.filter((booking) => booking.status === status).length;

  const completed = count("completed");
  const cancelled = count("cancelled");
  const resolved = completed + cancelled + count("declined") + count("missed");

  const summary: ReportSummaryItem[] = [
    countSummary("Total appointments", matching.length),
    countSummary("Completed", completed),
    countSummary("Cancelled", cancelled),
    countSummary("Upcoming / confirmed", count("upcoming") + count("confirmed")),
    countSummary("Pending", count("pending")),
    countSummary("Missed / declined", count("missed") + count("declined")),
    countSummary(
      "Online",
      matching.filter((b) => b.consultationType === "online").length,
    ),
    countSummary(
      "In-person",
      matching.filter((b) => b.consultationType === "in-person").length,
    ),
    percentSummary("Completion rate (of resolved)", completed, resolved),
  ];

  return {
    type: "appointments",
    title: REPORT_TYPE_LABELS.appointments,
    columns: APPOINTMENT_COLUMNS,
    rows,
    summary,
    filterLines: describeFilters(filters),
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

type PaymentBucket = "paid" | "failed" | "refund-pending" | "refunded";

const PAYMENT_BUCKET_LABELS: Record<PaymentBucket, string> = {
  paid: "Paid",
  failed: "Failed",
  "refund-pending": "Refund pending",
  refunded: "Refunded",
};

const PAYMENT_BUCKET_TONES: Record<
  PaymentBucket,
  "success" | "danger" | "warning" | "neutral"
> = {
  paid: "success",
  failed: "danger",
  "refund-pending": "warning",
  refunded: "neutral",
};

/**
 * Same precedence as the Payments screen (admin-payments.ts): the linked
 * booking's refund fields are more specific than the raw record status.
 */
function paymentBucket(record: PaymentRecord, booking?: Booking): PaymentBucket {
  if (
    record.status === "refunded" ||
    booking?.paymentStatus === "refunded" ||
    booking?.refundStatus === "refunded"
  ) {
    return "refunded";
  }

  if (
    record.status === "refund-processing" ||
    booking?.refundStatus === "requested" ||
    booking?.refundStatus === "approved"
  ) {
    return "refund-pending";
  }

  return record.status === "failed" ? "failed" : "paid";
}

function buildPaymentsReport(filters: ReportFilters): ReportResult {
  const bookingById = new Map(
    getAllBookings().map((booking) => [booking.id, booking]),
  );

  const enriched = getPaymentHistory()
    .map((record) => {
      const booking = record.bookingId
        ? bookingById.get(record.bookingId)
        : undefined;

      return { record, booking, bucket: paymentBucket(record, booking) };
    })
    .filter(
      ({ record, bucket }) =>
        withinRange(dayOf(record.createdAt), filters.from, filters.to) &&
        (filters.kind === "all" || record.method === filters.kind) &&
        (filters.status === "all" || bucket === filters.status) &&
        matchesSearch(
          filters.search,
          record.id,
          record.patientName,
          record.doctorName,
          record.reference,
        ),
    )
    .sort((a, b) => b.record.createdAt.localeCompare(a.record.createdAt));

  const rows: ReportRow[] = enriched.map(({ record, bucket }) => ({
    id: record.id,
    statusTone: PAYMENT_BUCKET_TONES[bucket],
    cells: {
      id: record.id,
      date: dayOf(record.createdAt) || "—",
      patient: record.patientName,
      doctor: record.doctorName,
      method: record.method === "upi" ? "UPI" : "Card",
      status: PAYMENT_BUCKET_LABELS[bucket],
      amount: record.amountInr ?? 0,
      reference: record.reference,
    },
  }));

  const sumWhere = (predicate: (bucket: PaymentBucket) => boolean) =>
    enriched
      .filter(({ bucket }) => predicate(bucket))
      .reduce((total, { record }) => total + (record.amountInr ?? 0), 0);

  const collected = sumWhere((bucket) => bucket !== "failed");
  const refunded = sumWhere((bucket) => bucket === "refunded");

  const count = (bucket: PaymentBucket) =>
    enriched.filter((item) => item.bucket === bucket).length;

  const summary: ReportSummaryItem[] = [
    countSummary("Total payments", enriched.length),
    inrSummary("Collected", collected),
    inrSummary("Refunded", refunded),
    inrSummary("Refund pending", sumWhere((b) => b === "refund-pending")),
    inrSummary("Net revenue", collected - refunded),
    countSummary("Failed attempts", count("failed")),
    countSummary("Paid", count("paid")),
    countSummary("Refund pending (count)", count("refund-pending")),
    countSummary("Refunded (count)", count("refunded")),
  ];

  return {
    type: "payments",
    title: REPORT_TYPE_LABELS.payments,
    columns: PAYMENT_COLUMNS,
    rows,
    summary,
    filterLines: describeFilters(filters),
    generatedAt: new Date().toISOString(),
  };
}

export function buildReport(filters: ReportFilters): ReportResult {
  return filters.type === "payments"
    ? buildPaymentsReport(filters)
    : buildAppointmentsReport(filters);
}

export function hasActiveReportFilters(filters: ReportFilters): boolean {
  return (
    filters.from !== "" ||
    filters.to !== "" ||
    filters.kind !== "all" ||
    filters.status !== "all" ||
    filters.search.trim() !== ""
  );
}
