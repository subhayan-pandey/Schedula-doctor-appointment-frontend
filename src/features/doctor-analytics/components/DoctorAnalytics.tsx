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

type AnalyticsTabIcon =
  | "overview"
  | "insights"
  | "growth"
  | "trends";

const TABS: {
  value: AnalyticsTab;
  label: string;
  icon: AnalyticsTabIcon;
}[] = [
  {
    value: "overview",
    label: "Overview",
    icon: "overview",
  },
  {
    value: "insights",
    label: "Key Insights",
    icon: "insights",
  },
  {
    value: "growth",
    label: "Growth Opportunities",
    icon: "growth",
  },
  {
    value: "trends",
    label: "Trends",
    icon: "trends",
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

function TabIcon({
  type,
}: {
  type: AnalyticsTabIcon;
}) {
  if (type === "overview") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-4"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          rx="1"
        />
        <rect
          x="14"
          y="4"
          width="6"
          height="6"
          rx="1"
        />
        <rect
          x="4"
          y="14"
          width="6"
          height="6"
          rx="1"
        />
        <rect
          x="14"
          y="14"
          width="6"
          height="6"
          rx="1"
        />
      </svg>
    );
  }

  if (type === "insights") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-4"
        aria-hidden="true"
      >
        <path
          d="M12 3.5a8 8 0 0 0-4.7 14.5c.6.5.9 1.1.9 1.8V21h7.6v-1.2c0-.7.3-1.3.9-1.8A8 8 0 0 0 12 3.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 21h5M10 11.5h.01M14 11.5h.01"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "growth") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="size-4"
        aria-hidden="true"
      >
        <path
          d="M4 17V7"
          strokeLinecap="round"
        />
        <path
          d="M4 17h16"
          strokeLinecap="round"
        />
        <path
          d="m7 14 3-4 3 2 5-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 6h3v3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M4 18V9"
        strokeLinecap="round"
      />
      <path
        d="M10 18V5"
        strokeLinecap="round"
      />
      <path
        d="M16 18v-7"
        strokeLinecap="round"
      />
      <path
        d="M22 18H2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeaderAnalyticsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        d="M5 19V9"
        strokeLinecap="round"
      />
      <path
        d="M12 19V5"
        strokeLinecap="round"
      />
      <path
        d="M19 19v-7"
        strokeLinecap="round"
      />
      <path
        d="M3 19h18"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmptyStateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3.5v3M16 3.5v3M4 9h16"
        strokeLinecap="round"
      />
      <path
        d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16h.01M12 16h.01"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrendArrow({
  positive,
}: {
  positive: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      {positive ? (
        <>
          <path
            d="M5 17 17 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 5h8v8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="m5 7 12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 13v6H11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

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

    default:
      return "bg-[var(--muted)]";
  }
}

function getStatusDotClass(
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

    default:
      return "bg-[var(--muted)]";
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
    default:
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
      className={`group rounded-2xl border p-5 transition-shadow hover:shadow-sm ${accentClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">
          {label}
        </p>

        <span
          className={`size-2 rounded-full ${
            accent === "brand"
              ? "bg-[var(--brand)]"
              : accent === "success"
                ? "bg-[var(--success)]"
                : accent === "urgent"
                  ? "bg-[var(--urgent-deep)]"
                  : "bg-[var(--muted)]"
          }`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">
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
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
        <EmptyStateIcon />
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

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
        {title}
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--muted)]">
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
          value={
            analytics.totalAppointments
          }
          description="Created in the selected period"
          accent="brand"
        />

        <MetricCard
          label="Completed"
          value={
            analytics.completedAppointments
          }
          description={`${analytics.completionRate}% completion rate`}
          accent="success"
        />

        <MetricCard
          label="Cancelled"
          value={
            analytics.cancelledAppointments
          }
          description={`${analytics.cancellationRate}% cancellation rate`}
          accent="urgent"
        />

        <MetricCard
          label="Missed"
          value={
            analytics.missedAppointments
          }
          description={`${analytics.missedRate}% missed appointment rate`}
          accent="neutral"
        />
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <SectionHeader
          eyebrow="Appointment performance"
          title="Appointment status distribution"
          description="A breakdown of appointments created during the selected period."
        />

        {analytics.totalAppointments ===
        0 ? (
          <div className="mt-6">
            <EmptyAnalyticsState
              title="No appointment data yet"
              description="Appointment status analytics will appear once patients begin booking appointments with this doctor account."
            />
          </div>
        ) : (
          <div className="mt-7 space-y-5">
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
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:w-32">
                      <span
                        className={`size-2 shrink-0 rounded-full ${getStatusDotClass(
                          status,
                        )}`}
                        aria-hidden="true"
                      />

                      <p className="truncate text-sm font-medium text-[var(--ink)]">
                        {getStatusLabel(
                          status,
                        )}
                      </p>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--canvas)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getStatusClass(
                          status,
                        )}`}
                        style={{
                          width: `${Math.max(
                            width,
                            count > 0
                              ? 4
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="min-w-[74px] text-right text-xs font-semibold text-[var(--muted)]">
                      {count} (
                      {percentage}%)
                    </p>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                Scheduling pattern
              </p>

              <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                Busiest day
              </h3>
            </div>

            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                />
                <path
                  d="M8 3.5v3M16 3.5v3M4 9h16"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>

          <p className="mt-6 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {analytics.busiestDay ??
              "—"}
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {analytics.busiestDay
              ? "Based on appointment activity in the selected period."
              : "Not enough appointment data is available yet."}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                Scheduling pattern
              </p>

              <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                Most booked time
              </h3>
            </div>

            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                />
                <path
                  d="M12 8v4l2.5 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <p className="mt-6 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            {analytics.peakTime ??
              "—"}
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
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
  const activityIsPositive =
    analytics.appointmentChange >=
    0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
              aria-hidden="true"
            >
              <path
                d="M12 3.5a8 8 0 0 0-4.7 14.5c.6.5.9 1.1.9 1.8V21h7.6v-1.2c0-.7.3-1.3.9-1.8A8 8 0 0 0 12 3.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 21h5"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
              Performance summary
            </p>

            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--ink)]">
              Key performance insights
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              These observations are calculated directly from appointment activity in the selected period.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        {analytics.insights.length ===
        0 ? (
          <EmptyAnalyticsState
            title="No insights available"
            description="There is not enough appointment activity to generate meaningful insights for this period."
          />
        ) : (
          <div className="space-y-3">
            {analytics.insights.map(
              (insight) => (
                <article
                  key={`${insight.title}-${insight.description}`}
                  className={`rounded-xl border p-4 sm:p-5 ${getInsightClass(
                    insight.tone,
                  )}`}
                >
                  <div className="flex gap-3.5">
                    <span
                      className={`mt-1 grid size-7 shrink-0 place-items-center rounded-lg ${
                        insight.tone ===
                        "positive"
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : insight.tone ===
                              "warning"
                            ? "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]"
                            : "bg-[var(--surface)] text-[var(--brand-deep)]"
                      }`}
                      aria-hidden="true"
                    >
                      {insight.tone ===
                      "positive" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3.5"
                        >
                          <path
                            d="m5 12 4 4L19 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : insight.tone ===
                        "warning" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3.5"
                        >
                          <path
                            d="M12 4v8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 16h.01"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10.2 3.8 3.8 15a2 2 0 0 0 1.8 3h12.8a2 2 0 0 0 1.8-3L13.8 3.8a2 2 0 0 0-3.6 0Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3.5"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8.5"
                          />
                          <path
                            d="M12 10.5v5M12 7.5h.01"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--ink)]">
                        {insight.title}
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <SectionHeader
          eyebrow="Selected period comparison"
          title="Appointment activity"
          description="Appointment creation compared with the previous equivalent period."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Current period"
            value={
              analytics.totalAppointments
            }
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

          <article
            className={`rounded-2xl border p-5 ${
              analytics.period ===
              "all"
                ? "border-[var(--line)] bg-[var(--surface)]"
                : activityIsPositive
                  ? "border-[var(--success)]/20 bg-[var(--success-soft)]"
                  : "border-[var(--urgent-deep)]/20 bg-[var(--urgent-soft)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--muted)]">
                Activity change
              </p>

              {analytics.period !==
                "all" && (
                <span
                  className={
                    activityIsPositive
                      ? "text-[var(--success)]"
                      : "text-[var(--urgent-deep)]"
                  }
                >
                  <TrendArrow
                    positive={
                      activityIsPositive
                    }
                  />
                </span>
              )}
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">
              {analytics.period ===
              "all"
                ? "—"
                : `${analytics.appointmentChange > 0 ? "+" : ""}${analytics.appointmentChange}%`}
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {analytics.period ===
              "all"
                ? "All-time data has no previous comparison period."
                : "Compared with the previous period"}
            </p>
          </article>
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--urgent-deep)]">
            Opportunity
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
            Areas for improvement
          </h2>

          <div className="mt-6 space-y-3">
            {analytics.improvements.map(
              (item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                >
                  <div className="flex gap-3">
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-[var(--urgent-deep)]"
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--ink)]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
            Positive signal
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)]">
            Your strengths
          </h2>

          <div className="mt-6 space-y-3">
            {analytics.strengths.map(
              (item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                >
                  <div className="flex gap-3">
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-[var(--success)]"
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--ink)]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
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
        <SectionHeader
          eyebrow="Practice development"
          title="Growth strategies"
          description="Practical areas to focus on as your appointment history grows."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M5 6.5h14v11H5z"
                  strokeLinejoin="round"
                />
                <path
                  d="m8 10 2.5 2 1.5-1.5L16 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <h3 className="mt-4 font-semibold text-[var(--ink)]">
              Appointment engagement
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Maintain clear communication with patients throughout the appointment lifecycle.
            </p>

            <div className="mt-5 rounded-lg bg-[var(--canvas)] px-3 py-2 text-xs font-medium text-[var(--muted)]">
              Review appointment activity
            </div>
          </article>

          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--urgent-soft)] text-[var(--urgent-deep)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M12 4v8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16h.01"
                  strokeLinecap="round"
                />
                <path
                  d="M10.2 3.8 3.8 15a2 2 0 0 0 1.8 3h12.8a2 2 0 0 0 1.8-3L13.8 3.8a2 2 0 0 0-3.6 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <h3 className="mt-4 font-semibold text-[var(--ink)]">
              Reduce missed appointments
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use appointment patterns to identify where missed visits may affect practice efficiency.
            </p>

            <div className="mt-5 rounded-lg bg-[var(--canvas)] px-3 py-2 text-xs font-medium text-[var(--muted)]">
              Review missed appointments
            </div>
          </article>

          <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="M4 17V7"
                  strokeLinecap="round"
                />
                <path
                  d="M4 17h16"
                  strokeLinecap="round"
                />
                <path
                  d="m7 14 3-4 3 2 5-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 6h3v3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <h3 className="mt-4 font-semibold text-[var(--ink)]">
              Optimise availability
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use your busiest days and appointment times to guide future availability planning.
            </p>

            <Link
              href="/doctor/slot"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              Manage availability
            </Link>
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
        <SectionHeader
          eyebrow="Appointment activity"
          title="Booking trends"
          description="Appointment activity is grouped according to the selected time period."
        />

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
                    className="grid grid-cols-[74px_1fr_auto] items-center gap-3 sm:grid-cols-[110px_1fr_56px] sm:gap-4"
                  >
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {point.label}
                    </p>

                    <div
                      className="h-3 overflow-hidden rounded-full bg-[var(--canvas)]"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            width,
                            point.value >
                              0
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
        <SectionHeader
          eyebrow="Comparison"
          title="Trend analysis"
          description="Compare current appointment activity with the previous equivalent period."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Current period"
            value={
              analytics.totalAppointments
            }
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
                ? "No equivalent comparison"
                : "Appointments created"
            }
            accent="neutral"
          />

          <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--muted)]">
                Activity change
              </p>

              {analytics.period !==
                "all" && (
                <span
                  className={
                    analytics.appointmentChange >=
                    0
                      ? "text-[var(--success)]"
                      : "text-[var(--urgent-deep)]"
                  }
                >
                  <TrendArrow
                    positive={
                      analytics.appointmentChange >=
                      0
                    }
                  />
                </span>
              )}
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ink)]">
              {analytics.period ===
              "all"
                ? "—"
                : `${analytics.appointmentChange > 0 ? "+" : ""}${analytics.appointmentChange}%`}
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {analytics.period ===
              "all"
                ? "No previous comparison"
                : "Compared with the previous period"}
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
  ] = useState<PageStatus>(
    "loading",
  );

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    activePeriod,
    setActivePeriod,
  ] = useState<AnalyticsPeriod>(
    "30d",
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState<AnalyticsTab>(
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
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <div
          className="flex flex-col items-center justify-center text-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <div className="size-5 animate-spin rounded-full border-2 border-[var(--brand)]/25 border-t-[var(--brand)]" />
          </div>

          <p className="mt-4 text-sm font-medium text-[var(--muted)]">
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  if (
    pageStatus ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-16 text-center">
        <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--urgent-soft)] text-[var(--urgent-deep)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
              aria-hidden="true"
            >
              <path
                d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5"
                strokeLinecap="round"
              />
              <path
                d="M12 7v5l3 2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 3v5M15.5 5.5h5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
            Doctor access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Log in with a doctor account to access practice analytics.
          </p>

          <Link
            href="/doctor/login"
            className="mt-6 inline-flex"
          >
            <Button>
              Doctor login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <header className="border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-sm sm:size-12 sm:rounded-2xl">
                <HeaderAnalyticsIcon />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                  Practice performance
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                  Analytics Dashboard
                </h1>

                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Appointment performance and practice growth insights.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative">
                <label
                  htmlFor="analytics-period"
                  className="sr-only"
                >
                  Analytics period
                </label>

                <select
                  id="analytics-period"
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
                  className="w-full appearance-none rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 pr-10 text-sm font-medium text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)] sm:w-auto"
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

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
                  aria-hidden="true"
                >
                  <path
                    d="m7 10 5 5 5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <Link
                href="/doctor/dashboard"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Back to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <nav
          className="overflow-x-auto border-b border-[var(--line)]"
          aria-label="Analytics sections"
        >
          <div className="flex min-w-max px-2 sm:px-4">
            {TABS.map(
              (tab) => {
                const isActive =
                  activeTab ===
                  tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.value,
                      )
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className={`relative flex min-h-12 items-center gap-2 px-3.5 py-3.5 text-sm font-medium transition sm:px-4 ${
                      isActive
                        ? "text-[var(--brand-deep)]"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]`}
                  >
                    <TabIcon
                      type={
                        tab.icon
                      }
                    />

                    <span>
                      {
                        tab.label
                      }
                    </span>

                    {isActive && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--brand)] sm:inset-x-4" />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </nav>

        <main className="bg-[var(--canvas)]/45 p-4 sm:p-6 lg:p-7">
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