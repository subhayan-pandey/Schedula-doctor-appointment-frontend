"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  calculateDoctorAnalytics,
  getStatusLabel,
} from "@/lib/analytics/doctor-analytics";

import {
  getBookingsByDoctorId,
} from "@/lib/bookings-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  AnalyticsPeriod,
  AnalyticsTab,
  DoctorAnalytics as DoctorAnalyticsData,
} from "@/types/analytics";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

const PERIOD_OPTIONS: {
  value: AnalyticsPeriod;
  label: string;
}[] = [
  {
    value: "7d",
    label: "Last 7 days",
  },
  {
    value: "30d",
    label: "Last 30 days",
  },
  {
    value: "90d",
    label: "Last 90 days",
  },
  {
    value: "all",
    label: "All time",
  },
];

const TABS: {
  value: AnalyticsTab;
  label: string;
  icon: string;
}[] = [
  {
    value: "overview",
    label: "Overview",
    icon: "↗",
  },
  {
    value: "insights",
    label: "Key Insights",
    icon: "✦",
  },
  {
    value: "growth",
    label: "Growth Opportunities",
    icon: "◎",
  },
  {
    value: "trends",
    label: "Trends",
    icon: "↗",
  },
];

const STATUS_ORDER: BookingStatus[] = [
  "completed",
  "upcoming",
  "confirmed",
  "pending",
  "cancelled",
  "missed",
];

function getStatusClass(
  status: BookingStatus,
) {
  switch (status) {
    case "completed":
      return "bg-[var(--brand)]";

    case "upcoming":
      return "bg-[var(--success)]";

    case "confirmed":
      return "bg-sky-500";

    case "pending":
      return "bg-amber-500";

    case "cancelled":
      return "bg-[var(--urgent-deep)]";

    case "missed":
      return "bg-slate-500";
  }
}

function getInsightClass(
  tone:
    | "positive"
    | "neutral"
    | "warning",
) {
  switch (tone) {
    case "positive":
      return "border-[var(--success)]/30 bg-[var(--success-soft)]";

    case "warning":
      return "border-[var(--urgent-deep)]/25 bg-[var(--urgent-soft)]";

    case "neutral":
      return "border-[var(--line)] bg-[var(--canvas)]";
  }
}

function MetricCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  accent:
    | "brand"
    | "success"
    | "urgent"
    | "neutral";
}) {
  const accentClass =
    accent === "brand"
      ? "border-[var(--brand)]/20 bg-[var(--brand-soft)]"
      : accent === "success"
        ? "border-[var(--success)]/20 bg-[var(--success-soft)]"
        : accent === "urgent"
          ? "border-[var(--urgent-deep)]/20 bg-[var(--urgent-soft)]"
          : "border-[var(--line)] bg-[var(--surface)]";

  return (
    <article
      className={`rounded-2xl border p-5 ${accentClass}`}
    >
      <p className="text-sm font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>
    </article>
  );
}

function EmptyAnalyticsState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-6 py-14 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-xl text-[var(--brand-deep)]">
        ◌
      </div>

      <h3 className="mt-4 font-semibold text-[var(--ink)]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function Overview({
  analytics,
}: {
  analytics: DoctorAnalyticsData;
}) {
  const maxStatusCount =
    Math.max(
      ...Object.values(
        analytics.statusCounts,
      ),
      1,
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total appointments"
          value={analytics.totalAppointments}
          description="Created in the selected period"
          accent="brand"
        />

        <MetricCard
          label="Completed"
          value={analytics.completedAppointments}
          description={`${analytics.completionRate}% completion rate`}
          accent="success"
        />

        <MetricCard
          label="Cancelled"
          value={analytics.cancelledAppointments}
          description={`${analytics.cancellationRate}% cancellation rate`}
          accent="urgent"
        />

        <MetricCard
          label="Missed"
          value={analytics.missedAppointments}
          description={`${analytics.missedRate}% missed appointment rate`}
          accent="neutral"
        />
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
            Appointment performance
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
            Appointment status distribution
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            A breakdown of appointments created during the selected period.
          </p>
        </div>

        {analytics.totalAppointments ===
        0 ? (
          <div className="mt-6">
            <EmptyAnalyticsState
              title="No appointment data yet"
              description="Appointment status analytics will appear once patients begin booking appointments with this doctor account."
            />
          </div>
        ) : (
          <div className="mt-7 space-y-4">
            {STATUS_ORDER.map(
              (status) => {
                const count =
                  analytics.statusCounts[
                    status
                  ];

                const percentage =
                  Math.round(
                    (count /
                      analytics.totalAppointments) *
                      100,
                  );

                const width =
                  (count /
                    maxStatusCount) *
                  100;

                return (
                  <div
                    key={status}
                    className="grid grid-cols-[92px_1fr_48px] items-center gap-3 sm:grid-cols-[110px_1fr_64px]"
                  >
                    <p className="text-sm font-medium text-[var(--ink)]">
                      {getStatusLabel(
                        status,
                      )}
                    </p>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--canvas)]">
                      <div
                        className={`h-full rounded-full transition-all ${getStatusClass(
                          status,
                        )}`}
                        style={{
                          width:
                            `${Math.max(
                              width,
                              count > 0
                                ? 4
                                : 0,
                            )}%`,
                        }}
                      />
                    </div>

                    <p className="text-right text-xs font-medium text-[var(--muted)]">
                      {count} ({percentage}%)
                    </p>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
            Scheduling pattern
          </p>

          <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
            Busiest day
          </h3>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {analytics.busiestDay ??
              "—"}
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {analytics.busiestDay
              ? "Based on appointment activity in the selected period."
              : "Not enough appointment data is available yet."}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
            Scheduling pattern
          </p>

          <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
            Most booked time
          </h3>

          <p className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
            {analytics.peakTime ??
              "—"}
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {analytics.peakTime
              ? "The appointment slot appearing most frequently in this period."
              : "Not enough appointment data is available yet."}
          </p>
        </article>
      </section>
    </div>
  );
}

function Insights({
  analytics,
}: {
  analytics: DoctorAnalyticsData;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
          Performance summary
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
          Key performance insights
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          These observations are calculated directly from appointment activity in the selected period.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="space-y-4">
          {analytics.insights.map(
            (insight) => (
              <article
                key={`${insight.title}-${insight.description}`}
                className={`rounded-xl border p-5 ${getInsightClass(
                  insight.tone,
                )}`}
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[var(--brand)]" />

                  <div>
                    <h3 className="font-semibold text-[var(--ink)]">
                      {insight.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Selected period comparison
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Appointment creation compared with the previous equivalent period.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Current period"
            value={analytics.totalAppointments}
            description="Appointments created"
            accent="brand"
          />

          <MetricCard
            label="Previous period"
            value={
              analytics.period ===
              "all"
                ? "—"
                : analytics.previousPeriodAppointments
            }
            description={
              analytics.period ===
              "all"
                ? "Comparison is unavailable for all time."
                : "Appointments created"
            }
            accent="neutral"
          />

          <MetricCard
            label="Activity change"
            value={
              analytics.period ===
              "all"
                ? "—"
                : `${analytics.appointmentChange > 0 ? "+" : ""}${analytics.appointmentChange}%`
            }
            description={
              analytics.period ===
              "all"
                ? "All-time data has no previous comparison period."
                : "Compared with the previous period"
            }
            accent={
              analytics.appointmentChange >=
              0
                ? "success"
                : "urgent"
            }
          />
        </div>
      </section>
    </div>
  );
}

function GrowthOpportunities({
  analytics,
}: {
  analytics: DoctorAnalyticsData;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--urgent-deep)]/20 bg-[var(--urgent-soft)]/50 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--urgent-deep)]">
              Opportunity
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
              Areas for improvement
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {analytics.improvements.map(
              (item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <div className="flex gap-3">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--urgent-deep)]" />

                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--success)]/25 bg-[var(--success-soft)]/55 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
              Positive signal
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
              Your strengths
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {analytics.strengths.map(
              (item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <div className="flex gap-3">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--success)]" />

                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/45 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
            Practice development
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
            Growth strategies
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Practical areas to focus on as your appointment history grows.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h3 className="font-semibold text-[var(--ink)]">
              Appointment engagement
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Maintain clear communication with patients throughout the appointment lifecycle.
            </p>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Explore strategy
            </button>
          </article>

          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h3 className="font-semibold text-[var(--ink)]">
              Reduce missed appointments
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use appointment patterns to identify where missed visits may affect practice efficiency.
            </p>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              View suggestions
            </button>
          </article>

          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h3 className="font-semibold text-[var(--ink)]">
              Optimise availability
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use your busiest days and appointment times to guide future availability planning.
            </p>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Optimise availability
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}

function Trends({
  analytics,
}: {
  analytics: DoctorAnalyticsData;
}) {
  const maxValue =
    Math.max(
      ...analytics.trendPoints.map(
        (point) =>
          point.value,
      ),
      1,
    );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
            Appointment activity
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">
            Booking trends
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Appointment activity is grouped according to the selected time period.
          </p>
        </div>

        {analytics.trendPoints.length ===
        0 ? (
          <div className="mt-6">
            <EmptyAnalyticsState
              title="No booking history available"
              description="Trend analysis will appear after appointments are created."
            />
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {analytics.trendPoints.map(
              (point) => {
                const width =
                  (point.value /
                    maxValue) *
                  100;

                return (
                  <div
                    key={point.label}
                    className="grid grid-cols-[82px_1fr_40px] items-center gap-3 sm:grid-cols-[120px_1fr_48px]"
                  >
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {point.label}
                    </p>

                    <div className="h-3 overflow-hidden rounded-full bg-[var(--canvas)]">
                      <div
                        className="h-full rounded-full bg-[var(--brand)] transition-all"
                        style={{
                          width:
                            `${Math.max(
                              width,
                              point.value > 0
                                ? 3
                                : 0,
                            )}%`,
                        }}
                      />
                    </div>

                    <p className="text-right text-sm font-semibold text-[var(--ink)]">
                      {point.value}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Trend analysis
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">
              Current period
            </p>

            <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
              {analytics.totalAppointments}
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              appointments created
            </p>
          </article>

          <article className="rounded-xl bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">
              Previous period
            </p>

            <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
              {analytics.period ===
              "all"
                ? "—"
                : analytics.previousPeriodAppointments}
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              {analytics.period ===
              "all"
                ? "No equivalent comparison"
                : "appointments created"}
            </p>
          </article>

          <article className="rounded-xl bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">
              Activity change
            </p>

            <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">
              {analytics.period ===
              "all"
                ? "—"
                : `${analytics.appointmentChange > 0 ? "+" : ""}${analytics.appointmentChange}%`}
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              compared with the previous period
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default function DoctorAnalytics() {
  const [
    pageStatus,
    setPageStatus,
  ] =
    useState<PageStatus>(
      "loading",
    );

  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>(
      [],
    );

  const [
    activePeriod,
    setActivePeriod,
  ] =
    useState<AnalyticsPeriod>(
      "30d",
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AnalyticsTab>(
      "overview",
    );

  useEffect(() => {
    Promise.resolve().then(
      () => {
        const session =
          getSession();

        if (
          !session ||
          session.role !==
            "doctor"
        ) {
          setPageStatus(
            "unauthorized",
          );

          return;
        }

        setBookings(
          getBookingsByDoctorId(
            session.id,
          ),
        );

        setPageStatus(
          "ready",
        );
      },
    );
  }, []);

  const analytics =
    useMemo(
      () =>
        calculateDoctorAnalytics(
          bookings,
          activePeriod,
        ),
      [
        bookings,
        activePeriod,
      ],
    );

  if (
    pageStatus ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-[var(--muted)] sm:px-8">
        Loading analytics…
      </div>
    );
  }

  if (
    pageStatus ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Log in with a doctor account to access practice analytics.
        </p>

        <Link
          href="/doctor/login"
          className="mt-6 inline-block"
        >
          <Button>
            Doctor login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <header className="border-b border-[var(--line)] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-xl text-white shadow-sm">
                ▥
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                  Practice performance
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                  Analytics Dashboard
                </h1>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Appointment performance and practice growth insights.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only">
                Analytics period
              </label>

              <select
                value={
                  activePeriod
                }
                onChange={(
                  event,
                ) =>
                  setActivePeriod(
                    event.target
                      .value as AnalyticsPeriod,
                  )
                }
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
              >
                {PERIOD_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>

              <Link
                href="/doctor/dashboard"
              >
                <Button
                  variant="outline"
                  size="sm"
                >
                  Back to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <nav className="overflow-x-auto border-b border-[var(--line)]">
          <div className="flex min-w-max px-3 sm:px-5">
            {TABS.map(
              (tab) => (
                <button
                  key={
                    tab.value
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.value,
                    )
                  }
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition ${
                    activeTab ===
                    tab.value
                      ? "text-[var(--brand-deep)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>
                    {tab.icon}
                  </span>

                  {
                    tab.label
                  }

                  {activeTab ===
                    tab.value && (
                    <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--brand)]" />
                  )}
                </button>
              ),
            )}
          </div>
        </nav>

        <main className="bg-[var(--canvas)]/45 p-4 sm:p-6">
          {activeTab ===
            "overview" && (
            <Overview
              analytics={
                analytics
              }
            />
          )}

          {activeTab ===
            "insights" && (
            <Insights
              analytics={
                analytics
              }
            />
          )}

          {activeTab ===
            "growth" && (
            <GrowthOpportunities
              analytics={
                analytics
              }
            />
          )}

          {activeTab ===
            "trends" && (
            <Trends
              analytics={
                analytics
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}