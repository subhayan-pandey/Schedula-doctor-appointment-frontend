"use client";

import { useEffect, useState } from "react";

import ErrorState from "@/components/admin/ui/ErrorState";
import LoadingState from "@/components/admin/ui/LoadingState";
import StatCard from "@/components/admin/dashboard/StatCard";
import EmptyState from "@/components/ui/EmptyState";

import BarChart from "@/components/admin/charts/BarChart";
import BreakdownBars from "@/components/admin/charts/BreakdownBars";
import ChartCard from "@/components/admin/charts/ChartCard";
import ChartLegend from "@/components/admin/charts/ChartLegend";
import DonutChart from "@/components/admin/charts/DonutChart";
import LineChart from "@/components/admin/charts/LineChart";
import {
  formatCompactInr,
  formatPercent,
  type ChartSeries,
} from "@/components/admin/charts/chart-utils";

import { computeAdminAnalytics } from "@/lib/admin/analytics-metrics";
import { formatInr } from "@/lib/payments";

import type {
  AdminAnalytics as AdminAnalyticsData,
  AnalyticsRangePreset,
  TrendSeries,
} from "@/types/admin/analytics";

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminAnalyticsData };

const PRESETS: { value: AnalyticsRangePreset; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

const GRANULARITY_LABELS = {
  day: "day",
  week: "week",
  month: "month",
} as const;

const SERIES_COLORS: Record<string, string> = {
  total: "var(--brand)",
  completed: "var(--success)",
  cancelled: "var(--urgent)",
  patients: "var(--brand)",
  doctors: "var(--warning)",
  collected: "var(--success)",
  refunded: "var(--urgent)",
};

const STATUS_COLORS: Record<string, string> = {
  // Appointment statuses
  pending: "var(--warning)",
  confirmed: "var(--brand)",
  upcoming: "var(--brand-deep)",
  completed: "var(--success)",
  cancelled: "var(--urgent)",
  declined: "var(--urgent-deep)",
  missed: "var(--muted)",
  // Consultation type
  online: "var(--brand)",
  "in-person": "var(--warning)",
  // Doctor verification
  approved: "var(--success)",
  rejected: "var(--urgent)",
  // Payments
  paid: "var(--success)",
  failed: "var(--urgent)",
  "refund-pending": "var(--warning)",
  refunded: "var(--muted)",
};

const inputClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

function toChartSeries(items: TrendSeries[]): ChartSeries[] {
  return items.map((item) => ({
    ...item,
    color: SERIES_COLORS[item.id] ?? "var(--brand)",
  }));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function formatRangeDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAnalytics() {
  const [preset, setPreset] = useState<AnalyticsRangePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<ViewState>({ status: "loading" });

  // The stores are client-side (Redux + persistence), so metrics are
  // computed after mount. Deferring to a timeout keeps setState out of the
  // effect body and gives the Loading state a real moment to show.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setView({
          status: "ready",
          data: computeAdminAnalytics({
            preset,
            from: customFrom || undefined,
            to: customTo || undefined,
          }),
        });
      } catch (error) {
        setView({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The analytics could not be calculated.",
        });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [preset, customFrom, customTo, refreshKey]);

  function refresh() {
    setView({ status: "loading" });
    setRefreshKey((key) => key + 1);
  }

  const header = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">Analytics</h1>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Appointments, registrations, revenue and verification across
          Schedula.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div
          className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"
          role="group"
          aria-label="Date range"
        >
          {PRESETS.map((option) => {
            const isActive = option.value === preset;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPreset(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="analytics-from">
              From date
            </label>
            <input
              id="analytics-from"
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(event) => setCustomFrom(event.target.value)}
              className={inputClassName}
            />

            <span className="text-xs text-[var(--muted)]">to</span>

            <label className="sr-only" htmlFor="analytics-to">
              To date
            </label>
            <input
              id="analytics-to"
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(event) => setCustomTo(event.target.value)}
              className={inputClassName}
            />
          </div>
        )}

        <button
          type="button"
          onClick={refresh}
          className="h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  if (view.status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <LoadingState message="Crunching the numbers…" />
      </div>
    );
  }

  if (view.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <ErrorState
          title="Analytics unavailable"
          description={view.message}
          action={
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
            >
              Try again
            </button>
          }
        />
      </div>
    );
  }

  const { data } = view;

  if (!data.hasAnyData) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          title="Nothing to analyse yet"
          description="Analytics will appear once doctors, patients, appointments or payments exist."
        />
      </div>
    );
  }

  const appointmentSeries = toChartSeries(data.appointments.trend);
  const registrationSeries = toChartSeries(data.registrations.trend);
  const revenueSeries = toChartSeries(data.revenue.trend);

  const undatedNote = [
    data.registrations.undatedPatients > 0
      ? `${data.registrations.undatedPatients} patient${data.registrations.undatedPatients === 1 ? "" : "s"}`
      : null,
    data.registrations.undatedDoctors > 0
      ? `${data.registrations.undatedDoctors} doctor${data.registrations.undatedDoctors === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  const consultationSlices = data.appointments.byConsultationType.map(
    (item) => ({ ...item, color: STATUS_COLORS[item.id] }),
  );

  const verificationSlices = data.verification.byStatus.map((item) => ({
    ...item,
    color: STATUS_COLORS[item.id],
  }));

  const rangeLabel = data.range
    ? `${formatRangeDate(data.range.from)} – ${formatRangeDate(data.range.to)}`
    : "No dated activity yet";

  return (
    <div className="flex flex-col gap-6">
      {header}

      <p className="-mt-2 text-xs text-[var(--muted)]">
        Showing {rangeLabel}
        {data.range && ` · grouped by ${GRANULARITY_LABELS[data.granularity]}`}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Appointments"
          value={data.appointments.total}
          iconKey="appointments"
          caption="By appointment date"
        />
        <StatCard
          label="Completion rate"
          value={formatPercent(data.appointments.completionRate)}
          iconKey="appointments"
          caption="Of resolved appointments"
        />
        <StatCard
          label="Cancellation rate"
          value={formatPercent(data.appointments.cancellationRate)}
          iconKey="appointments"
          caption="Of resolved appointments"
        />
        <StatCard
          label="Net revenue"
          value={formatInr(data.revenue.netInr)}
          iconKey="payments"
          caption="Collected minus refunds"
        />
        <StatCard
          label="New patients"
          value={data.registrations.patients}
          iconKey="patients"
          caption="With a known sign-up date"
        />
        <StatCard
          label="Pending verifications"
          value={data.verification.pending}
          iconKey="doctor-verification"
          caption="Right now"
        />
      </div>

      <ChartCard
        title="Appointment trends"
        description="Appointments per period, with completed and cancelled alongside."
        isEmpty={data.appointments.total === 0}
        emptyTitle="No appointments in this period"
        aside={<ChartLegend items={appointmentSeries} />}
      >
        <LineChart
          buckets={data.buckets}
          series={appointmentSeries}
          ariaLabel="Appointments per period: total, completed and cancelled"
        />
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Registration trends"
          description="New patient and doctor sign-ups per period."
          isEmpty={
            sum(registrationSeries[0]?.values ?? []) +
              sum(registrationSeries[1]?.values ?? []) ===
            0
          }
          emptyTitle="No dated registrations in this period"
          emptyDescription={
            undatedNote.length > 0
              ? `${undatedNote.join(" and ")} have no recorded sign-up date, so they can't be placed on the timeline.`
              : "Try a wider date range."
          }
          aside={<ChartLegend items={registrationSeries} />}
          footnote={
            undatedNote.length > 0
              ? `${undatedNote.join(" and ")} have no recorded sign-up date and are not shown. Patients without one are dated by their first booking when possible.`
              : undefined
          }
        >
          <BarChart
            buckets={data.buckets}
            series={registrationSeries}
            ariaLabel="New patient and doctor registrations per period"
          />
        </ChartCard>

        <ChartCard
          title="Online vs in-person"
          description="Consultation type for appointments in this period."
          isEmpty={data.appointments.total === 0}
          emptyTitle="No appointments in this period"
        >
          <DonutChart
            slices={consultationSlices}
            ariaLabel="Share of online versus in-person appointments"
            centerLabel="Appointments"
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Completed & cancelled"
          description="Where appointments in this period ended up."
          isEmpty={data.appointments.total === 0}
          emptyTitle="No appointments in this period"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--success-soft)] p-4">
              <p className="text-xs font-semibold text-[var(--success)]">
                Completed
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                {data.appointments.completed}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {formatPercent(data.appointments.completionRate)} of resolved
              </p>
            </div>

            <div className="rounded-xl bg-[var(--urgent-soft)] p-4">
              <p className="text-xs font-semibold text-[var(--urgent-deep)]">
                Cancelled
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                {data.appointments.cancelled}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {formatPercent(data.appointments.cancellationRate)} of resolved
              </p>
            </div>
          </div>

          <div className="mt-5">
            <BreakdownBars
              items={data.appointments.byStatus.map((item) => ({
                ...item,
                color: STATUS_COLORS[item.id],
              }))}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Doctor verification"
          description="Current verification status of every doctor."
          isEmpty={data.verification.totalDoctors === 0}
          emptyTitle="No doctors yet"
          emptyDescription="Verification statistics appear once doctors exist."
          footnote="A live snapshot — not affected by the date range."
        >
          <DonutChart
            slices={verificationSlices}
            ariaLabel="Doctors by verification status"
            centerLabel="Doctors"
          />

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4 text-center">
            <div>
              <dt className="text-xs text-[var(--muted)]">Approval rate</dt>
              <dd className="mt-1 text-lg font-semibold text-[var(--ink)]">
                {formatPercent(data.verification.approvalRate)}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[var(--muted)]">Active</dt>
              <dd className="mt-1 text-lg font-semibold text-[var(--ink)]">
                {data.verification.active}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-[var(--muted)]">Inactive</dt>
              <dd className="mt-1 text-lg font-semibold text-[var(--ink)]">
                {data.verification.inactive}
              </dd>
            </div>
          </dl>
        </ChartCard>
      </div>

      <ChartCard
        title="Payments & revenue"
        description="Money collected and refunded per period (INR)."
        isEmpty={data.revenue.paymentCount === 0 && data.revenue.refundedInr === 0}
        emptyTitle="No payments in this period"
        aside={<ChartLegend items={revenueSeries} />}
        footnote="Collected counts every payment that wasn't a failed attempt, dated when it was made. Refunds are dated when the booking's payment last changed."
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Collected", formatInr(data.revenue.collectedInr)],
            ["Refunded", formatInr(data.revenue.refundedInr)],
            ["Refund pending", formatInr(data.revenue.refundPendingInr)],
            ["Net revenue", formatInr(data.revenue.netInr)],
            ["Failed attempts", String(data.revenue.failedCount)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-[var(--canvas)] px-4 py-3"
            >
              <dt className="text-xs text-[var(--muted)]">{label}</dt>
              <dd className="mt-1 text-base font-semibold text-[var(--ink)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <LineChart
            buckets={data.buckets}
            series={revenueSeries}
            ariaLabel="Revenue collected and refunded per period in rupees"
            formatTick={formatCompactInr}
            formatValue={formatInr}
          />

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Payments by status
            </h3>

            <BreakdownBars
              items={data.revenue.byStatus.map((item) => ({
                ...item,
                color: STATUS_COLORS[item.id],
              }))}
            />
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
