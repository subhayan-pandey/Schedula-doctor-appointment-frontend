import type {
  AnalyticsInsight,
  AnalyticsPeriod,
  AnalyticsStatusCounts,
  AnalyticsTrendPoint,
  DoctorAnalytics,
  GrowthItem,
} from "@/types/analytics";

import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getPeriodDays(
  period: AnalyticsPeriod,
) {
  switch (period) {
    case "7d":
      return 7;

    case "30d":
      return 30;

    case "90d":
      return 90;

    case "all":
      return null;
  }
}

function startOfDay(
  date: Date,
) {
  const nextDate = new Date(
    date,
  );

  nextDate.setHours(
    0,
    0,
    0,
    0,
  );

  return nextDate;
}

function addDays(
  date: Date,
  days: number,
) {
  const nextDate = new Date(
    date,
  );

  nextDate.setDate(
    nextDate.getDate() + days,
  );

  return nextDate;
}

function formatDateKey(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBookingDate(
  booking: Booking,
) {
  const date = new Date(
    booking.createdAt,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function getStatusCounts(
  bookings: Booking[],
): AnalyticsStatusCounts {
  const counts: AnalyticsStatusCounts = {
    pending: 0,
    confirmed: 0,
    upcoming: 0,
    declined: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
  };

  bookings.forEach(
    (booking) => {
      counts[booking.status] += 1;
    },
  );

  return counts;
}

function getPercentage(
  value: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100,
  );
}

function getBusiestDay(
  bookings: Booking[],
) {
  if (bookings.length === 0) {
    return null;
  }

  const counts =
    new Map<string, number>();

  bookings.forEach(
    (booking) => {
      const date = new Date(
        `${booking.date}T00:00:00`,
      );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return;
      }

      const day =
        DAY_NAMES[date.getDay()];

      counts.set(
        day,
        (counts.get(day) ?? 0) +
          1,
      );
    },
  );

  let busiestDay:
    | string
    | null = null;

  let highestCount = 0;

  counts.forEach(
    (count, day) => {
      if (
        count >
        highestCount
      ) {
        busiestDay = day;
        highestCount = count;
      }
    },
  );

  return busiestDay;
}

function getPeakTime(
  bookings: Booking[],
) {
  if (bookings.length === 0) {
    return null;
  }

  const counts =
    new Map<string, number>();

  bookings.forEach(
    (booking) => {
      counts.set(
        booking.time,
        (counts.get(
          booking.time,
        ) ?? 0) + 1,
      );
    },
  );

  let peakTime:
    | string
    | null = null;

  let highestCount = 0;

  counts.forEach(
    (count, time) => {
      if (
        count >
        highestCount
      ) {
        peakTime = time;
        highestCount = count;
      }
    },
  );

  return peakTime;
}

function buildInsights(
  analytics: {
    totalAppointments: number;
    completionRate: number;
    cancellationRate: number;
    missedRate: number;
    busiestDay: string | null;
    peakTime: string | null;
    appointmentChange: number;
  },
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] =
    [];

  if (
    analytics.totalAppointments ===
    0
  ) {
    return [
      {
        title:
          "No appointment activity yet",
        description:
          "Analytics will become more meaningful as patients book and complete appointments with you.",
        tone: "neutral",
      },
    ];
  }

  if (
    analytics.busiestDay
  ) {
    insights.push({
      title: "Busiest day",
      description:
        `${analytics.busiestDay} currently has the highest appointment activity in the selected period.`,
      tone: "neutral",
    });
  }

  if (
    analytics.peakTime
  ) {
    insights.push({
      title:
        "Peak appointment time",
      description:
        `Your most frequently booked appointment slot is ${analytics.peakTime}.`,
      tone: "neutral",
    });
  }

  if (
    analytics.completionRate >=
    80
  ) {
    insights.push({
      title:
        "Strong completion rate",
      description:
        `${analytics.completionRate}% of appointments in this period have been completed.`,
      tone: "positive",
    });
  } else if (
    analytics.completionRate <
      60 &&
    analytics.totalAppointments >
      0
  ) {
    insights.push({
      title:
        "Completion rate needs attention",
      description:
        `Only ${analytics.completionRate}% of appointments have been completed in the selected period.`,
      tone: "warning",
    });
  }

  if (
    analytics.cancellationRate >
    20
  ) {
    insights.push({
      title:
        "Cancellation rate is elevated",
      description:
        `${analytics.cancellationRate}% of appointments were cancelled.`,
      tone: "warning",
    });
  }

  if (
    analytics.missedRate >
    10
  ) {
    insights.push({
      title:
        "Missed appointments are increasing",
      description:
        `${analytics.missedRate}% of appointments were marked as missed.`,
      tone: "warning",
    });
  }

  if (
    analytics.appointmentChange >
    0
  ) {
    insights.push({
      title:
        "Appointment activity increased",
      description:
        `${analytics.appointmentChange}% more appointments were created compared with the previous equivalent period.`,
      tone: "positive",
    });
  } else if (
    analytics.appointmentChange <
    0
  ) {
    insights.push({
      title:
        "Appointment activity decreased",
      description:
        `${Math.abs(
          analytics.appointmentChange,
        )}% fewer appointments were created compared with the previous equivalent period.`,
      tone: "warning",
    });
  }

  return insights;
}

function buildGrowthItems(
  analytics: {
    totalAppointments: number;
    completionRate: number;
    cancellationRate: number;
    missedRate: number;
    busiestDay: string | null;
    peakTime: string | null;
    appointmentChange: number;
  },
): {
  strengths: GrowthItem[];
  improvements: GrowthItem[];
} {
  const strengths: GrowthItem[] =
    [];

  const improvements: GrowthItem[] =
    [];

  if (
    analytics.completionRate >=
    80
  ) {
    strengths.push({
      title:
        "Strong appointment completion",
      description:
        `Your completion rate is ${analytics.completionRate}%, indicating that most appointments in the selected period reached completion.`,
    });
  }

  if (
    analytics.cancellationRate <=
      10 &&
    analytics.totalAppointments >
      0
  ) {
    strengths.push({
      title:
        "Low cancellation rate",
      description:
        `Only ${analytics.cancellationRate}% of appointments were cancelled during the selected period.`,
    });
  }

  if (
    analytics.missedRate <=
      10 &&
    analytics.totalAppointments >
      0
  ) {
    strengths.push({
      title:
        "Low missed appointment rate",
      description:
        `The missed appointment rate is ${analytics.missedRate}% for the selected period.`,
    });
  }

  if (
    analytics.appointmentChange >
    0
  ) {
    strengths.push({
      title:
        "Appointment activity is growing",
      description:
        `Appointment creation increased by ${analytics.appointmentChange}% compared with the previous equivalent period.`,
    });
  }

  if (
    analytics.busiestDay
  ) {
    strengths.push({
      title:
        "Clear scheduling pattern",
      description:
        `${analytics.busiestDay} is currently your busiest appointment day.`,
    });
  }

  if (
    strengths.length === 0
  ) {
    strengths.push({
      title:
        "Continue building appointment history",
      description:
        "More appointment data will make practice performance patterns easier to identify.",
    });
  }

  if (
    analytics.completionRate <
      60 &&
    analytics.totalAppointments >
      0
  ) {
    improvements.push({
      title:
        "Improve appointment completion",
      description:
        `The current completion rate is ${analytics.completionRate}%. Review patient communication and appointment follow-up workflows.`,
    });
  }

  if (
    analytics.cancellationRate >
    20
  ) {
    improvements.push({
      title:
        "Reduce cancellations",
      description:
        `Cancellations account for ${analytics.cancellationRate}% of appointments in the selected period.`,
    });
  }

  if (
    analytics.missedRate >
    10
  ) {
    improvements.push({
      title:
        "Reduce missed appointments",
      description:
        `Missed appointments account for ${analytics.missedRate}% of activity in the selected period.`,
    });
  }

  if (
    analytics.appointmentChange <
    0
  ) {
    improvements.push({
      title:
        "Monitor appointment activity",
      description:
        `Appointment creation is ${Math.abs(
          analytics.appointmentChange,
        )}% lower than the previous equivalent period.`,
    });
  }

  if (
    improvements.length === 0
  ) {
    improvements.push({
      title:
        "Continue monitoring trends",
      description:
        "Current appointment patterns do not indicate a major improvement area yet. Continue monitoring the selected period.",
    });
  }

  return {
    strengths,
    improvements,
  };
}

function buildTrendPoints(
  bookings: Booking[],
  period: AnalyticsPeriod,
): AnalyticsTrendPoint[] {
  if (
    bookings.length === 0
  ) {
    return [];
  }

  if (
    period === "all"
  ) {
    const counts =
      new Map<string, number>();

    bookings.forEach(
      (booking) => {
        const date =
          getBookingDate(
            booking,
          );

        if (!date) {
          return;
        }

        const key =
          formatDateKey(date);

        counts.set(
          key,
          (counts.get(key) ?? 0) +
            1,
        );
      },
    );

    return Array.from(
      counts.entries(),
    )
      .sort(
        ([first], [second]) =>
          first.localeCompare(
            second,
          ),
      )
      .slice(-12)
      .map(
        ([label, value]) => ({
          label,
          value,
        }),
      );
  }

  const days =
    getPeriodDays(period);

  if (!days) {
    return [];
  }

  const now = new Date();

  const currentStart =
    startOfDay(
      addDays(
        now,
        -(days - 1),
      ),
    );

  const counts =
    new Map<string, number>();

  for (
    let index = 0;
    index < days;
    index += 1
  ) {
    const date =
      addDays(
        currentStart,
        index,
      );

    counts.set(
      formatDateKey(date),
      0,
    );
  }

  bookings.forEach(
    (booking) => {
      const date =
        getBookingDate(
          booking,
        );

      if (!date) {
        return;
      }

      if (
        date < currentStart ||
        date > now
      ) {
        return;
      }

      const key =
        formatDateKey(date);

      if (
        counts.has(key)
      ) {
        counts.set(
          key,
          (counts.get(key) ?? 0) +
            1,
        );
      }
    },
  );

  const entries =
    Array.from(
      counts.entries(),
    );

  const step =
    days <= 7
      ? 1
      : days <= 30
        ? 5
        : 15;

  return entries
    .filter(
      (_, index) =>
        index % step === 0,
    )
    .map(
      ([label, value]) => ({
        label,
        value,
      }),
    );
}

function filterBookingsByPeriod(
  bookings: Booking[],
  period: AnalyticsPeriod,
) {
  if (
    period === "all"
  ) {
    return [...bookings];
  }

  const days =
    getPeriodDays(period);

  if (!days) {
    return [];
  }

  const now = new Date();

  const currentStart =
    startOfDay(
      addDays(
        now,
        -(days - 1),
      ),
    );

  return bookings.filter(
    (booking) => {
      const bookingDate =
        getBookingDate(
          booking,
        );

      if (!bookingDate) {
        return false;
      }

      return (
        bookingDate >=
          currentStart &&
        bookingDate <= now
      );
    },
  );
}

function getPreviousPeriodBookings(
  bookings: Booking[],
  period: AnalyticsPeriod,
) {
  if (
    period === "all"
  ) {
    return [];
  }

  const days =
    getPeriodDays(period);

  if (!days) {
    return [];
  }

  const now = new Date();

  const currentStart =
    addDays(
      now,
      -(days - 1),
    );

  const previousEnd =
    new Date(
      currentStart,
    );

  previousEnd.setMilliseconds(
    previousEnd.getMilliseconds() -
      1,
  );

  const previousStart =
    addDays(
      previousEnd,
      -days,
    );

  return bookings.filter(
    (booking) => {
      const bookingDate =
        getBookingDate(
          booking,
        );

      if (!bookingDate) {
        return false;
      }

      return (
        bookingDate >=
          previousStart &&
        bookingDate <=
          previousEnd
      );
    },
  );
}

export function calculateDoctorAnalytics(
  bookings: Booking[],
  period: AnalyticsPeriod,
): DoctorAnalytics {
  const filteredBookings =
    filterBookingsByPeriod(
      bookings,
      period,
    );

  const previousBookings =
    getPreviousPeriodBookings(
      bookings,
      period,
    );

  const statusCounts =
    getStatusCounts(
      filteredBookings,
    );

  const totalAppointments =
    filteredBookings.length;

  const completionRate =
    getPercentage(
      statusCounts.completed,
      totalAppointments,
    );

  const cancellationRate =
    getPercentage(
      statusCounts.cancelled,
      totalAppointments,
    );

  const missedRate =
    getPercentage(
      statusCounts.missed,
      totalAppointments,
    );

  let appointmentChange = 0;

  if (
    period !== "all"
  ) {
    if (
      previousBookings.length ===
      0
    ) {
      appointmentChange =
        totalAppointments > 0
          ? 100
          : 0;
    } else {
      appointmentChange =
        Math.round(
          ((totalAppointments -
            previousBookings.length) /
            previousBookings.length) *
            100,
        );
    }
  }

  const partialAnalytics = {
    totalAppointments,
    completionRate,
    cancellationRate,
    missedRate,
    busiestDay:
      getBusiestDay(
        filteredBookings,
      ),
    peakTime:
      getPeakTime(
        filteredBookings,
      ),
    appointmentChange,
  };

  const growth =
    buildGrowthItems(
      partialAnalytics,
    );

  return {
    period,

    totalAppointments,

    completedAppointments:
      statusCounts.completed,

    cancelledAppointments:
      statusCounts.cancelled,

    missedAppointments:
      statusCounts.missed,

    pendingAppointments:
      statusCounts.pending,

    confirmedAppointments:
      statusCounts.confirmed,

    upcomingAppointments:
      statusCounts.upcoming,

    completionRate,

    cancellationRate,

    missedRate,

    busiestDay:
      partialAnalytics.busiestDay,

    peakTime:
      partialAnalytics.peakTime,

    previousPeriodAppointments:
      previousBookings.length,

    appointmentChange,

    statusCounts,

    trendPoints:
      buildTrendPoints(
        filteredBookings,
        period,
      ),

    insights:
      buildInsights(
        partialAnalytics,
      ),

    strengths:
      growth.strengths,

    improvements:
      growth.improvements,
  };
}

export function getStatusLabel(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "upcoming":
      return "Upcoming";

    case "declined":
      return "Declined";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";

    default:
      return status;
  }
}