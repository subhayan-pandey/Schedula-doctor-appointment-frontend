import type {
  ChatResponse,
  ChatUserRole,
} from "@/types/chatbot";

import {
  getBookingsByPatientId,
} from "@/lib/bookings-store";

import {
  getDoctorById,
} from "@/lib/doctors-store";

import type {
  Booking,
} from "@/types/booking";

function normalizeMessage(
  message: string,
): string {
  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBookingTimestamp(
  booking: Booking,
): number {
  const timestamp =
    new Date(
      `${booking.date}T${booking.time}`,
    ).getTime();

  if (
    Number.isNaN(timestamp)
  ) {
    return new Date(
      booking.date,
    ).getTime();
  }

  return timestamp;
}

function sortByDateAscending(
  bookings: Booking[],
): Booking[] {
  return [...bookings].sort(
    (a, b) =>
      getBookingTimestamp(a) -
      getBookingTimestamp(b),
  );
}

function sortByDateDescending(
  bookings: Booking[],
): Booking[] {
  return [...bookings].sort(
    (a, b) =>
      getBookingTimestamp(b) -
      getBookingTimestamp(a),
  );
}

function getDoctorName(
  doctorId: string,
): string {
  return (
    getDoctorById(
      doctorId,
    )?.name ??
    "your doctor"
  );
}

function formatBooking(
  booking: Booking,
): string {
  const doctorName =
    getDoctorName(
      booking.doctorId,
    );

  return `${doctorName} on ${booking.date} at ${booking.time}`;
}

function getUpcomingBookings(
  bookings: Booking[],
): Booking[] {
  const now =
    Date.now();

  return sortByDateAscending(
    bookings.filter(
      (booking) =>
        (
          booking.status ===
            "pending" ||
          booking.status ===
            "confirmed" ||
          booking.status ===
            "upcoming"
        ) &&
        getBookingTimestamp(
          booking,
        ) >= now,
    ),
  );
}

function getLatestBooking(
  bookings: Booking[],
): Booking | undefined {
  return sortByDateDescending(
    bookings,
  )[0];
}

function response(
  content: string,
  href?: string,
  label?: string,
): ChatResponse {
  if (
    href &&
    label
  ) {
    return {
      content,
      action: {
        label,
        href,
      },
    };
  }

  return {
    content,
  };
}

export function getAppointmentAssistantResponse(
  message: string,
  role: ChatUserRole,
  patientId?: string,
): ChatResponse {
  if (
    role !== "patient" ||
    !patientId
  ) {
    return response(
      "The Appointment Assistant can help patients understand and manage their appointment workflow. Open My Appointments to view your appointment information.",
      "/appointments",
      "My appointments",
    );
  }

  const bookings =
    getBookingsByPatientId(
      patientId,
    );

  const normalized =
    normalizeMessage(
      message,
    );

  if (
    bookings.length === 0
  ) {
    return response(
      "You don't have any appointments yet. You can find a doctor and choose an available slot to book your first appointment.",
      "/doctors",
      "Find doctors",
    );
  }

  const upcomingBookings =
    getUpcomingBookings(
      bookings,
    );

  const pendingBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "pending",
    );

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
          "confirmed" ||
        booking.status ===
          "upcoming",
    );

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "completed",
    );

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "cancelled",
    );

  const missedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "missed",
    );

  if (
    /\b(next|upcoming|nearest|soonest)\b/.test(
      normalized,
    )
  ) {
    const next =
      upcomingBookings[0];

    if (!next) {
      return response(
        "You don't currently have an upcoming appointment. You can find a doctor and book another available slot.",
        "/doctors",
        "Find doctors",
      );
    }

    return response(
      `Your next appointment is with ${formatBooking(
        next,
      )}. Its current status is ${next.status}.`,
      `/appointments/${next.id}`,
      "View appointment",
    );
  }

  if (
    /\b(pending|awaiting|waiting)\b/.test(
      normalized,
    )
  ) {
    if (
      pendingBookings.length ===
      0
    ) {
      return response(
        "You don't currently have any pending appointment requests.",
        "/appointments",
        "My appointments",
      );
    }

    const latest =
      sortByDateAscending(
        pendingBookings,
      )[0];

    return response(
      `You have ${pendingBookings.length} pending appointment ${
        pendingBookings.length ===
        1
          ? "request"
          : "requests"
      }. The nearest one is with ${formatBooking(
        latest,
      )}.`,
      `/appointments/${latest.id}`,
      "View appointment",
    );
  }

  if (
    /\b(confirmed|scheduled|upcoming)\b/.test(
      normalized,
    )
  ) {
    if (
      confirmedBookings.length ===
      0
    ) {
      return response(
        "You don't currently have any confirmed or upcoming appointments.",
        "/appointments",
        "My appointments",
      );
    }

    const next =
      getUpcomingBookings(
        confirmedBookings,
      )[0] ??
      sortByDateAscending(
        confirmedBookings,
      )[0];

    return response(
      `You have ${confirmedBookings.length} confirmed or upcoming ${
        confirmedBookings.length ===
        1
          ? "appointment"
          : "appointments"
      }. The nearest one is with ${formatBooking(
        next,
      )}.`,
      `/appointments/${next.id}`,
      "View appointment",
    );
  }

  if (
    /\b(completed|finished|past)\b/.test(
      normalized,
    )
  ) {
    if (
      completedBookings.length ===
      0
    ) {
      return response(
        "You don't have any completed appointments recorded yet.",
        "/appointments",
        "My appointments",
      );
    }

    const latest =
      getLatestBooking(
        completedBookings,
      );

    if (!latest) {
      return response(
        "You don't have any completed appointments recorded yet.",
        "/appointments",
        "My appointments",
      );
    }

    return response(
      `You have ${completedBookings.length} completed ${
        completedBookings.length ===
        1
          ? "appointment"
          : "appointments"
      }. Your latest completed appointment was with ${formatBooking(
        latest,
      )}.`,
      `/appointments/${latest.id}`,
      "View appointment",
    );
  }

  if (
    /\b(cancelled|canceled)\b/.test(
      normalized,
    )
  ) {
    if (
      cancelledBookings.length ===
      0
    ) {
      return response(
        "You don't have any cancelled appointments recorded.",
        "/appointments",
        "My appointments",
      );
    }

    const latest =
      getLatestBooking(
        cancelledBookings,
      );

    if (!latest) {
      return response(
        "You don't have any cancelled appointments recorded.",
        "/appointments",
        "My appointments",
      );
    }

    return response(
      `You have ${cancelledBookings.length} cancelled ${
        cancelledBookings.length ===
        1
          ? "appointment"
          : "appointments"
      }. The latest one was with ${formatBooking(
        latest,
      )}.`,
      `/appointments/${latest.id}`,
      "View appointment",
    );
  }

  if (
    /\b(missed|no show|no-show)\b/.test(
      normalized,
    )
  ) {
    if (
      missedBookings.length ===
      0
    ) {
      return response(
        "You don't have any appointments marked as missed.",
        "/appointments",
        "My appointments",
      );
    }

    const latest =
      getLatestBooking(
        missedBookings,
      );

    if (!latest) {
      return response(
        "You don't have any appointments marked as missed.",
        "/appointments",
        "My appointments",
      );
    }

    return response(
      `You have ${missedBookings.length} missed ${
        missedBookings.length ===
        1
          ? "appointment"
          : "appointments"
      }. The latest one was with ${formatBooking(
        latest,
      )}.`,
      `/appointments/${latest.id}`,
      "View appointment",
    );
  }

  if (
    /\b(reschedule|rescheduling|change.*appointment|change.*booking|move.*appointment)\b/.test(
      normalized,
    )
  ) {
    const eligible =
      bookings.filter(
        (booking) =>
          booking.status ===
            "confirmed" ||
          booking.status ===
            "upcoming",
      );

    if (
      eligible.length ===
      0
    ) {
      return response(
        "You don't currently have a confirmed or upcoming appointment eligible for the normal rescheduling flow.",
        "/appointments",
        "My appointments",
      );
    }

    const appointment =
      getUpcomingBookings(
        eligible,
      )[0] ??
      sortByDateAscending(
        eligible,
      )[0];

    return response(
      `Your rescheduling option is available from the appointment details for ${formatBooking(
        appointment,
      )}.`,
      `/appointments/${appointment.id}`,
      "View appointment",
    );
  }

  if (
    /\b(cancel|cancellation)\b/.test(
      normalized,
    )
  ) {
    const eligible =
      bookings.filter(
        (booking) =>
          booking.status ===
            "pending" ||
          booking.status ===
            "confirmed" ||
          booking.status ===
            "upcoming",
      );

    if (
      eligible.length ===
      0
    ) {
      return response(
        "You don't currently have an appointment that can be cancelled from the normal appointment flow.",
        "/appointments",
        "My appointments",
      );
    }

    const appointment =
      getUpcomingBookings(
        eligible,
      )[0] ??
      sortByDateAscending(
        eligible,
      )[0];

    return response(
      `You can manage cancellation for ${formatBooking(
        appointment,
      )} from its appointment details.`,
      `/appointments/${appointment.id}`,
      "View appointment",
    );
  }

  if (
    /\b(detail|details|information|info)\b/.test(
      normalized,
    )
  ) {
    const appointment =
      upcomingBookings[0] ??
      getLatestBooking(
        bookings,
      );

    if (!appointment) {
      return response(
        "Open My Appointments to review your appointment information.",
        "/appointments",
        "My appointments",
      );
    }

    return response(
      `Your ${
        appointment.status
      } appointment is with ${formatBooking(
        appointment,
      )}.`,
      `/appointments/${appointment.id}`,
      "View appointment",
    );
  }

  if (
    /\b(how many|count|number)\b/.test(
      normalized,
    )
  ) {
    return response(
      `You have ${bookings.length} total ${
        bookings.length ===
        1
          ? "appointment"
          : "appointments"
      }: ${upcomingBookings.length} upcoming, ${pendingBookings.length} pending, ${completedBookings.length} completed, ${cancelledBookings.length} cancelled, and ${missedBookings.length} missed.`,
      "/appointments",
      "My appointments",
    );
  }

  const next =
    upcomingBookings[0];

  if (next) {
    return response(
      `I can help with your appointments. Your next appointment is with ${formatBooking(
        next,
      )}, and its current status is ${next.status}. You can open it to view the available appointment actions.`,
      `/appointments/${next.id}`,
      "View appointment",
    );
  }

  return response(
    "I can help you understand your appointments, including upcoming, pending, completed, cancelled, and missed appointments. Open My Appointments to view the full list.",
    "/appointments",
    "My appointments",
  );
}