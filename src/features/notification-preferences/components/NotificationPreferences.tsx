"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import {
  getNotificationPreferences,
  resetNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notification-preferences-store";
import { getSession } from "@/lib/storage";

import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from "@/types/notification-preferences";

const PREFERENCES: Array<{
  key: NotificationPreferenceKey;
  label: string;
  description: string;
}> = [
  {
    key: "appointment",
    label: "Appointment updates",
    description:
      "Reminders and general updates about your appointments.",
  },
  {
    key: "confirmation",
    label: "Appointment confirmations",
    description:
      "Get notified when an appointment is confirmed.",
  },
  {
    key: "cancellation",
    label: "Cancellations",
    description:
      "Get notified when an appointment is cancelled.",
  },
  {
    key: "reschedule",
    label: "Rescheduling",
    description:
      "Get notified when an appointment is moved to another slot.",
  },
  {
    key: "declined",
    label: "Declined appointments",
    description:
      "Get notified when an appointment request is declined.",
  },
  {
    key: "missed",
    label: "Missed appointments",
    description:
      "Get notified when an appointment is marked as missed.",
  },
  {
    key: "prescription",
    label: "Prescriptions",
    description:
      "Get notified when a prescription is added or updated.",
  },
  {
    key: "system",
    label: "System notifications",
    description:
      "Important account and Schedula system updates.",
  },
];

function getInitialPreferences(): NotificationPreferences | null {
  const session = getSession();

  if (!session) {
    return null;
  }

  return getNotificationPreferences(session.id);
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={
        checked
          ? "Disable notification"
          : "Enable notification"
      }
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "border-[var(--brand)] bg-[var(--brand)]"
          : "border-[var(--line)] bg-[var(--line)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked
            ? "translate-x-5"
            : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(
      getInitialPreferences,
    );

  const [sessionId, setSessionId] =
    useState<string | null>(
      () => getSession()?.id ?? null,
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [isResetting, setIsResetting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadPreferences = useCallback(() => {
    try {
      const session = getSession();

      setSessionId(session?.id ?? null);

      setPreferences(
        session
          ? getNotificationPreferences(session.id)
          : null,
      );

      setError(null);
    } catch {
      setError(
        "Notification preferences could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      loadPreferences();
    };

    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (
        !event.key ||
        event.key ===
          "schedula:notification-preferences" ||
        event.key === "schedula:session"
      ) {
        loadPreferences();
      }
    };

    window.addEventListener(
      "schedula:notification-preferences-updated",
      handleUpdate,
    );

    window.addEventListener(
      "schedula:session-updated",
      handleUpdate,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "schedula:notification-preferences-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "schedula:session-updated",
        handleUpdate,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, [loadPreferences]);

  const updatePreference = (
    key: NotificationPreferenceKey,
  ) => {
    setMessage(null);
    setError(null);

    setPreferences((current) =>
      current
        ? {
            ...current,
            [key]: !current[key],
          }
        : current,
    );
  };

  const handleSave = () => {
    if (!preferences || !sessionId) {
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const saved =
        saveNotificationPreferences(
          preferences,
        );

      setPreferences(saved);
      setMessage(
        "Notification preferences saved.",
      );
    } catch {
      setError(
        "Preferences could not be saved. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!sessionId) {
      return;
    }

    setIsResetting(true);
    setMessage(null);
    setError(null);

    try {
      const reset =
        resetNotificationPreferences(
          sessionId,
        );

      setPreferences(reset);
      setMessage(
        "Notification preferences reset to default.",
      );
    } catch {
      setError(
        "Preferences could not be reset. Please try again.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (!sessionId) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Notification preferences
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Please sign in to manage your notification
          preferences.
        </p>
      </section>
    );
  }

  if (!preferences) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm text-[var(--muted)]">
          Loading notification preferences…
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Notification preferences
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Choose which Schedula updates you want to
          receive.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <div className="divide-y divide-[var(--line)]">
          {PREFERENCES.map((preference) => (
            <div
              key={preference.key}
              className="flex items-center justify-between gap-5 px-5 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-[var(--ink)]">
                  {preference.label}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--muted)]">
                  {preference.description}
                </p>
              </div>

              <Toggle
                checked={
                  preferences[
                    preference.key
                  ]
                }
                disabled={
                  isSaving || isResetting
                }
                onChange={() =>
                  updatePreference(
                    preference.key,
                  )
                }
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--canvas)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div
            className="min-h-5 text-sm"
            aria-live="polite"
          >
            {error ? (
              <span className="text-[var(--urgent)]">
                {error}
              </span>
            ) : null}

            {!error && message ? (
              <span className="text-[var(--success)]">
                {message}
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                isSaving || isResetting
              }
              onClick={handleReset}
            >
              {isResetting
                ? "Resetting…"
                : "Reset"}
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={
                isSaving || isResetting
              }
              onClick={handleSave}
            >
              {isSaving
                ? "Saving…"
                : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}