"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import StatCard from "@/features/doctor-dashboard/components/StatCard";
import DoctorAvailabilityIntelligence from "@/features/doctor-dashboard/components/DoctorAvailabilityIntelligence";

import {
  getSession,
} from "@/lib/storage";

import {
  getDoctorAccount,
} from "@/lib/doctor-account-store";

import {
  getAllBookings,
} from "@/lib/bookings-store";

import {
  getSlotsForDoctor,
} from "@/lib/slots-store";

import {
  toISODate,
} from "@/lib/utils/date";

import type {
  DoctorAccount,
} from "@/types/doctorAccount";

import type {
  Booking,
} from "@/types/booking";

const QUICK_LINKS = [
  {
    href: "/doctor/profile",
    title: "Profile",
    description:
      "View and update your professional details",
  },
  {
    href: "/doctor/slot",
    title: "Manage Availability",
    description:
      "Add, remove, or block appointment slots",
  },
  {
    href: "/doctor/appointments",
    title: "Appointments",
    description:
      "See every patient appointment and its status",
  },
  {
    href: "/doctor/prescriptions",
    title: "Prescriptions",
    description:
      "Create and manage patient prescriptions",
  },
  {
    href: "/doctor/calendar",
    title: "Calendar",
    description:
      "View your schedule and reschedule upcoming appointments",
  },
];

type Status =
  | "loading"
  | "unauthorized"
  | "ready";

function CalendarIcon() {
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
        d="M7 3v3m10-3v3M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V8a2.5 2.5 0 0 1 2.5-2.5Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
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
        cy="8"
        r="3"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
      />
    </svg>
  );
}

export default function DoctorDashboard() {
  const [
    status,
    setStatus,
  ] = useState<Status>(
    "loading",
  );

  const [
    account,
    setAccount,
  ] = useState<DoctorAccount | null>(
    null,
  );

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>(
    [],
  );

  const [
    availableSlotCount,
    setAvailableSlotCount,
  ] = useState(0);

  const [
    doctorId,
    setDoctorId,
  ] = useState<string | null>(
    null,
  );

  function refreshDashboard(
    currentDoctorId: string,
  ) {
    const doctorBookings =
      getAllBookings().filter(
        (booking) =>
          booking.doctorId ===
          currentDoctorId,
      );

    setBookings(
      doctorBookings,
    );

    const slots =
      getSlotsForDoctor(
        currentDoctorId,
      );

    setAvailableSlotCount(
      slots.filter(
        (slot) =>
          slot.status ===
          "available",
      ).length,
    );
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      const session =
        getSession();

      if (
        !session ||
        session.role !==
          "doctor"
      ) {
        setStatus(
          "unauthorized",
        );

        return;
      }

      setDoctorId(
        session.id,
      );

      setAccount(
        getDoctorAccount(),
      );

      refreshDashboard(
        session.id,
      );

      setStatus("ready");
    });
  }, []);

  useEffect(() => {
    const session =
      getSession();

    if (
      !session ||
      session.role !==
        "doctor"
    ) {
      return;
    }

    const currentDoctorId =
      session.id;

    function handleBookingsUpdated() {
      refreshDashboard(
        currentDoctorId,
      );
    }

    function handleSlotsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          doctorId?: string;
        }>;

      if (
        customEvent.detail
          ?.doctorId !==
        currentDoctorId
      ) {
        return;
      }

      refreshDashboard(
        currentDoctorId,
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      handleBookingsUpdated,
    );

    window.addEventListener(
      "schedula:slots-updated",
      handleSlotsUpdated,
    );

    window.addEventListener(
      "storage",
      handleBookingsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleBookingsUpdated,
      );

      window.removeEventListener(
        "schedula:slots-updated",
        handleSlotsUpdated,
      );

      window.removeEventListener(
        "storage",
        handleBookingsUpdated,
      );
    };
  }, []);

  const today =
    toISODate(
      new Date(),
    );

  const todayBookings =
    useMemo(
      () =>
        bookings
          .filter(
            (booking) =>
              booking.date ===
                today &&
              booking.status ===
                "upcoming",
          )
          .sort(
            (a, b) =>
              a.time.localeCompare(
                b.time,
              ),
          ),
      [
        bookings,
        today,
      ],
    );

  const upcomingCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "upcoming",
    ).length;

  const completedCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "completed",
    ).length;

  const pendingCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "pending",
    ).length;

  if (
    status ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading dashboard...
      </div>
    );
  }

  if (
    status ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          You need to log in as a doctor
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in with your doctor account
          to access your dashboard.
        </p>

        <Link
          href="/doctor/login"
          className="mt-6 inline-block"
        >
          <Button>
            Doctor login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <div>
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          Doctor Portal
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Welcome back
          {account
            ? `, ${account.name}`
            : ""}
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage appointments,
          availability and your
          professional profile.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming"
          value={
            upcomingCount
          }
          description="Appointments scheduled"
        />

        <StatCard
          label="Completed"
          value={
            completedCount
          }
          description="Visits completed"
        />

        <StatCard
          label="Available slots"
          value={
            availableSlotCount
          }
          description="Open for booking"
        />

        <StatCard
          label="Today"
          value={
            todayBookings.length
          }
          description="Appointments today"
        />
      </div>

      {doctorId && (
        <div className="mt-8">
          <DoctorAvailabilityIntelligence
            doctorId={doctorId}
          />
        </div>
      )}

      <section className="mt-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
                Appointment requests
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
                Pending appointments
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)]">
                New appointment requests
                are available in your
                appointment management
                page.
              </p>
            </div>

            <Link
              href="/doctor/appointments"
              className="shrink-0"
            >
              <Button
                size="sm"
                variant="outline"
              >
                View appointments
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-[var(--canvas)] p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                Pending requests
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Requests waiting for
                confirmation or decline.
              </p>
            </div>

            <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--warning)]">
              {pendingCount}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your practice
            from one place.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map(
            (link) => (
              <Link
                key={
                  link.href
                }
                href={
                  link.href
                }
                className="group rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--ink)]">
                      {
                        link.title
                      }
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {
                        link.description
                      }
                    </p>
                  </div>

                  <span className="text-lg text-[var(--brand)] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Today&apos;s appointments
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Your upcoming appointments
              for today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/doctor/calendar"
            >
              <Button
                variant="outline"
                size="sm"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon />
                  Calendar
                </span>
              </Button>
            </Link>

            <Link
              href="/doctor/appointments"
              className="self-center"
            >
              <span className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                View all
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-4">
          {todayBookings.length ===
          0 ? (
            <EmptyState
              title="No appointments today"
              description="Your upcoming appointments for today will appear here."
            />
          ) : (
            <div className="space-y-3">
              {todayBookings.map(
                (booking) => (
                  <div
                    key={
                      booking.id
                    }
                    className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                        <UserIcon />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--ink)]">
                          {
                            booking.patientName
                          }
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {
                            booking.time
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                        Upcoming
                      </span>

                      <Link
                        href={`/appointments/${booking.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}