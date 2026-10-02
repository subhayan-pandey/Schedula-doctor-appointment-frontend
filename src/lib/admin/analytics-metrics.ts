import { getAllBookings } from "@/lib/bookings-store";
import { getPaymentHistory } from "@/lib/payment-store";
import { getAllPatientAccounts } from "@/lib/admin/admin-patients-store";
import { getAllDoctorsForAdmin } from "@/lib/admin/admin-doctors";
import { toISODate } from "@/lib/utils/date";

import type {
  AdminAnalytics,
  AnalyticsGranularity,
  AnalyticsRangeInput,
  CountItem,
  TrendBucket,
  TrendSeries,
} from "@/types/admin/analytics";
import type { Booking, BookingStatus } from "@/types/booking";
import type { PaymentRecord } from "@/types/payment";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

type DatedValue = { day: string; value: number };

/* ------------------------------------------------------------------ */
/* Date helpers (string-based, same convention as AdminPaymentsList)   */
/* ------------------------------------------------------------------ */

function dayOf(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const day = value.slice(0, 10);

  return ISO_DAY.test(day) ? day : null;
}

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function addDaysIso(iso: string, days: number): string {
  const date = parseIso(iso);

  date.setDate(date.getDate() + days);

  return toISODate(date);
}

function diffDays(fromIso: string, toIso: string): number {
  const ms = parseIso(toIso).getTime() - parseIso(fromIso).getTime();

  return Math.round(ms / 86_400_000);
}

function mondayOf(iso: string): string {
  const date = parseIso(iso);

  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));

  return toISODate(date);
}

/* ------------------------------------------------------------------ */
/* Range + bucketing                                                   */
/* ------------------------------------------------------------------ */

const PRESET_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

function resolveRange(
  input: AnalyticsRangeInput,
  knownDays: string[],
  today: string,
): { from: string; to: string } | null {
  const presetDays = PRESET_DAYS[input.preset];

  if (presetDays) {
    return { from: addDaysIso(today, -(presetDays - 1)), to: today };
  }

  const sorted = [...knownDays].sort();
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];

  const customFrom =
    input.preset === "custom" && input.from && ISO_DAY.test(input.from)
      ? input.from
      : undefined;
  const customTo =
    input.preset === "custom" && input.to && ISO_DAY.test(input.to)
      ? input.to
      : undefined;

  // "All time" (and an open-ended custom range) runs through today at
  // least, so upcoming appointments are included.
  const defaultTo = latest ? (latest > today ? latest : today) : undefined;

  const from = customFrom ?? earliest;
  const to = customTo ?? defaultTo;

  if (!from || !to) {
    return null;
  }

  return from <= to ? { from, to } : { from: to, to: from };
}

function pickGranularity(from: string, to: string): AnalyticsGranularity {
  const span = diffDays(from, to) + 1;

  if (span <= 31) {
    return "day";
  }

  if (span <= 140) {
    return "week";
  }

  return "month";
}

function bucketKey(iso: string, granularity: AnalyticsGranularity): string {
  if (granularity === "day") {
    return iso;
  }

  if (granularity === "week") {
    return mondayOf(iso);
  }

  return iso.slice(0, 7);
}

function nextBucketStart(
  iso: string,
  granularity: AnalyticsGranularity,
): string {
  if (granularity === "day") {
    return addDaysIso(iso, 1);
  }

  if (granularity === "week") {
    return addDaysIso(iso, 7);
  }

  const date = parseIso(iso);

  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
}

function describeBucket(
  cursor: string,
  granularity: AnalyticsGranularity,
): TrendBucket {
  const date = parseIso(cursor);
  const key = bucketKey(cursor, granularity);

  if (granularity === "month") {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const shortYear = String(date.getFullYear()).slice(2);

    return {
      key,
      label: `${month} ’${shortYear}`,
      fullLabel: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }

  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const full = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    key,
    label,
    fullLabel: granularity === "week" ? `Week of ${full}` : full,
  };
}

function buildBuckets(
  from: string,
  to: string,
  granularity: AnalyticsGranularity,
): TrendBucket[] {
  const buckets: TrendBucket[] = [];
  const lastKey = bucketKey(to, granularity);

  let cursor =
    granularity === "month"
      ? `${from.slice(0, 7)}-01`
      : granularity === "week"
        ? mondayOf(from)
        : from;

  // Guard against runaway loops on absurd custom ranges.
  for (let guard = 0; guard < 600; guard += 1) {
    const bucket = describeBucket(cursor, granularity);

    buckets.push(bucket);

    if (bucket.key >= lastKey) {
      break;
    }

    cursor = nextBucketStart(cursor, granularity);
  }

  return buckets;
}

function makeAggregator(
  buckets: TrendBucket[],
  granularity: AnalyticsGranularity,
) {
  const indexByKey = new Map(
    buckets.map((bucket, index) => [bucket.key, index]),
  );

  return (items: DatedValue[]): number[] => {
    const values = buckets.map(() => 0);

    items.forEach(({ day, value }) => {
      const index = indexByKey.get(bucketKey(day, granularity));

      if (index !== undefined) {
        values[index] += value;
      }
    });

    return values;
  };
}

function series(id: string, label: string, values: number[]): TrendSeries {
  return { id, label, values };
}

function inRange(day: string | null, from: string, to: string): day is string {
  return day !== null && day >= from && day <= to;
}

function rate(part: number, base: number): number | null {
  return base > 0 ? part / base : null;
}

/* ------------------------------------------------------------------ */
/* Payment status                                                      */
/* ------------------------------------------------------------------ */

type EffectivePaymentStatus = "paid" | "failed" | "refund-pending" | "refunded";

/**
 * Payment records are not always updated when a booking's refund
 * progresses, so (matching src/lib/admin/admin-payments.ts) the linked
 * booking's refund fields take priority over the raw record status.
 */
function effectivePaymentStatus(
  record: PaymentRecord,
  booking?: Booking,
): EffectivePaymentStatus {
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

const PAYMENT_STATUS_LABELS: Record<EffectivePaymentStatus, string> = {
  paid: "Paid",
  failed: "Failed",
  "refund-pending": "Refund pending",
  refunded: "Refunded",
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
  missed: "Missed",
};

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

/**
 * Registration dates: neither PatientAccount nor Doctor carries a
 * createdAt field today, so both are read defensively (the field is
 * honoured as soon as registration starts stamping it). Patients fall
 * back to their earliest booking's createdAt; doctors have no
 * fallback. Anything still undated is reported as "undated" rather than
 * guessed.
 */
function readCreatedAt(entity: object): string | null {
  const value = (entity as { createdAt?: unknown }).createdAt;

  return typeof value === "string" ? dayOf(value) : null;
}

export function computeAdminAnalytics(
  input: AnalyticsRangeInput,
): AdminAnalytics {
  const bookings = getAllBookings();
  const payments = getPaymentHistory();
  const patients = getAllPatientAccounts();
  const doctors = getAllDoctorsForAdmin();

  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));

  // Earliest booking activity per patient (fallback registration date).
  const firstBookingDay = new Map<string, string>();

  bookings.forEach((booking) => {
    const day = dayOf(booking.createdAt);

    if (!day) {
      return;
    }

    const existing = firstBookingDay.get(booking.patientId);

    if (!existing || day < existing) {
      firstBookingDay.set(booking.patientId, day);
    }
  });

  const patientRegDays = patients.map(
    (patient) =>
      readCreatedAt(patient) ?? firstBookingDay.get(patient.id) ?? null,
  );
  const doctorRegDays = doctors.map((doctor) => readCreatedAt(doctor));

  const today = toISODate(new Date());

  const knownDays = [
    ...bookings.map((booking) => dayOf(booking.date)),
    ...payments.map((record) => dayOf(record.createdAt)),
    ...patientRegDays,
    ...doctorRegDays,
  ].filter((day): day is string => day !== null);

  const range = resolveRange(input, knownDays, today);
  const hasAnyData =
    bookings.length + payments.length + patients.length + doctors.length > 0;

  const verificationCounts = {
    approved: doctors.filter((d) => d.verificationStatus === "approved").length,
    pending: doctors.filter((d) => d.verificationStatus === "pending").length,
    rejected: doctors.filter((d) => d.verificationStatus === "rejected").length,
  };
  const activeDoctors = doctors.filter((doctor) => doctor.isActive).length;

  const verification: AdminAnalytics["verification"] = {
    ...verificationCounts,
    active: activeDoctors,
    inactive: doctors.length - activeDoctors,
    totalDoctors: doctors.length,
    approvalRate: rate(
      verificationCounts.approved,
      verificationCounts.approved + verificationCounts.rejected,
    ),
    byStatus: [
      { id: "approved", label: "Approved", value: verificationCounts.approved },
      { id: "pending", label: "Pending", value: verificationCounts.pending },
      { id: "rejected", label: "Rejected", value: verificationCounts.rejected },
    ],
  };

  const emptyTrend = (ids: [string, string][]): TrendSeries[] =>
    ids.map(([id, label]) => series(id, label, []));

  if (!range) {
    return {
      range: null,
      granularity: "day",
      buckets: [],
      appointments: {
        total: 0,
        completed: 0,
        cancelled: 0,
        declined: 0,
        missed: 0,
        completionRate: null,
        cancellationRate: null,
        trend: emptyTrend([
          ["total", "Total"],
          ["completed", "Completed"],
          ["cancelled", "Cancelled"],
        ]),
        byConsultationType: [],
        byStatus: [],
      },
      registrations: {
        patients: 0,
        doctors: 0,
        undatedPatients: patientRegDays.filter((d) => d === null).length,
        undatedDoctors: doctorRegDays.filter((d) => d === null).length,
        trend: emptyTrend([
          ["patients", "Patients"],
          ["doctors", "Doctors"],
        ]),
      },
      revenue: {
        collectedInr: 0,
        refundedInr: 0,
        refundPendingInr: 0,
        netInr: 0,
        failedCount: 0,
        paymentCount: 0,
        trend: emptyTrend([
          ["collected", "Collected"],
          ["refunded", "Refunded"],
        ]),
        byStatus: [],
      },
      verification,
      hasAnyData,
    };
  }

  const { from, to } = range;
  const granularity = pickGranularity(from, to);
  const buckets = buildBuckets(from, to, granularity);
  const aggregate = makeAggregator(buckets, granularity);

  /* ---------------- Appointments (by appointment date) ------------- */

  const rangeBookings = bookings.filter((booking) =>
    inRange(dayOf(booking.date), from, to),
  );

  const statusCount = (status: BookingStatus) =>
    rangeBookings.filter((booking) => booking.status === status).length;

  const completed = statusCount("completed");
  const cancelled = statusCount("cancelled");
  const declined = statusCount("declined");
  const missed = statusCount("missed");
  const resolved = completed + cancelled + declined + missed;

  const bookingDays = (filter?: (booking: Booking) => boolean): DatedValue[] =>
    rangeBookings
      .filter((booking) => (filter ? filter(booking) : true))
      .map((booking) => ({ day: dayOf(booking.date) as string, value: 1 }));

  const appointments: AdminAnalytics["appointments"] = {
    total: rangeBookings.length,
    completed,
    cancelled,
    declined,
    missed,
    completionRate: rate(completed, resolved),
    cancellationRate: rate(cancelled, resolved),
    trend: [
      series("total", "Total", aggregate(bookingDays())),
      series(
        "completed",
        "Completed",
        aggregate(bookingDays((b) => b.status === "completed")),
      ),
      series(
        "cancelled",
        "Cancelled",
        aggregate(bookingDays((b) => b.status === "cancelled")),
      ),
    ],
    byConsultationType: [
      {
        id: "online",
        label: "Online",
        value: rangeBookings.filter((b) => b.consultationType === "online")
          .length,
      },
      {
        id: "in-person",
        label: "In-person",
        value: rangeBookings.filter((b) => b.consultationType === "in-person")
          .length,
      },
    ],
    byStatus: (Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
      (status): CountItem => ({
        id: status,
        label: BOOKING_STATUS_LABELS[status],
        value: statusCount(status),
      }),
    ),
  };

  /* ---------------- Registrations ---------------------------------- */

  const patientRegInRange = patientRegDays.filter((day): day is string =>
    inRange(day, from, to),
  );
  const doctorRegInRange = doctorRegDays.filter((day): day is string =>
    inRange(day, from, to),
  );

  const registrations: AdminAnalytics["registrations"] = {
    patients: patientRegInRange.length,
    doctors: doctorRegInRange.length,
    undatedPatients: patientRegDays.filter((day) => day === null).length,
    undatedDoctors: doctorRegDays.filter((day) => day === null).length,
    trend: [
      series(
        "patients",
        "Patients",
        aggregate(patientRegInRange.map((day) => ({ day, value: 1 }))),
      ),
      series(
        "doctors",
        "Doctors",
        aggregate(doctorRegInRange.map((day) => ({ day, value: 1 }))),
      ),
    ],
  };

  /* ---------------- Revenue (INR) ---------------------------------- */

  const collectedItems: DatedValue[] = [];
  const refundedItems: DatedValue[] = [];
  const statusTotals: Record<EffectivePaymentStatus, number> = {
    paid: 0,
    failed: 0,
    "refund-pending": 0,
    refunded: 0,
  };

  let collectedInr = 0;
  let refundedInr = 0;
  let refundPendingInr = 0;
  let failedCount = 0;
  let paymentCount = 0;

  payments.forEach((record) => {
    const booking = record.bookingId
      ? bookingById.get(record.bookingId)
      : undefined;
    const status = effectivePaymentStatus(record, booking);
    const createdDay = dayOf(record.createdAt);
    const amount = record.amountInr ?? 0;

    if (inRange(createdDay, from, to)) {
      paymentCount += 1;
      statusTotals[status] += 1;

      if (status === "failed") {
        failedCount += 1;
      } else {
        // Anything that isn't a failed attempt was captured at some point.
        collectedInr += amount;
        collectedItems.push({ day: createdDay, value: amount });
      }

      if (status === "refund-pending") {
        refundPendingInr += amount;
      }
    }

    if (status === "refunded") {
      // Refunds are dated by when the booking's payment last changed,
      // falling back to the payment date.
      const refundDay = dayOf(booking?.paymentUpdatedAt) ?? createdDay;

      if (inRange(refundDay, from, to)) {
        const refundAmount = booking?.refundAmountInr ?? amount;

        refundedInr += refundAmount;
        refundedItems.push({ day: refundDay, value: refundAmount });
      }
    }
  });

  const revenue: AdminAnalytics["revenue"] = {
    collectedInr,
    refundedInr,
    refundPendingInr,
    netInr: collectedInr - refundedInr,
    failedCount,
    paymentCount,
    trend: [
      series("collected", "Collected", aggregate(collectedItems)),
      series("refunded", "Refunded", aggregate(refundedItems)),
    ],
    byStatus: (
      Object.keys(PAYMENT_STATUS_LABELS) as EffectivePaymentStatus[]
    ).map(
      (status): CountItem => ({
        id: status,
        label: PAYMENT_STATUS_LABELS[status],
        value: statusTotals[status],
      }),
    ),
  };

  return {
    range,
    granularity,
    buckets,
    appointments,
    registrations,
    revenue,
    verification,
    hasAnyData,
  };
}
