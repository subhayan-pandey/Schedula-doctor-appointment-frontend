"use client";

import { useEffect, useMemo, useState } from "react";

import type { Doctor } from "@/types/doctor";
import type { Slot } from "@/types/slot";

import {
  getDoctorAvailabilityIntelligence,
  type DoctorAvailabilityIntelligence,
} from "@/lib/doctor-availability-intelligence";
import { getDoctorById } from "@/lib/doctors-store";
import { getSlotsForDoctor } from "@/lib/slots-store";

type DoctorAvailabilityIntelligenceProps = {
  doctorId: string;
};

function formatDate(date?: string): string {
  if (!date) {
    return "No upcoming availability";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(
  status: DoctorAvailabilityIntelligence["status"],
): string {
  switch (status) {
    case "available":
      return "Good availability";
    case "limited":
      return "Limited availability";
    default:
      return "No availability";
  }
}

function getStatusClass(
  status: DoctorAvailabilityIntelligence["status"],
): string {
  switch (status) {
    case "available":
      return "bg-[var(--success-soft)] text-[var(--success)]";
    case "limited":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";
    default:
      return "bg-[var(--urgent-soft)] text-[var(--urgent)]";
  }
}

export default function DoctorAvailabilityIntelligence({
  doctorId,
}: DoctorAvailabilityIntelligenceProps) {
  const [doctor, setDoctor] = useState<Doctor | undefined>(() =>
    getDoctorById(doctorId),
  );
  const [slots, setSlots] = useState<Slot[]>(() =>
    getSlotsForDoctor(doctorId),
  );

  useEffect(() => {
    const refresh = () => {
      setDoctor(getDoctorById(doctorId));
      setSlots(getSlotsForDoctor(doctorId));
    };

    refresh();

    window.addEventListener(
      "schedula:slots-updated",
      refresh,
    );
    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "schedula:slots-updated",
        refresh,
      );
      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [doctorId]);

  const intelligence = useMemo(() => {
    if (!doctor) {
      return undefined;
    }

    return getDoctorAvailabilityIntelligence(doctor);
  }, [doctor, slots]);

  if (!doctor || !intelligence) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">
            Availability intelligence
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--ink)]">
            {doctor.name}
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {doctor.specialty}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
            intelligence.status,
          )}`}
        >
          {getStatusLabel(intelligence.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Available
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {intelligence.totalAvailableSlots}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            open slots
          </p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Morning
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {intelligence.morningAvailableSlots}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            open slots
          </p>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Evening
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {intelligence.eveningAvailableSlots}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            open slots
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--line)] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              Next available appointment
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {intelligence.nextAvailableSlot
                ? `${formatDate(
                    intelligence.nextAvailableSlot.date,
                  )} · ${
                    intelligence.nextAvailableSlot.time
                  }`
                : "No upcoming slots are currently available."}
            </p>
          </div>

          {intelligence.availableToday && (
            <span className="text-xs font-medium text-[var(--success)]">
              Available today
            </span>
          )}
        </div>
      </div>
    </section>
  );
}