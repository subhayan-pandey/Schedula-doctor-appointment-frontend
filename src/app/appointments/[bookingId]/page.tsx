"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { getBookingById } from "@/lib/bookings-store";
import { getDoctorById } from "@/lib/mock-data/doctors";
import { formatLongDate } from "@/lib/utils/date";
import type { Booking } from "@/types/booking";

export default function AppointmentConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    Promise.resolve().then(() => setBooking(getBookingById(bookingId) ?? null));
  }, [bookingId]);

  if (booking === undefined) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading appointment…
      </div>
    );
  }

  if (booking === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          We couldn&apos;t find that appointment
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          It may have been booked in a different browser, or the link is
          incorrect.
        </p>
        <Link href="/doctors" className="mt-6 inline-block">
          <Button>Find a doctor</Button>
        </Link>
      </div>
    );
  }

  const doctor = getDoctorById(booking.doctorId);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-0">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--success-soft)] text-2xl">
          ✅
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
          Appointment Scheduled
        </h1>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        {doctor && (
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
              {doctor.avatarInitials}
            </span>
            <div>
              <p className="font-semibold text-[var(--ink)]">{doctor.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {doctor.specialty} · {doctor.location}
              </p>
            </div>
          </div>
        )}

        <dl className="mt-5 space-y-3 border-t border-[var(--line)] pt-5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Appointment number</dt>
            <dd className="font-medium text-[var(--ink)]">
              #{booking.id.slice(-6).toUpperCase()}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="font-medium text-[var(--success)]">Active</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Date</dt>
            <dd className="font-medium text-[var(--ink)]">{formatLongDate(booking.date)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Time</dt>
            <dd className="font-medium text-[var(--ink)]">{booking.time}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Patient</dt>
            <dd className="font-medium text-[var(--ink)]">{booking.patientName}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/appointments" className="flex-1">
          <Button className="w-full">View my appointments</Button>
        </Link>
        <Link href="/doctors" className="flex-1">
          <Button variant="outline" className="w-full">
            Book another
          </Button>
        </Link>
      </div>
    </div>
  );
}