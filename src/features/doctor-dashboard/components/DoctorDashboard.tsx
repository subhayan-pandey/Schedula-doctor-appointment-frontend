"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/features/doctor-dashboard/components/StatCard";

import {
  clearSession,
  getSession,
} from "@/lib/storage";

import { getDoctorAccount } from "@/lib/doctor-account-store";
import { getAllBookings } from "@/lib/bookings-store";
import { getSlotsForDoctor } from "@/lib/slots-store";
import { toISODate } from "@/lib/utils/date";

import type { DoctorAccount } from "@/types/doctorAccount";
import type { Booking } from "@/types/booking";

const QUICK_LINKS: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    href: "/doctor/profile",
    title: "Profile",
    description:
      "View and update your professional details.",
    icon: <ProfileIcon />,
  },
  {
    href: "/doctor/slot",
    title: "Manage availability",
    description:
      "Add, remove, or block appointment slots.",
    icon: <AvailabilityIcon />,
  },
  {
    href: "/doctor/appointments",
    title: "Appointments",
    description:
      "See every patient appointment and its status.",
    icon: <AppointmentsIcon />,
  },
  {
    href: "/doctor/prescriptions",
    title: "Prescriptions",
    description:
      "Create and manage patient prescriptions.",
    icon: <PrescriptionIcon />,
  },
  {
    href: "/doctor/calendar",
    title: "Calendar",
    description:
      "View your schedule and reschedule upcoming appointments.",
    icon: <CalendarIcon />,
  },
];

type Status =
  | "loading"
  | "unauthorized"
  | "ready";

export default function DoctorDashboard() {
  const router = useRouter();

  const [status, setStatus] =
    useState<Status>("loading");

  const [account, setAccount] =
    useState<DoctorAccount | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [availableSlotCount, setAvailableSlotCount] =
    useState(0);

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setStatus("unauthorized");
        return;
      }

      setAccount(getDoctorAccount());

      const doctorBookings =
        getAllBookings().filter(
          (booking) =>
            booking.doctorId === session.id,
        );

      setBookings(doctorBookings);

      const slots =
        getSlotsForDoctor(session.id);

      setAvailableSlotCount(
        slots.filter(
          (slot) =>
            slot.status === "available",
        ).length,
      );

      setStatus("ready");
    });
  }, []);

  const today = toISODate(new Date());

  const todayBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.date === today &&
            booking.status === "upcoming",
        )
        .sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
    [bookings, today],
  );

  const upcomingCount =
    bookings.filter(
      (booking) =>
        booking.status === "upcoming",
    ).length;

  const completedCount =
    bookings.filter(
      (booking) =>
        booking.status === "completed",
    ).length;

  const pendingCount =
    bookings.filter(
      (booking) =>
        booking.status === "pending",
    ).length;

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <ShieldIcon />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
              {getInitials(
                account?.name ?? "",
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                Doctor portal
              </p>

              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--ink)]">
                Welcome back
                {account
                  ? `, ${account.name}`
                  : ""}
              </h1>

              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Manage appointments,
                availability, prescriptions,
                and your professional profile.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Log out
          </Button>
        </div>
      </header>

      <section
        aria-label="Dashboard statistics"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard
          label="Upcoming"
          value={upcomingCount}
          description="Scheduled appointments"
          icon={<AppointmentsIcon />}
        />

        <StatCard
          label="Pending"
          value={pendingCount}
          description="Awaiting confirmation"
          icon={<PendingIcon />}
        />

        <StatCard
          label="Completed"
          value={completedCount}
          description="Visits completed"
          icon={<CompletedIcon />}
        />

        <StatCard
          label="Available slots"
          value={availableSlotCount}
          description="Open for booking"
          icon={<AvailabilityIcon />}
        />

        <StatCard
          label="Today"
          value={todayBookings.length}
          description="Upcoming today"
          icon={<CalendarIcon />}
        />
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Workspace
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Jump directly to the part of
              your practice you need.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                  {link.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-[var(--ink)]">
                      {link.title}
                    </h3>

                    <span
                      className="mt-0.5 text-[var(--brand-deep)] transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
              Daily schedule
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
              Today&apos;s appointments
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Upcoming appointments scheduled
              for today.
            </p>
          </div>

          <Link
            href="/doctor/appointments"
            className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
          >
            View all appointments
          </Link>
        </div>

        <div className="mt-4">
          {todayBookings.length === 0 ? (
            <EmptyState
              title="No appointments today"
              description="Your upcoming appointments for today will appear here."
            />
          ) : (
            <div className="space-y-3">
              {todayBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                          {getInitials(
                            booking.patientName,
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--ink)]">
                            {booking.patientName}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                            <span>
                              {booking.time}
                            </span>

                            <span className="hidden size-1 rounded-full bg-[var(--line)] sm:block" />

                            <span>
                              {booking.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--success)]">
                        <span className="size-1.5 rounded-full bg-[var(--success)]" />
                        Upcoming
                      </span>
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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "DR";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

function DashboardSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-label="Loading doctor dashboard"
    >
      <div className="h-32 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl bg-[var(--canvas)]"
            />
          ),
        )}
      </div>

      <div className="mt-7">
        <div className="h-12 w-52 rounded bg-[var(--canvas)]" />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-[var(--canvas)]"
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-7">
        <div className="h-12 w-56 rounded bg-[var(--canvas)]" />
        <div className="mt-4 h-24 rounded-2xl bg-[var(--canvas)]" />
      </div>
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" />
      <path
        d="M5.5 20c.8-3.5 3-5.3 6.5-5.3s5.7 1.8 6.5 5.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvailabilityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
      />
      <path
        d="M9 15h6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppointmentsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
      />
      <path
        d="M8 14h3M8 17h5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrescriptionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
      />
      <path
        d="M8.5 8h7M8.5 11.5h7M8.5 15h4"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 8v4l2.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompletedIcon() {
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
        d="m6 12 4 4 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 7v5c0 4.3-2.7 7.3-7 8.8C7.7 19.3 5 16.3 5 12V7l7-3.5Z"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5 11.3 14l3.5-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}