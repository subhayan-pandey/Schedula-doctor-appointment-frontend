"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import DateStrip from "@/components/ui/DateStrip";
import EmptyState from "@/components/ui/EmptyState";
import AddSlotForm from "@/features/doctor-slot/components/AddSlotForm";
import SlotManagerGrid from "@/features/doctor-slot/components/SlotManagerGrid";
import { getSession } from "@/lib/storage";
import {
  getSlotsForDoctor,
  createSlot,
  removeSlot,
  toggleSlotAvailability,
} from "@/lib/slots-store";
import { getNextDays, toISODate } from "@/lib/utils/date";
import type { Slot } from "@/types/slot";

type Status = "loading" | "unauthorized" | "ready";

const MANAGE_DAYS_AHEAD = 14;

export default function SlotManager() {
  const [status, setStatus] = useState<Status>("loading");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const days = useMemo(() => getNextDays(MANAGE_DAYS_AHEAD), []);
  const [selectedDate, setSelectedDate] = useState(() => toISODate(days[0]));

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();
      if (!session || session.role !== "doctor") {
        setStatus("unauthorized");
        return;
      }
      setDoctorId(session.id);
      setSlots(getSlotsForDoctor(session.id));
      setStatus("ready");
    });
  }, []);

  const slotsForDate = slots.filter((slot) => slot.date === selectedDate);
  const morningSlots = slotsForDate
    .filter((slot) => slot.period === "Morning")
    .sort((a, b) => (a.time > b.time ? 1 : -1));
  const eveningSlots = slotsForDate
    .filter((slot) => slot.period === "Evening")
    .sort((a, b) => (a.time > b.time ? 1 : -1));

  function handleAdd(newSlot: { time: string; period: Slot["period"] }) {
    if (!doctorId) return;
    setSlots(createSlot(doctorId, { date: selectedDate, ...newSlot }));
  }

  function handleToggle(slotId: string) {
    if (!doctorId) return;
    setSlots(toggleSlotAvailability(doctorId, slotId));
  }

  function handleRemove(slotId: string) {
    if (!doctorId) return;
    setSlots(removeSlot(doctorId, slotId));
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading availability…
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
          Log in to manage your appointment slots.
        </p>
        <Link href="/doctor/login" className="mt-6 inline-block">
          <Button>Doctor login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Manage Availability
      </h1>
      <p className="mt-1 text-[var(--muted)]">
        Add new slots, or mark existing ones unavailable. Booked slots can&apos;t
        be edited or removed here.
      </p>

      <div className="mt-6">
        <DateStrip days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div className="mt-5">
        <AddSlotForm onAdd={handleAdd} />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {slotsForDate.length === 0 ? (
          <EmptyState
            title="No slots for this date"
            description="Add your first slot for this day using the form above."
          />
        ) : (
          <>
            <SlotManagerGrid
              title="Morning"
              slots={morningSlots}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
            <SlotManagerGrid
              title="Evening"
              slots={eveningSlots}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          </>
        )}
      </div>
    </div>
  );
}