"use client";

import Link from "next/link";
import { useMemo } from "react";

import type {
  AppointmentIntelligence,
  AppointmentTimelineEvent,
} from "@/types/appointment-intelligence";

import {
  getAppointmentIntelligence,
} from "@/lib/appointment-intelligence";

import type {
  Booking,
} from "@/types/booking";

type AppointmentTimelineProps = {
  booking?: Booking;
  intelligence?: AppointmentIntelligence;
  compact?: boolean;
};

function formatDateTime(
  timestamp: string,
): string {
  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return timestamp;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function getEventStyles(
  event: AppointmentTimelineEvent,
): {
  dot: string;
  icon: string;
} {
  switch (event.type) {
    case "confirmed":
    case "upcoming":
      return {
        dot: "bg-[var(--success)]",
        icon: "text-[var(--success)]",
      };

    case "cancelled":
    case "declined":
    case "missed":
      return {
        dot: "bg-[var(--urgent)]",
        icon: "text-[var(--urgent-deep)]",
      };

    case "rescheduled":
      return {
        dot: "bg-[var(--warning)]",
        icon: "text-[var(--warning)]",
      };

    case "completed":
      return {
        dot: "bg-[var(--brand)]",
        icon: "text-[var(--brand-deep)]",
      };

    case "created":
    default:
      return {
        dot: "bg-[var(--muted)]",
        icon: "text-[var(--muted)]",
      };
  }
}

function EventIcon({
  event,
}: {
  event: AppointmentTimelineEvent;
}) {
  const styles =
    getEventStyles(event);

  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full bg-[var(--canvas)] ${styles.icon}`}
      aria-hidden="true"
    >
      {event.type ===
      "completed" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5 12 4 4L19 6"
          />
        </svg>
      ) : event.type ===
        "cancelled" ||
        event.type ===
          "declined" ||
        event.type ===
          "missed" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            d="M6 6l12 12M18 6 6 18"
          />
        </svg>
      ) : event.type ===
        "rescheduled" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h10M7 7l3-3M7 7l3 3M17 17H7M17 17l-3-3M17 17l-3 3"
          />
        </svg>
      ) : event.type ===
        "confirmed" ||
        event.type ===
          "upcoming" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h14M13 6l6 6-6 6"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6l4 2"
          />
          <circle
            cx="12"
            cy="12"
            r="8.5"
          />
        </svg>
      )}
    </span>
  );
}

function TimelineEvent({
  event,
  isLast,
}: {
  event: AppointmentTimelineEvent;
  isLast: boolean;
}) {
  const styles =
    getEventStyles(event);

  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <span
          className={`absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px ${styles.dot} opacity-20`}
          aria-hidden="true"
        />
      )}

      <EventIcon
        event={event}
      />

      <div className="min-w-0 flex-1 pb-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {event.title}
          </p>

          <time className="shrink-0 text-xs text-[var(--muted)]">
            {formatDateTime(
              event.timestamp,
            )}
          </time>
        </div>

        {event.description && (
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {event.description}
          </p>
        )}

        {event.reason &&
          event.reason !==
            event.description && (
            <p className="mt-2 rounded-lg bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--muted)]">
              Reason:{" "}
              {event.reason}
            </p>
          )}
      </div>
    </div>
  );
}

export default function AppointmentTimeline({
  booking,
  intelligence,
  compact = false,
}: AppointmentTimelineProps) {
  const appointment =
    useMemo(() => {
      if (intelligence) {
        return intelligence;
      }

      if (!booking) {
        return null;
      }

      return getAppointmentIntelligence(
        booking,
      );
    }, [
      booking,
      intelligence,
    ]);

  if (!appointment) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="px-5 py-6 text-center sm:px-6">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-[var(--canvas)] text-[var(--muted)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2"
              />
              <circle
                cx="12"
                cy="12"
                r="8.5"
              />
            </svg>
          </div>

          <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
            No appointment timeline
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Appointment lifecycle information
            will appear here.
          </p>
        </div>
      </section>
    );
  }

  const events =
    appointment.timeline;

  if (events.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="px-5 py-6 text-center sm:px-6">
          <p className="text-sm font-semibold text-[var(--ink)]">
            No timeline events
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            There are currently no recorded lifecycle
            events for this appointment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] ${
        compact
          ? "p-4"
          : "p-5 sm:p-6"
      }`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
            Appointment history
          </p>

          <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">
            Timeline
          </h2>
        </div>

        <Link
          href={`/appointments/${appointment.booking.id}`}
          className="text-xs font-semibold text-[var(--brand-deep)] hover:underline"
        >
          View appointment
        </Link>
      </div>

      <div
        className={
          compact
            ? "mt-5"
            : "mt-6"
        }
      >
        {events.map(
          (event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={
                index ===
                events.length - 1
              }
            />
          ),
        )}
      </div>
    </section>
  );
}