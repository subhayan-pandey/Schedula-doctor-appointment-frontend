"use client";

import { useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import { formatTime12h } from "@/lib/utils/date";
import type { Slot } from "@/types/slot";

export default function AddSlotForm({
  onAdd,
}: {
  onAdd: (slot: { time: string; period: Slot["period"] }) => void;
}) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:15");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    const startHour = Number(startTime.split(":")[0]);
    const period: Slot["period"] =
      startHour < 14 ? "Morning" : "Evening";

    const time = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;

    onAdd({
      time,
      period,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--ink)]">
          Add availability
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          Create a new appointment slot for the selected date.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="slot-start"
            className="text-xs font-semibold text-[var(--muted)]"
          >
            Start time
          </label>

          <input
            id="slot-start"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="slot-end"
            className="text-xs font-semibold text-[var(--muted)]"
          >
            End time
          </label>

          <input
            id="slot-end"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          />
        </div>

        <Button type="submit" size="md" className="h-11">
          Add slot
        </Button>
      </div>

      {error && (
        <p
          className="mt-3 rounded-xl bg-[var(--urgent-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--urgent-deep)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}