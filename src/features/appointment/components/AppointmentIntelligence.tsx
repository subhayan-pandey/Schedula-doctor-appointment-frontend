"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Button from "@/components/ui/Button";

import {
  getAppointmentSummary,
  getNextPatientAppointment,
} from "@/lib/appointment-intelligence";

import {
  getAllDoctors,
} from "@/lib/doctors-store";

import type {
  Booking,
} from "@/types/booking";

import type {
  AppDispatch,
  RootState,
} from "@/store";

import {
  setDoctors,
} from "@/store/slices/doctorsSlice";

function CalendarIcon() {
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
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3v3m10-3v3M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V8a2.5 2.5 0 0 1 2.5-2.5Z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5v5l3.25 1.75"
      />
    </svg>
  );
}

function InsightIcon() {
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
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.75a8.25 8.25 0 1 0 8.25 8.25"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7v5l3.25 2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.75h4v4"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m20.5 3.75-4.25 4.25"
      />
    </svg>
  );
}

function formatDate(
  date: string,
): string {
  const parsed =
    new Date(date);

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
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-xs font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

export default function AppointmentIntelligence({
  bookings,
}: {
  bookings: Booking[];
}) {
  const dispatch =
    useDispatch<AppDispatch>();

  const doctors =
    useSelector(
      (state: RootState) =>
        state.doctors.doctors,
    );

  const doctorsInitialized =
    useSelector(
      (state: RootState) =>
        state.doctors.initialized,
    );

  useEffect(() => {
    if (!doctorsInitialized) {
      dispatch(
        setDoctors(
          getAllDoctors(),
        ),
      );
    }
  }, [
    dispatch,
    doctorsInitialized,
  ]);

  const summary =
    useMemo(
      () =>
        getAppointmentSummary(
          bookings,
        ),
      [bookings],
    );

  const nextAppointment =
    useMemo(
      () =>
        getNextPatientAppointment(
          bookings,
        ),
      [bookings],
    );

  const nextDoctor =
    useMemo(() => {
      if (
        !nextAppointment
      ) {
        return null;
      }

      return (
        doctors.find(
          (doctor) =>
            doctor.id ===
            nextAppointment
              .booking
              .doctorId,
        ) ?? null
      );
    }, [
      doctors,
      nextAppointment,
    ]);

  if (
    bookings.length === 0
  ) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <InsightIcon />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Appointment intelligence
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Your appointment overview
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Appointment insights will
              appear here after you book
              your first appointment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <InsightIcon />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Appointment intelligence
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Your appointment overview
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              A summary of your current
              appointment activity and
              next scheduled visit.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Upcoming"
            value={
              summary.upcoming
            }
            description="Scheduled visits ahead."
          />

          <StatCard
            label="Pending"
            value={
              summary.pending
            }
            description="Waiting for confirmation."
          />

          <StatCard
            label="Completed"
            value={
              summary.completed
            }
            description="Visits completed."
          />

          <StatCard
            label="Actionable"
            value={
              summary.actionable
            }
            description="Appointments with available actions."
          />
        </div>

        {nextAppointment && (
          <div className="rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                  Next appointment
                </p>

                <h3 className="mt-1 truncate text-base font-semibold text-[var(--ink)]">
                  {nextDoctor?.name ??
                    "Doctor appointment"}
                </h3>

                {nextDoctor && (
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {nextDoctor.specialty}
                  </p>
                )}

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <span className="text-[var(--brand-deep)]">
                      <CalendarIcon />
                    </span>

                    <span>
                      {formatDate(
                        nextAppointment
                          .booking
                          .date,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <span className="text-[var(--brand-deep)]">
                      <ClockIcon />
                    </span>

                    <span>
                      {
                        nextAppointment
                          .booking
                          .time
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/appointments/${nextAppointment.booking.id}`}
                >
                  <Button className="w-full sm:w-auto">
                    View appointment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {(summary.cancelled >
          0 ||
          summary.missed >
            0) && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--ink)]">
              Appointment history
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {summary.cancelled >
                0 &&
                `${summary.cancelled} cancelled ${
                  summary.cancelled ===
                  1
                    ? "appointment"
                    : "appointments"
                }`}

              {summary.cancelled >
                0 &&
                summary.missed >
                  0 &&
                " · "}

              {summary.missed >
                0 &&
                `${summary.missed} missed ${
                  summary.missed ===
                  1
                    ? "appointment"
                    : "appointments"
                }`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}