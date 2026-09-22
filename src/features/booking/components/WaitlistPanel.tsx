"use client";

import {
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  addWaitlistEntry,
  cancelWaitlistEntry,
  getWaitlistEntriesByPatient,
} from "@/lib/waitlist-store";

import {
  getSession,
} from "@/lib/storage";

import type { Slot } from "@/types/slot";
import type { WaitlistEntry } from "@/types/waitlist";

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
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const [
    isJoining,
    setIsJoining,
  ] = useState(false);

  const [
    isCancelling,
    setIsCancelling,
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

  const existingEntry =
    useMemo<WaitlistEntry | null>(() => {
      void refreshKey;

      const session =
        getSession();

      if (
        !session ||
        session.role !==
          "patient"
      ) {
        return null;
      }

      return (
        getWaitlistEntriesByPatient(
          session.id,
        ).find(
          (entry) =>
            entry.doctorId ===
              doctorId &&
            entry.preferredDate ===
              selectedDate &&
            (entry.status ===
              "waiting" ||
              entry.status ===
                "notified"),
        ) ?? null
      );
    }, [
      doctorId,
      selectedDate,
      refreshKey,
    ]);

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

    if (existingEntry) {
      setError(
        "You are already on the waitlist for this date.",
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

    setRefreshKey(
      (value) =>
        value + 1,
    );

    setSuccess(
      `You're on the waitlist at position ${entry.position}.`,
    );

    setIsJoining(false);
  }

  function handleCancelWaitlist() {
    if (!existingEntry) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsCancelling(true);

    const cancelled =
      cancelWaitlistEntry(
        existingEntry.id,
      );

    if (!cancelled) {
      setError(
        "Unable to leave the waitlist. Please try again.",
      );

      setIsCancelling(false);

      return;
    }

    setRefreshKey(
      (value) =>
        value + 1,
    );

    setPreferredTime("");

    setSuccess(
      "You have left the waitlist for this date.",
    );

    setIsCancelling(false);
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

      {existingEntry ? (
        <div className="mt-5 rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {existingEntry.status ===
                "notified"
                  ? "A matching slot is available"
                  : "You are on the waitlist"}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {existingEntry.status ===
                "notified"
                  ? "A matching slot is available. Open the doctor booking page to complete your appointment."
                  : `Current position: ${existingEntry.position}`}
              </p>
            </div>

            <span className="w-fit rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium capitalize text-[var(--brand-deep)]">
              {existingEntry.status}
            </span>
          </div>

          {existingEntry.preferredTime && (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Preferred time:{" "}
              {existingEntry.preferredTime}
            </p>
          )}

          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            disabled={
              isCancelling
            }
            onClick={
              handleCancelWaitlist
            }
          >
            {isCancelling
              ? "Leaving..."
              : "Leave waitlist"}
          </Button>
        </div>
      ) : (
        <>
          {timeOptions.length >
            0 && (
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
                onChange={(
                  event,
                ) =>
                  setPreferredTime(
                    event.target
                      .value,
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

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={
              isJoining
            }
            onClick={
              handleJoinWaitlist
            }
          >
            {isJoining
              ? "Joining..."
              : "Join waitlist"}
          </Button>
        </>
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
    </div>
  );
}