"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  formatConsultationDate,
  getConsultationElapsedTime,
  getConsultationStatus,
  getConsultationStatusClasses,
  getConsultationStatusLabel,
  getConsultationCountdown,
  isConsultationJoinable,
} from "@/lib/consultation";

import type {
  ConsultationStatus,
} from "@/types/consultation";

export type ConsultationRole =
  | "patient"
  | "doctor";

type MockConsultationScreenProps = {
  role: ConsultationRole;
  patientName: string;
  doctorName: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  appointmentId: string;
  initialStatus?: ConsultationStatus;
};

function getInitials(
  name: string,
): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("") || "SC"
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="6"
        width="12"
        height="12"
        rx="2"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 10 5-3v10l-5-3"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="3"
        width="8"
        height="12"
        rx="4"
      />

      <path
        strokeLinecap="round"
        d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.25 4.5 5.5 5.75a2 2 0 0 0-.75 2.25c1.5 5.25 5.5 9.25 10.75 10.75a2 2 0 0 0 2.25-.75l1.25-1.75a1.5 1.5 0 0 0-.35-2.1l-2.75-2a1.5 1.5 0 0 0-1.9.15l-1.15 1.15a12.3 12.3 0 0 1-4.5-4.5l1.15-1.15a1.5 1.5 0 0 0 .15-1.9l-2-2.75a1.5 1.5 0 0 0-2.1-.35Z"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="12"
        rx="2"
      />

      <path
        strokeLinecap="round"
        d="M8 20h8M12 16.5V20"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 19 6v5.5c0 4.2-2.8 7.45-7 9-4.2-1.55-7-4.8-7-9V6l7-2.5Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}

function getStatusDescription(
  status: ConsultationStatus,
  role: ConsultationRole,
): string {
  switch (status) {
    case "scheduled":
      return role === "doctor"
        ? "The consultation room will become available 15 minutes before the appointment."
        : "The consultation room will become available 15 minutes before your appointment.";

    case "starting-soon":
      return role === "doctor"
        ? "The consultation is ready. You can start the mock consultation now."
        : "The consultation is ready. You can join the mock consultation now.";

    case "live":
      return role === "doctor"
        ? "The consultation is currently live."
        : "You are currently in the consultation window.";

    case "ended":
      return "The consultation window has ended.";

    default:
      return "";
  }
}

function ParticipantTile({
  name,
  label,
  muted,
}: {
  name: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-slate-950 p-6 sm:min-h-[320px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(31,182,204,0.12),_transparent_55%)]" />

      <div className="relative z-10 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[var(--brand-soft)] text-2xl font-semibold text-[var(--brand-deep)]">
          {getInitials(name)}
        </div>

        <p className="mt-4 text-sm font-semibold text-white">
          {name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {label}
        </p>
      </div>

      <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
        {muted
          ? "Microphone off"
          : "Microphone on"}
      </div>

      <div className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm">
        <VideoIcon />
      </div>
    </div>
  );
}

export default function MockConsultationScreen({
  role,
  patientName,
  doctorName,
  doctorSpecialty,
  date,
  time,
  appointmentId,
  initialStatus,
}: MockConsultationScreenProps) {
  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    cameraOff,
    setCameraOff,
  ] = useState(false);

  const [
    consultationStarted,
    setConsultationStarted,
  ] = useState(false);

  useEffect(() => {
    const initialTick =
      window.setTimeout(() => {
        setCurrentTime(Date.now());
      }, 0);

    const interval =
      window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

    return () => {
      window.clearTimeout(
        initialTick,
      );

      window.clearInterval(
        interval,
      );
    };
  }, []);

  const calculatedStatus: ConsultationStatus =
    initialStatus ??
    (currentTime > 0
      ? getConsultationStatus(
          date,
          time,
          currentTime,
        )
      : "scheduled");

  const liveStatus =
    initialStatus ??
    calculatedStatus;

  const canEnterRoom =
    isConsultationJoinable(
      liveStatus,
    );

  const countdown =
    getConsultationCountdown(
      date,
      time,
      currentTime,
    );

  const elapsedTime =
    getConsultationElapsedTime(
      date,
      time,
      currentTime,
    );

  const roomActive =
    consultationStarted &&
    canEnterRoom;

  const displayStatus: ConsultationStatus =
    roomActive
      ? "live"
      : liveStatus;

  const displayCountdown =
    roomActive
      ? elapsedTime
      : countdown;

  function handlePrimaryAction() {
    if (!canEnterRoom) {
      return;
    }

    setConsultationStarted(
      true,
    );
  }

  function handleLeaveRoom() {
    setConsultationStarted(
      false,
    );
  }

  const otherParticipant =
    role === "doctor"
      ? patientName
      : doctorName;

  const otherParticipantLabel =
    role === "doctor"
      ? "Patient"
      : doctorSpecialty
        ? `Doctor · ${doctorSpecialty}`
        : "Doctor";

  const currentUserName =
    role === "doctor"
      ? doctorName
      : patientName;

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Schedula
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Online Consultation
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Mock consultation room
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getConsultationStatusClasses(
                displayStatus,
              )}`}
            >
              {getConsultationStatusLabel(
                displayStatus,
              )}
            </span>

            {displayCountdown && (
              <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--ink)]">
                {displayCountdown}
              </span>
            )}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <main className="min-w-0">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              {!roomActive ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ParticipantTile
                    name={currentUserName}
                    label={
                      role === "doctor"
                        ? "You · Doctor"
                        : "You · Patient"
                    }
                    muted={muted}
                  />

                  <ParticipantTile
                    name={
                      otherParticipant
                    }
                    label={
                      otherParticipantLabel
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                  <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(31,182,204,0.14),_transparent_55%)]" />

                    <div className="relative z-10 text-center">
                      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[var(--brand-soft)] text-3xl font-semibold text-[var(--brand-deep)]">
                        {getInitials(
                          otherParticipant,
                        )}
                      </div>

                      <p className="mt-4 text-sm font-semibold text-white">
                        {otherParticipant}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {otherParticipantLabel}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--success)]/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                        <span className="size-2 rounded-full bg-[var(--success)]" />
                        Consultation live
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-sm">
                      {otherParticipant}
                    </div>
                  </div>

                  <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
                    {cameraOff ? (
                      <div className="text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-full bg-slate-800 text-lg font-semibold text-slate-300">
                          {getInitials(
                            currentUserName,
                          )}
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Your camera is off
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand-deep)]">
                          {getInitials(
                            currentUserName,
                          )}
                        </div>

                        <p className="mt-3 text-xs text-slate-300">
                          You
                        </p>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                      {muted
                        ? "Muted"
                        : "Unmuted"}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--line)] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setMuted(
                      (value) =>
                        !value,
                    )
                  }
                  className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors ${
                    muted
                      ? "border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent-deep)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                  aria-label={
                    muted
                      ? "Unmute microphone"
                      : "Mute microphone"
                  }
                >
                  <MicIcon />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCameraOff(
                      (value) =>
                        !value,
                    )
                  }
                  className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors ${
                    cameraOff
                      ? "border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent-deep)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                  aria-label={
                    cameraOff
                      ? "Turn camera on"
                      : "Turn camera off"
                  }
                >
                  <VideoIcon />
                </button>

                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  aria-label="Share screen"
                >
                  <MonitorIcon />
                </button>

                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  aria-label="Open messages"
                >
                  <MessageIcon />
                </button>

                {roomActive && (
                  <button
                    type="button"
                    onClick={
                      handleLeaveRoom
                    }
                    className="ml-1 inline-flex size-11 items-center justify-center rounded-full bg-[var(--urgent)] text-white transition-colors hover:bg-[var(--urgent-deep)]"
                    aria-label="Leave consultation"
                  >
                    <PhoneIcon />
                  </button>
                )}
              </div>
            </div>

            {!roomActive && (
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {getStatusDescription(
                        displayStatus,
                        role,
                      )}
                    </p>

                    {displayStatus ===
                      "scheduled" &&
                      countdown && (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Starts in{" "}
                          <span className="font-mono font-semibold text-[var(--ink)]">
                            {countdown}
                          </span>
                        </p>
                      )}
                  </div>

                  <Button
                    size="sm"
                    disabled={
                      !canEnterRoom
                    }
                    onClick={
                      handlePrimaryAction
                    }
                  >
                    {role === "doctor"
                      ? "Start Consultation"
                      : "Join Consultation"}
                  </Button>
                </div>
              </div>
            )}

            {roomActive && (
              <div className="mt-4 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-soft)] p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--success)]">
                    <ShieldIcon />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      Mock consultation is active
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      This screen simulates the
                      online consultation experience.
                      No real video, audio, or
                      WebSocket connection is being
                      established.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
                Appointment
              </p>

              <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                Consultation details
              </h2>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    Patient
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {patientName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    Doctor
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {doctorName}
                  </dd>

                  {doctorSpecialty && (
                    <dd className="mt-0.5 text-xs text-[var(--muted)]">
                      {doctorSpecialty}
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    Date
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {formatConsultationDate(
                      date,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    Time
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                    {time}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    Appointment ID
                  </dt>

                  <dd className="mt-1 break-all text-xs font-medium text-[var(--ink)]">
                    {appointmentId}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                  <ShieldIcon />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Consultation safety
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    This is a mock consultation room
                    for the Schedula prototype. No
                    real audio or video connection is
                    used.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}