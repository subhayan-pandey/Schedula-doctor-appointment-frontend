export type AnalyticsPeriod =
  | "7d"
  | "30d"
  | "90d"
  | "all";

export type AnalyticsTab =
  | "overview"
  | "insights"
  | "growth"
  | "trends";

export type AnalyticsStatusCounts = {
  pending: number;
  confirmed: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  missed: number;
};

export type AnalyticsTrendPoint = {
  label: string;
  value: number;
};

export type AnalyticsInsight = {
  title: string;
  description: string;
  tone:
    | "positive"
    | "neutral"
    | "warning";
};

export type GrowthItem = {
  title: string;
  description: string;
  type:
    | "strength"
    | "improvement";
};

export type DoctorAnalytics = {
  period: AnalyticsPeriod;

  totalAppointments: number;

  completedAppointments: number;

  cancelledAppointments: number;

  missedAppointments: number;

  pendingAppointments: number;

  confirmedAppointments: number;

  upcomingAppointments: number;

  completionRate: number;

  cancellationRate: number;

  missedRate: number;

  busiestDay: string | null;

  peakTime: string | null;

  previousPeriodAppointments: number;

  appointmentChange: number;

  statusCounts: AnalyticsStatusCounts;

  trendPoints: AnalyticsTrendPoint[];

  insights: AnalyticsInsight[];

  strengths: GrowthItem[];

  improvements: GrowthItem[];
};