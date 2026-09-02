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
      setError("End time must be after start time");
      return;
    }

    const startHour = Number(startTime.split(":")[0]);
    const period: Slot["period"] = startHour < 14 ? "Morning" : "Evening";
    const time = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;

    onAdd({ time, period });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="slot-start" className="text-xs font-medium text-[var(--muted)]">
          Start time
        </label>
        <input
          id="slot-start"
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="slot-end" className="text-xs font-medium text-[var(--muted)]">
          End time
        </label>
        <input
          id="slot-end"
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>
      <Button type="submit" size="md">
        + Add slot
      </Button>
      {error && (
        <p className="text-xs font-medium text-[var(--urgent-deep)] sm:basis-full">{error}</p>
      )}
    </form>
  );
}