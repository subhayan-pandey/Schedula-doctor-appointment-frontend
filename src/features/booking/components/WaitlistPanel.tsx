"use client";

import {
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  addWaitlistEntry,
  getWaitlistEntriesForDoctorDate,
} from "@/lib/waitlist-store";

import {
  getSession,
} from "@/lib/storage";

import type { Slot } from "@/types/slot";

export default function WaitlistPanel({
  doctorId,
  selectedDate,
  slots,
}: {
  doctorId: string;
  selectedDate: string;
  slots: Slot[];
}) {
  const [
    preferredTime,
    setPreferredTime,
  ] = useState("");

  const [
    position,
    setPosition,
  ] = useState<number | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    isJoining,
    setIsJoining,
  ] = useState(false);

  const timeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          slots
            .map(
              (slot) =>
                slot.time,
            )
            .filter(Boolean),
        ),
      ),
    [slots],
  );

  function handleJoinWaitlist() {
    const session =
      getSession();

    setError(null);
    setSuccess(null);

    if (!session) {
      setError(
        "Please log in before joining the waitlist.",
      );

      return;
    }

    if (
      session.role !==
      "patient"
    ) {
      setError(
        "Please use a patient account to join the waitlist.",
      );

      return;
    }

    setIsJoining(true);

    const entry =
      addWaitlistEntry({
        patientId:
          session.id,

        doctorId,

        preferredDate:
          selectedDate,

        preferredTime:
          preferredTime ||
          undefined,
      });

    if (!entry) {
      setError(
        "Unable to join the waitlist. Please try again.",
      );

      setIsJoining(false);

      return;
    }

    getWaitlistEntriesForDoctorDate(
      doctorId,
      selectedDate,
    );

    setPosition(
      entry.position,
    );

    setSuccess(
      `You're on the waitlist at position ${entry.position}.`,
    );

    setIsJoining(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div>
        <p className="font-semibold text-[var(--ink)]">
          Join waitlist
        </p>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          No bookable slots are available for this date.
          Join the waitlist and we&apos;ll notify you when
          a matching slot becomes available.
        </p>
      </div>

      {timeOptions.length > 0 && (
        <div className="mt-5">
          <label
            htmlFor="waitlist-preferred-time"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Preferred time
          </label>

          <select
            id="waitlist-preferred-time"
            value={
              preferredTime
            }
            onChange={(event) =>
              setPreferredTime(
                event.target.value,
              )
            }
            className="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none transition-all duration-200 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
          >
            <option value="">
              Any available time
            </option>

            {timeOptions.map(
              (time) => (
                <option
                  key={time}
                  value={time}
                >
                  {time}
                </option>
              ),
            )}
          </select>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-[var(--urgent-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--urgent-deep)]">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 rounded-lg bg-[var(--success-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--success)]">
          {success}
        </p>
      )}

      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={
          isJoining ||
          position !== null
        }
        onClick={
          handleJoinWaitlist
        }
      >
        {isJoining
          ? "Joining..."
          : position !== null
            ? "Joined waitlist"
            : "Join waitlist"}
      </Button>
    </div>
  );
}