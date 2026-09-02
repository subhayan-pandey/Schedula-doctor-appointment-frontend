"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import StatCard from "@/features/doctor-dashboard/components/StatCard";

import {
  getSession,
  clearSession,
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
    title:
      "Manage Availability",
    description:
      "Add, remove, or block appointment slots",
  },
  {
    href:
      "/doctor/appointments",
    title:
      "Appointments",
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
    href:
      "/doctor/calendar",
    title:
      "Calendar",
    description:
      "View your schedule and reschedule upcoming appointments",
  },
];

type Status =
  | "loading"
  | "unauthorized"
  | "ready";

export default function DoctorDashboard() {
  const router =
    useRouter();

  const [
    status,
    setStatus,
  ] =
    useState<Status>(
      "loading",
    );

  const [
    account,
    setAccount,
  ] = useState<
    DoctorAccount | null
  >(null);

  const [
    bookings,
    setBookings,
  ] = useState<
    Booking[]
  >([]);

  const [
    availableSlotCount,
    setAvailableSlotCount,
  ] =
    useState(0);

  useEffect(() => {
    Promise.resolve().then(
      () => {
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

        setAccount(
          getDoctorAccount(),
        );

        const doctorBookings =
          getAllBookings().filter(
            (booking) =>
              booking.doctorId ===
              session.id,
          );

        setBookings(
          doctorBookings,
        );

        const slots =
          getSlotsForDoctor(
            session.id,
          );

        setAvailableSlotCount(
          slots.filter(
            (slot) =>
              slot.status ===
              "available",
          ).length,
        );

        setStatus("ready");
      },
    );
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

  function handleLogout() {
    clearSession();

    router.push("/");
  }

  if (
    status === "loading"
  ) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading dashboard…
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming"
          value={upcomingCount}
          description="Appointments scheduled"
        />

        <StatCard
          label="Completed"
          value={completedCount}
          description="Visits completed"
        />

        <StatCard
          label="Available slots"
          value={availableSlotCount}
          description="Open for booking"
        />

        <StatCard
          label="Today"
          value={todayBookings.length}
          description="Appointments today"
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage your practice
              from one place.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
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

                  <span className="text-lg text-[var(--brand)]">
                    →
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Today&apos;s appointments
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Your upcoming appointments
              for today.
            </p>
          </div>

          <Link
            href="/doctor/appointments"
            className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4">
          {todayBookings.length ===
          0 ? (
            <EmptyState
              title="No appointments today"
              description="Your appointments for today will appear here."
            />
          ) : (
            <div className="space-y-3">
              {todayBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[var(--ink)]">
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

                    <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                      Upcoming
                    </span>
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