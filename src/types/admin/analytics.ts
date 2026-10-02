export type AnalyticsRangePreset = "7d" | "30d" | "90d" | "all" | "custom";

export type AnalyticsRangeInput = {
  preset: AnalyticsRangePreset;
  /** ISO date (YYYY-MM-DD). Only used when preset is "custom". */
  from?: string;
  /** ISO date (YYYY-MM-DD). Only used when preset is "custom". */
  to?: string;
};

export type AnalyticsGranularity = "day" | "week" | "month";

export type TrendBucket = {
  /** Stable key: ISO date (day/week start) or YYYY-MM (month). */
  key: string;
  /** Short axis label. */
  label: string;
  /** Long label used in tooltips. */
  fullLabel: string;
};

export type TrendSeries = {
  id: string;
  label: string;
  /** One value per bucket, same order as AdminAnalytics.buckets. */
  values: number[];
};

export type CountItem = {
  id: string;
  label: string;
  value: number;
};

export type AdminAnalytics = {
  /** null when there is no dated data at all and no custom range was given. */
  range: { from: string; to: string } | null;
  granularity: AnalyticsGranularity;
  buckets: TrendBucket[];

  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    declined: number;
    missed: number;
    /** completed / (completed + cancelled + declined + missed); null when nothing is resolved yet. */
    completionRate: number | null;
    /** cancelled / same base as completionRate. */
    cancellationRate: number | null;
    trend: TrendSeries[];
    byConsultationType: CountItem[];
    byStatus: CountItem[];
  };

  registrations: {
    /** Patients with a known registration date inside the range. */
    patients: number;
    /** Doctors with a known registration date inside the range. */
    doctors: number;
    /** Accounts for which no registration date can be determined (all-time). */
    undatedPatients: number;
    undatedDoctors: number;
    trend: TrendSeries[];
  };

  revenue: {
    collectedInr: number;
    refundedInr: number;
    refundPendingInr: number;
    netInr: number;
    failedCount: number;
    paymentCount: number;
    trend: TrendSeries[];
    byStatus: CountItem[];
  };

  /** Point-in-time snapshot — not affected by the date range. */
  verification: {
    approved: number;
    pending: number;
    rejected: number;
    active: number;
    inactive: number;
    totalDoctors: number;
    /** approved / (approved + rejected); null when no decision has been made yet. */
    approvalRate: number | null;
    byStatus: CountItem[];
  };

  hasAnyData: boolean;
};
