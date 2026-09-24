import type {
  ConsultationStatus,
} from "@/types/consultation";

const CONSULTATION_STARTING_WINDOW_MS =
  15 * 60 * 1000;

const CONSULTATION_DURATION_MS =
  30 * 60 * 1000;

export function getAppointmentDateTime(
  date: string,
  time: string,
): Date | null {
  const appointmentDate =
    new Date(`${date} ${time}`);

  if (
    Number.isNaN(
      appointmentDate.getTime(),
    )
  ) {
    return null;
  }

  return appointmentDate;
}

export function getConsultationStatus(
  date: string,
  time: string,
  currentTime: number = Date.now(),
): ConsultationStatus {
  const appointmentDate =
    getAppointmentDateTime(
      date,
      time,
    );

  if (
    !appointmentDate ||
    currentTime <= 0
  ) {
    return "scheduled";
  }

  const start =
    appointmentDate.getTime();

  const end =
    start +
    CONSULTATION_DURATION_MS;

  if (currentTime >= end) {
    return "ended";
  }

  if (currentTime >= start) {
    return "live";
  }

  if (
    start - currentTime <=
    CONSULTATION_STARTING_WINDOW_MS
  ) {
    return "starting-soon";
  }

  return "scheduled";
}

export function isConsultationJoinable(
  status: ConsultationStatus,
): boolean {
  return (
    status === "starting-soon" ||
    status === "live"
  );
}

export function getConsultationStatusLabel(
  status: ConsultationStatus,
): string {
  switch (status) {
    case "starting-soon":
      return "Starting Soon";

    case "live":
      return "Live";

    case "ended":
      return "Ended";

    case "scheduled":
    default:
      return "Scheduled";
  }
}

export function getConsultationStatusClasses(
  status: ConsultationStatus,
): string {
  switch (status) {
    case "starting-soon":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "live":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "ended":
      return "bg-slate-100 text-slate-600";

    case "scheduled":
    default:
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }
}

export function getConsultationCountdown(
  date: string,
  time: string,
  currentTime: number = Date.now(),
): string | null {
  const appointmentDate =
    getAppointmentDateTime(
      date,
      time,
    );

  if (
    !appointmentDate ||
    currentTime <= 0
  ) {
    return null;
  }

  const difference =
    appointmentDate.getTime() -
    currentTime;

  if (difference <= 0) {
    return null;
  }

  const totalSeconds =
    Math.floor(
      difference / 1000,
    );

  const days =
    Math.floor(
      totalSeconds /
        (24 * 60 * 60),
    );

  const hours =
    Math.floor(
      (totalSeconds %
        (24 * 60 * 60)) /
        (60 * 60),
    );

  const minutes =
    Math.floor(
      (totalSeconds %
        (60 * 60)) /
        60,
    );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(
      hours,
    ).padStart(
      2,
      "0",
    )}h ${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}m`;
  }

  return `${String(
    hours,
  ).padStart(
    2,
    "0",
  )}:${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    seconds,
  ).padStart(
    2,
    "0",
  )}`;
}

export function getConsultationElapsedTime(
  date: string,
  time: string,
  currentTime: number = Date.now(),
): string | null {
  const appointmentDate =
    getAppointmentDateTime(
      date,
      time,
    );

  if (
    !appointmentDate ||
    currentTime <= 0
  ) {
    return null;
  }

  const difference =
    currentTime -
    appointmentDate.getTime();

  if (difference <= 0) {
    return null;
  }

  const totalSeconds =
    Math.floor(
      difference / 1000,
    );

  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    seconds,
  ).padStart(
    2,
    "0",
  )}`;
}

export function formatConsultationDate(
  date: string,
): string {
  const parsed =
    new Date(
      `${date}T00:00:00`,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

export function formatConsultationDateTime(
  date: string,
  time: string,
): string {
  const appointmentDate =
    getAppointmentDateTime(
      date,
      time,
    );

  if (!appointmentDate) {
    return `${date} ${time}`;
  }

  return appointmentDate.toLocaleString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export function getConsultationTypeLabel(
  type:
    | "online"
    | "in-person",
): string {
  return type === "online"
    ? "Online Consultation"
    : "In-Person Consultation";
}