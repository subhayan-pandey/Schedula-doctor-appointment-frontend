"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { getSession } from "@/lib/storage";
import { getAllBookings } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/doctors-store";
import { formatLongDate } from "@/lib/utils/date";
import type { Booking, BookingStatus } from "@/types/booking";

type Status = "loading" | "unauthorized" | "ready";

const FILTERS: { label: string; status: BookingStatus | "all" }[] = [
  { label: "All", status: "all" },
  { label: "Upcoming", status: "upcoming" },
  { label: "Completed", status: "completed" },
  { label: "Cancelled", status: "cancelled" },
];

const STATUS_BADGE: Record<BookingStatus, string> = {
  upcoming: "bg-[var(--success-soft)] text-[var(--success)]",
  completed: "bg-[var(--brand-soft)] text-[var(--brand-deep)]",
  cancelled: "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]",
};

export default function DoctorAppointments() {
  const [status, setStatus] = useState<Status>("loading");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "all">("all");

  // Bookings live in localStorage (browser-only), so we load them on mount
  // rather than during server rendering — same pattern as MyAppointments
  // and DoctorDashboard. The read itself is synchronous; the microtask
  // wrapper just satisfies React's rule against setState during render.
  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();
      if (!session || session.role !== "doctor") {
        setStatus("unauthorized");
        return;
      }
      setDoctorId(session.id);
      setBookings(getAllBookings().filter((booking) => booking.doctorId === session.id));
      setStatus("ready");
    });
  }, []);

  const visibleBookings = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter);
    return [...filtered].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }, [bookings, activeFilter]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading appointments…
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
          Log in with your doctor account to see your appointments.
        </p>
        <Link href="/doctor/login" className="mt-6 inline-block">
          <Button>Doctor login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Appointments</h1>
      <p className="mt-1 text-[var(--muted)]">
        Every appointment patients have booked with you, in one place.
      </p>

      <div className="mt-6 flex gap-2 border-b border-[var(--line)]">
        {FILTERS.map((filter) => (
          <button
            key={filter.status}
            type="button"
            onClick={() => setActiveFilter(filter.status)}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeFilter === filter.status
                ? "border-[var(--brand)] text-[var(--brand-deep)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {visibleBookings.length === 0 ? (
          <EmptyState
            title="No appointments here yet"
            description="Appointments patients book with you will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {visibleBookings.map((booking) => {
              const doctor = doctorId ? getDoctorById(doctorId) : undefined;
              return (
                <li
                  key={booking.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                    {booking.patientName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--ink)]">
                      {booking.patientName}
                    </p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {formatLongDate(booking.date)}, {booking.time}
                    </p>
                    {doctor && (
                      <p className="truncate text-xs text-[var(--muted)]">
                        {doctor.specialty} · {doctor.clinic}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_BADGE[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}