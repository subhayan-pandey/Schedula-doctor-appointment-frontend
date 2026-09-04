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
  const nextDate = new Date(date);

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
  const nextDate = new Date(date);

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

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBookingDate(
  booking: Booking,
) {
  const date =
    new Date(
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
    completed: 0,
    cancelled: 0,
    missed: 0,
  };

  bookings.forEach(
    (booking) => {
      counts[
        booking.status
      ] += 1;
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
      const date =
        new Date(
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
        DAY_NAMES[
          date.getDay()
        ];

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
    (
      count,
      day,
    ) => {
      if (
        count >
        highestCount
      ) {
        busiestDay =
          day;

        highestCount =
          count;
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
    (
      count,
      time,
    ) => {
      if (
        count >
        highestCount
      ) {
        peakTime =
          time;

        highestCount =
          count;
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
  const insights:
    AnalyticsInsight[] = [];

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
      title:
        "Busiest day",
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

  return insights.slice(
    0,
    5,
  );
}

function buildGrowthItems(
  analytics: {
    totalAppointments: number;
    completionRate: number;
    cancellationRate: number;
    missedRate: number;
  },
) {
  const strengths:
    GrowthItem[] = [];

  const improvements:
    GrowthItem[] = [];

  if (
    analytics.totalAppointments ===
    0
  ) {
    improvements.push({
      title:
        "Build appointment activity",
      description:
        "There is not enough appointment data yet to evaluate your practice performance.",
      type: "improvement",
    });

    return {
      strengths,
      improvements,
    };
  }

  if (
    analytics.completionRate >=
    75
  ) {
    strengths.push({
      title:
        "Strong appointment completion",
      description:
        `${analytics.completionRate}% of appointments have been completed in the selected period.`,
      type: "strength",
    });
  } else {
    improvements.push({
      title:
        "Improve appointment completion",
      description:
        "Review pending, confirmed, and upcoming appointments to improve the proportion of completed visits.",
      type: "improvement",
    });
  }

  if (
    analytics.cancellationRate <=
    15
  ) {
    strengths.push({
      title:
        "Controlled cancellation rate",
      description:
        "Appointment cancellations remain relatively low in the selected period.",
      type: "strength",
    });
  } else {
    improvements.push({
      title:
        "Reduce appointment cancellations",
      description:
        "A higher cancellation rate may indicate scheduling conflicts or appointment uncertainty.",
      type: "improvement",
    });
  }

  if (
    analytics.missedRate <=
    10
  ) {
    strengths.push({
      title:
        "Good appointment attendance",
      description:
        "Missed appointments are currently within a manageable range.",
      type: "strength",
    });
  } else {
    improvements.push({
      title:
        "Reduce missed appointments",
      description:
        "A higher number of missed appointments may affect appointment efficiency.",
      type: "improvement",
    });
  }

  if (
    strengths.length ===
    0
  ) {
    strengths.push({
      title:
        "Practice activity is being tracked",
      description:
        "Continue building appointment history to establish clearer performance patterns.",
      type: "strength",
    });
  }

  if (
    improvements.length ===
    0
  ) {
    improvements.push({
      title:
        "Maintain current performance",
      description:
        "Current appointment indicators are stable. Continue monitoring future trends.",
      type: "improvement",
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
  const now =
    new Date();

  const today =
    startOfDay(now);

  const days =
    getPeriodDays(period);

  if (
    period === "7d"
  ) {
    const points:
      AnalyticsTrendPoint[] = [];

    for (
      let index = 6;
      index >= 0;
      index -= 1
    ) {
      const date =
        addDays(
          today,
          -index,
        );

      const key =
        formatDateKey(
          date,
        );

      const value =
        bookings.filter(
          (booking) => {
            const bookingDate =
              getBookingDate(
                booking,
              );

            if (!bookingDate) {
              return false;
            }

            return (
              formatDateKey(
                bookingDate,
              ) === key
            );
          },
        ).length;

      points.push({
        label:
          date.toLocaleDateString(
            undefined,
            {
              weekday:
                "short",
            },
          ),
        value,
      });
    }

    return points;
  }

  if (
    period === "30d"
  ) {
    const points:
      AnalyticsTrendPoint[] = [];

    for (
      let index = 3;
      index >= 0;
      index -= 1
    ) {
      const end =
        addDays(
          today,
          -(index * 7),
        );

      const start =
        addDays(
          end,
          -6,
        );

      const value =
        bookings.filter(
          (booking) => {
            const bookingDate =
              getBookingDate(
                booking,
              );

            if (!bookingDate) {
              return false;
            }

            const day =
              startOfDay(
                bookingDate,
              ).getTime();

            return (
              day >=
                startOfDay(
                  start,
                ).getTime() &&
              day <=
                startOfDay(
                  end,
                ).getTime()
            );
          },
        ).length;

      points.push({
        label:
          `Week ${4 - index}`,
        value,
      });
    }

    return points;
  }

  if (
    period === "90d"
  ) {
    const points:
      AnalyticsTrendPoint[] = [];

    for (
      let index = 2;
      index >= 0;
      index -= 1
    ) {
      const monthDate =
        new Date(
          today.getFullYear(),
          today.getMonth() - index,
          1,
        );

      const year =
        monthDate.getFullYear();

      const month =
        monthDate.getMonth();

      const value =
        bookings.filter(
          (booking) => {
            const bookingDate =
              getBookingDate(
                booking,
              );

            if (!bookingDate) {
              return false;
            }

            return (
              bookingDate.getFullYear() ===
                year &&
              bookingDate.getMonth() ===
                month
            );
          },
        ).length;

      points.push({
        label:
          monthDate.toLocaleDateString(
            undefined,
            {
              month:
                "short",
              year:
                "numeric",
            },
          ),
        value,
      });
    }

    return points;
  }

  const datedBookings =
    bookings
      .map(
        getBookingDate,
      )
      .filter(
        (
          date,
        ): date is Date =>
          date !== null,
      );

  if (
    datedBookings.length ===
    0
  ) {
    return [];
  }

  const firstDate =
    datedBookings.reduce(
      (
        earliest,
        date,
      ) =>
        date < earliest
          ? date
          : earliest,
    );

  const firstMonth =
    new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      1,
    );

  const currentMonth =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

  const points:
    AnalyticsTrendPoint[] = [];

  const cursor =
    new Date(firstMonth);

  while (
    cursor <= currentMonth
  ) {
    const year =
      cursor.getFullYear();

    const month =
      cursor.getMonth();

    const value =
      bookings.filter(
        (booking) => {
          const bookingDate =
            getBookingDate(
              booking,
            );

          if (!bookingDate) {
            return false;
          }

          return (
            bookingDate.getFullYear() ===
              year &&
            bookingDate.getMonth() ===
              month
          );
        },
      ).length;

    points.push({
      label:
        cursor.toLocaleDateString(
          undefined,
          {
            month:
              "short",
            year:
              "numeric",
          },
        ),
      value,
    });

    cursor.setMonth(
      cursor.getMonth() + 1,
    );
  }

  return points;
}

export function filterBookingsByPeriod(
  bookings: Booking[],
  period: AnalyticsPeriod,
) {
  if (
    period === "all"
  ) {
    return bookings;
  }

  const days =
    getPeriodDays(
      period,
    );

  if (!days) {
    return bookings;
  }

  const now =
    new Date();

  const start =
    addDays(
      now,
      -(days - 1),
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
          start &&
        bookingDate <=
          now
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
    getPeriodDays(
      period,
    );

  if (!days) {
    return [];
  }

  const now =
    new Date();

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

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";
  }
}