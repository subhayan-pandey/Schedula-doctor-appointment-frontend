"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { getAllBookings } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/mock-data/doctors";
import { formatLongDate } from "@/lib/utils/date";
import type { Booking, BookingStatus } from "@/types/booking";

const TABS: { label: string; status: BookingStatus }[] = [
  { label: "Upcoming", status: "upcoming" },
  { label: "Completed", status: "completed" },
  { label: "Cancelled", status: "cancelled" },
];

export default function MyAppointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeStatus, setActiveStatus] = useState<BookingStatus>("upcoming");

  useEffect(() => {
    Promise.resolve().then(() => setBookings(getAllBookings()));
  }, []);

  const visibleBookings = bookings
    .filter((booking) => booking.status === activeStatus)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));

  return (
    <div>
      <div className="flex gap-2 border-b border-[var(--line)]">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            onClick={() => setActiveStatus(tab.status)}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              activeStatus === tab.status
                ? "border-[var(--brand)] text-[var(--brand-deep)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {visibleBookings.length === 0 ? (
          <EmptyState
            title="You don't have an appointment yet"
            description="Book an appointment with a doctor to see it here."
            action={
              <Link href="/doctors">
                <Button>Book appointment</Button>
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {visibleBookings.map((booking) => {
              const doctor = getDoctorById(booking.doctorId);
              return (
                <li
                  key={booking.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                    {doctor?.avatarInitials ?? "DR"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--ink)]">
                      {doctor?.name ?? "Doctor"}
                    </p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {doctor?.specialty} · {formatLongDate(booking.date)}, {booking.time}
                    </p>
                  </div>
                  <Link href={`/appointments/${booking.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}