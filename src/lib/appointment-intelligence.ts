import type {
  Booking,
  BookingStatus,
} from "@/types/booking";

import type {
  AppointmentIntelligence,
  AppointmentLifecycleEventType,
  AppointmentTimelineEvent,
} from "@/types/appointment-intelligence";

import {
  canCancelBooking,
  canRescheduleBooking,
} from "@/lib/bookings-store";

function parseAppointmentDate(
  booking: Booking,
): Date | null {
  const date = booking.date?.trim();
  const time = booking.time?.trim();

  if (!date) {
    return null;
  }

  const normalizedTime = time
    ? time.split(" - ")[0].trim()
    : "12:00 AM";

  const parsed = new Date(
    `${date} ${normalizedTime}`,
  );

  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(date);

    return Number.isNaN(
      fallback.getTime(),
    )
      ? null
      : fallback;
  }

  return parsed;
}

function isFutureAppointment(
  booking: Booking,
  now = new Date(),
): boolean {
  const appointmentDate =
    parseAppointmentDate(booking);

  if (!appointmentDate) {
    return (
      booking.status === "pending" ||
      booking.status === "confirmed" ||
      booking.status === "upcoming"
    );
  }

  return appointmentDate.getTime() > now.getTime();
}

function getLifecycleTimestamp(
  booking: Booking,
  type: AppointmentLifecycleEventType,
): string {
  if (
    type === "created"
  ) {
    return booking.createdAt;
  }

  if (
    type === "rescheduled" ||
    type === "confirmed" ||
    type === "upcoming" ||
    type === "cancelled" ||
    type === "declined" ||
    type === "completed" ||
    type === "missed"
  ) {
    return (
      booking.updatedAt ??
      booking.createdAt
    );
  }

  return (
    booking.updatedAt ??
    booking.createdAt
  );
}

function getStatusEvent(
  booking: Booking,
): AppointmentTimelineEvent | null {
  const status =
    booking.status;

  const config: Record<
    BookingStatus,
    {
      type: AppointmentLifecycleEventType;
      title: string;
      description: string;
    }
  > = {
    pending: {
      type: "created",
      title: "Appointment requested",
      description:
        "Your appointment request is waiting for doctor confirmation.",
    },
    confirmed: {
      type: "confirmed",
      title: "Appointment confirmed",
      description:
        "The doctor has confirmed your appointment.",
    },
    upcoming: {
      type: "upcoming",
      title: "Appointment scheduled",
      description:
        "Your appointment is scheduled and upcoming.",
    },
    completed: {
      type: "completed",
      title: "Appointment completed",
      description:
        "This appointment has been completed.",
    },
    cancelled: {
      type: "cancelled",
      title: "Appointment cancelled",
      description:
        booking.actionReason ??
        "This appointment has been cancelled.",
    },
    declined: {
      type: "declined",
      title: "Appointment declined",
      description:
        booking.actionReason ??
        "The doctor declined this appointment request.",
    },
    missed: {
      type: "missed",
      title: "Appointment missed",
      description:
        "This appointment was marked as missed.",
    },
  };

  const item =
    config[status];

  if (!item) {
    return null;
  }

  return {
    id: `${booking.id}-${item.type}`,
    appointmentId:
      booking.id,
    type: item.type,
    status,
    title: item.title,
    description:
      item.description,
    timestamp:
      getLifecycleTimestamp(
        booking,
        item.type,
      ),
    reason:
      booking.actionReason,
  };
}

function getTimeline(
  booking: Booking,
): AppointmentTimelineEvent[] {
  const events: AppointmentTimelineEvent[] =
    [];

  events.push({
    id: `${booking.id}-created`,
    appointmentId:
      booking.id,
    type: "created",
    status: "pending",
    title: "Appointment requested",
    description:
      "Appointment request created.",
    timestamp:
      booking.createdAt,
  });

  if (
    booking.status ===
      "confirmed" ||
    booking.status ===
      "upcoming" ||
    booking.status ===
      "completed"
  ) {
    events.push({
      id: `${booking.id}-confirmed`,
      appointmentId:
        booking.id,
      type: "confirmed",
      status:
        booking.status,
      title:
        "Appointment confirmed",
      description:
        "The doctor confirmed the appointment.",
      timestamp:
        booking.updatedAt ??
        booking.createdAt,
    });
  }

  if (
    (booking.rescheduleCount ??
      0) > 0
  ) {
    events.push({
      id: `${booking.id}-rescheduled`,
      appointmentId:
        booking.id,
      type: "rescheduled",
      status:
        booking.status,
      title:
        "Appointment rescheduled",
      description:
        "The appointment time was changed.",
      timestamp:
        booking.updatedAt ??
        booking.createdAt,
      reason:
        booking.actionReason,
    });
  }

  const statusEvent =
    getStatusEvent(
      booking,
    );

  if (
    statusEvent &&
    !events.some(
      (event) =>
        event.type ===
        statusEvent.type,
    )
  ) {
    events.push(
      statusEvent,
    );
  }

  return events.sort(
    (a, b) =>
      new Date(
        a.timestamp,
      ).getTime() -
      new Date(
        b.timestamp,
      ).getTime(),
  );
}

function getAvailableActions(
  booking: Booking,
  now = new Date(),
): AppointmentIntelligence["availableActions"] {
  const actions: AppointmentIntelligence["availableActions"] =
    [
      "view",
    ];

  if (
    canCancelBooking(
      booking,
    )
  ) {
    actions.push(
      "cancel",
    );
  }

  if (
    canRescheduleBooking(
      booking,
    ) &&
    isFutureAppointment(
      booking,
      now,
    )
  ) {
    actions.push(
      "reschedule",
    );
  }

  if (
    booking.status ===
      "completed" ||
    booking.status ===
      "cancelled" ||
    booking.status ===
      "declined" ||
    booking.status ===
      "missed"
  ) {
    actions.push(
      "rebook",
    );
  }

  if (
    booking.status ===
    "completed"
  ) {
    actions.push(
      "review",
    );
    actions.push(
      "prescription",
    );
  }

  return actions;
}

function isUpcoming(
  booking: Booking,
  now = new Date(),
): boolean {
  if (
    booking.status ===
      "cancelled" ||
    booking.status ===
      "declined" ||
    booking.status ===
      "completed" ||
    booking.status ===
      "missed"
  ) {
    return false;
  }

  return isFutureAppointment(
    booking,
    now,
  );
}

function isActionable(
  booking: Booking,
  now = new Date(),
): boolean {
  const actions =
    getAvailableActions(
      booking,
      now,
    );

  return (
    actions.length > 1
  );
}

export function getAppointmentIntelligence(
  booking: Booking,
  now = new Date(),
): AppointmentIntelligence {
  return {
    booking,
    isUpcoming:
      isUpcoming(
        booking,
        now,
      ),
    isActionable:
      isActionable(
        booking,
        now,
      ),
    availableActions:
      getAvailableActions(
        booking,
        now,
      ),
    timeline:
      getTimeline(
        booking,
      ),
  };
}

export function getPatientAppointmentIntelligence(
  bookings: Booking[],
  now = new Date(),
): AppointmentIntelligence[] {
  return bookings
    .map((booking) =>
      getAppointmentIntelligence(
        booking,
        now,
      ),
    )
    .sort((a, b) => {
      const aDate =
        parseAppointmentDate(
          a.booking,
        )?.getTime() ??
        0;

      const bDate =
        parseAppointmentDate(
          b.booking,
        )?.getTime() ??
        0;

      return (
        bDate - aDate
      );
    });
}

export function getNextPatientAppointment(
  bookings: Booking[],
  now = new Date(),
): AppointmentIntelligence | null {
  const upcoming =
    getPatientAppointmentIntelligence(
      bookings,
      now,
    )
      .filter(
        (item) =>
          item.isUpcoming,
      )
      .sort((a, b) => {
        const aDate =
          parseAppointmentDate(
            a.booking,
          )?.getTime() ??
          Number.MAX_SAFE_INTEGER;

        const bDate =
          parseAppointmentDate(
            b.booking,
          )?.getTime() ??
          Number.MAX_SAFE_INTEGER;

        return (
          aDate - bDate
        );
      });

  return (
    upcoming[0] ??
    null
  );
}

export function getAppointmentSummary(
  bookings: Booking[],
  now = new Date(),
) {
  const intelligence =
    getPatientAppointmentIntelligence(
      bookings,
      now,
    );

  const upcoming =
    intelligence.filter(
      (item) =>
        item.isUpcoming,
    ).length;

  const completed =
    bookings.filter(
      (booking) =>
        booking.status ===
        "completed",
    ).length;

  const cancelled =
    bookings.filter(
      (booking) =>
        booking.status ===
        "cancelled",
    ).length;

  const missed =
    bookings.filter(
      (booking) =>
        booking.status ===
        "missed",
    ).length;

  const pending =
    bookings.filter(
      (booking) =>
        booking.status ===
        "pending",
    ).length;

  const actionable =
    intelligence.filter(
      (item) =>
        item.isActionable,
    ).length;

  return {
    total:
      bookings.length,
    upcoming,
    completed,
    cancelled,
    missed,
    pending,
    actionable,
  };
}