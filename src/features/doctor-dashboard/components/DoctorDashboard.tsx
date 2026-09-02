"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import StatCard from "@/features/doctor-dashboard/components/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import { getSession, clearSession } from "@/lib/storage";
import { getDoctorAccount } from "@/lib/doctor-account-store";
import { getAllBookings } from "@/lib/bookings-store";
import { getSlotsForDoctor } from "@/lib/slots-store";
import { toISODate } from "@/lib/utils/date";
import type { DoctorAccount } from "@/types/doctorAccount";
import type { Booking } from "@/types/booking";

const QUICK_LINKS = [
  {
    href: "/doctor/profile",
    title: "Profile",
    description: "View and update your professional details",
  },
  {
    href: "/doctor/slots",
    title: "Manage Availability",
    description: "Add, remove, or block appointment slots",
  },
  {
    href: "/doctor/appointments",
    title: "Appointments",
    description: "See every patient appointment and its status",
  },
];

type Status = "loading" | "unauthorized" | "ready";

export default function DoctorDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [account, setAccount] = useState<DoctorAccount | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlotCount, setAvailableSlotCount] = useState(0);

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();
      if (!session || session.role !== "doctor") {
        setStatus("unauthorized");
        return;
      }

      setAccount(getDoctorAccount());
      setBookings(getAllBookings().filter((booking) => booking.doctorId === session.id));
      const slots = getSlotsForDoctor(session.id);
      setAvailableSlotCount(slots.filter((slot) => slot.status === "available").length);
      setStatus("ready");
    });
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading dashboard…
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          You need to log in as a doctor
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in with your doctor account to see your dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/doctor/login">
            <Button>Doctor login</Button>
          </Link>
          <Link href="/doctor/register">
            <Button variant="outline">Register as a doctor</Button>
          </Link>
        </div>
      </div>
    );
  }

  const todayISO = toISODate(new Date());
  const totalAppointments = bookings.length;
  const upcomingAppointments = bookings.filter((booking) => booking.status === "upcoming");
  const todaysAppointments = upcomingAppointments
    .filter((booking) => booking.date === todayISO)
    .sort((a, b) => (a.time > b.time ? 1 : -1));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Hello, {account?.name ?? "Doctor"}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {account ? `${account.specialty} · ${account.clinic}, ${account.location}` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total appointments" value={totalAppointments} />
        <StatCard label="Upcoming" value={upcomingAppointments.length} accent="success" />
        <StatCard label="Today" value={todaysAppointments.length} accent="urgent" />
        <StatCard label="Available slots" value={availableSlotCount} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[var(--ink)]">Today&apos;s appointments</p>
          <Link
            href="/doctor/appointments"
            className="text-sm font-semibold text-[var(--brand-deep)] hover:text-[var(--brand)]"
          >
            View all →
          </Link>
        </div>

        <div className="mt-3">
          {todaysAppointments.length === 0 ? (
            <EmptyState
              title="No appointments today"
              description="Appointments booked by patients for today will show up here."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {todaysAppointments.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">{booking.patientName}</p>
                    <p className="text-sm text-[var(--muted)]">{booking.time}</p>
                  </div>
                  <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
                    Upcoming
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            <p className="font-semibold text-[var(--ink)]">{link.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}