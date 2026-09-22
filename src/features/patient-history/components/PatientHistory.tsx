"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getBookingsByPatientId,
} from "@/lib/bookings-store";

import {
  getAllPrescriptions,
} from "@/lib/prescriptions-store";

import {
  getDoctorById,
} from "@/lib/doctors-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  Booking,
} from "@/types/booking";

import type {
  Prescription,
} from "@/types/prescription";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

type HistoryFilter =
  | "all"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "missed"
  | "declined";

type PatientHistoryProps = {
  patientId: string;
};

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function getStatusLabel(
  status: Booking["status"],
): string {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "upcoming":
      return "Upcoming";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "declined":
      return "Declined";

    case "missed":
      return "Missed";

    default:
      return status;
  }
}

function getStatusClass(
  status: Booking["status"],
): string {
  switch (status) {
    case "pending":
      return "bg-[var(--warning-soft)] text-[var(--warning)]";

    case "confirmed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "upcoming":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    case "completed":
      return "bg-[var(--brand-soft)] text-[var(--brand-deep)]";

    case "cancelled":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "declined":
      return "bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";

    case "missed":
      return "bg-[var(--canvas)] text-[var(--muted)]";

    default:
      return "bg-[var(--canvas)] text-[var(--muted)]";
  }
}

function getInitials(
  name: string,
): string {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join("");

  return initials || "PT";
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3v3m10-3v3M4.5 9.5h15M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5V8a2.5 2.5 0 0 1 2.5-2.5Z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5v5l3.25 1.75"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h6.25L18 8.5v11.75H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 3.75V9h5"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 13h6.5M8.5 16h5"
      />
    </svg>
  );
}

function getPrescriptionForBooking(
  prescriptions: Prescription[],
  bookingId: string,
): Prescription | undefined {
  return prescriptions.find(
    (prescription) =>
      prescription.appointmentId ===
      bookingId,
  );
}

export default function PatientHistory({
  patientId,
}: PatientHistoryProps) {
  const [
    pageStatus,
    setPageStatus,
  ] = useState<PageStatus>(
    "loading",
  );

  const [
    doctorId,
    setDoctorId,
  ] = useState<
    string | null
  >(null);

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>(
    [],
  );

  const [
    prescriptions,
    setPrescriptions,
  ] = useState<Prescription[]>(
    [],
  );

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<HistoryFilter>(
    "all",
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    expandedPrescriptionId,
    setExpandedPrescriptionId,
  ] = useState<
    string | null
  >(null);

  const loadHistory =
    useCallback(
      (
        currentDoctorId: string,
      ) => {
        const patientBookings =
          getBookingsByPatientId(
            patientId,
          ).filter(
            (booking) =>
              booking.doctorId ===
              currentDoctorId,
          );

        const patientPrescriptions =
          getAllPrescriptions().filter(
            (prescription) =>
              prescription.patientId ===
                patientId &&
              prescription.doctorId ===
                currentDoctorId,
          );

        setBookings(
          patientBookings,
        );

        setPrescriptions(
          patientPrescriptions,
        );
      },
      [patientId],
    );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        const session =
          getSession();

        if (
          !session ||
          session.role !==
            "doctor"
        ) {
          setPageStatus(
            "unauthorized",
          );

          return;
        }

        setDoctorId(
          session.id,
        );

        loadHistory(
          session.id,
        );

        setPageStatus(
          "ready",
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    loadHistory,
  ]);

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    const currentDoctorId =
      doctorId;

    function refresh() {
      loadHistory(
        currentDoctorId,
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      refresh,
    );

    window.addEventListener(
      "schedula:prescriptions-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        refresh,
      );

      window.removeEventListener(
        "schedula:prescriptions-updated",
        refresh,
      );
    };
  }, [
    doctorId,
    loadHistory,
  ]);

  const patientName =
    useMemo(() => {
      return (
        bookings.find(
          (booking) =>
            booking.patientName
              .trim()
              .length > 0,
        )?.patientName ??
        "Patient"
      );
    }, [bookings]);

  const visibleBookings =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return bookings
        .filter(
          (booking) => {
            if (
              activeFilter !==
                "all" &&
              booking.status !==
                activeFilter
            ) {
              return false;
            }

            if (
              normalizedSearch
            ) {
              const searchable =
                [
                  booking.date,
                  booking.time,
                  booking.status,
                  booking.id,
                ]
                  .join(" ")
                  .toLowerCase();

              if (
                !searchable.includes(
                  normalizedSearch,
                )
              ) {
                return false;
              }
            }

            return true;
          },
        )
        .sort(
          (a, b) => {
            const first =
              `${a.date} ${a.time}`;

            const second =
              `${b.date} ${b.time}`;

            return second.localeCompare(
              first,
            );
          },
        );
    }, [
      bookings,
      activeFilter,
      search,
    ]);

  const counts =
    useMemo(() => {
      return {
        all:
          bookings.length,

        upcoming:
          bookings.filter(
            (booking) =>
              booking.status ===
              "upcoming",
          ).length,

        completed:
          bookings.filter(
            (booking) =>
              booking.status ===
              "completed",
          ).length,

        cancelled:
          bookings.filter(
            (booking) =>
              booking.status ===
              "cancelled",
          ).length,

        missed:
          bookings.filter(
            (booking) =>
              booking.status ===
              "missed",
          ).length,

        declined:
          bookings.filter(
            (booking) =>
              booking.status ===
              "declined",
          ).length,
      };
    }, [bookings]);

  const doctor =
    doctorId
      ? getDoctorById(
          doctorId,
        )
      : undefined;

  if (
    pageStatus ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading patient history...
          </p>
        </div>
      </div>
    );
  }

  if (
    pageStatus ===
    "unauthorized"
  ) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Doctor access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Log in with your doctor account to view patient history.
          </p>

          <Link
            href="/doctor/login"
            className="mt-6 inline-block"
          >
            <Button>
              Doctor login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Patient history
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                {getInitials(
                  patientName,
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                  {patientName}
                </h1>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Appointment and prescription history
                </p>
              </div>
            </div>
          </div>

          <Link href="/doctor/appointments">
            <Button
              size="sm"
              variant="outline"
            >
              Back to appointments
            </Button>
          </Link>
        </div>
      </header>

      {doctor && (
        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                Treating doctor
              </p>

              <p className="mt-1 text-base font-semibold text-[var(--ink)]">
                {doctor.name}
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {doctor.specialty}
                {" • "}
                {doctor.qualification}
              </p>
            </div>

            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-deep)]">
              {bookings.length}{" "}
              appointment
              {bookings.length ===
              1
                ? ""
                : "s"}
            </span>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <HistoryStat
          label="Total visits"
          value={
            counts.all
          }
        />

        <HistoryStat
          label="Completed"
          value={
            counts.completed
          }
        />

        <HistoryStat
          label="Prescriptions"
          value={
            prescriptions.length
          }
        />
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="border-b border-[var(--line)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--ink)]">
                Appointment history
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Review previous visits, appointment status and prescriptions.
              </p>
            </div>

            <label className="block w-full lg:max-w-xs">
              <span className="sr-only">
                Search patient history
              </span>

              <input
                type="search"
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search date, time or appointment ID"
                className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-1 overflow-x-auto rounded-lg bg-[var(--canvas)] p-1">
            {(
              [
                [
                  "all",
                  "All",
                  counts.all,
                ],
                [
                  "upcoming",
                  "Upcoming",
                  counts.upcoming,
                ],
                [
                  "completed",
                  "Completed",
                  counts.completed,
                ],
                [
                  "cancelled",
                  "Cancelled",
                  counts.cancelled,
                ],
                [
                  "missed",
                  "Missed",
                  counts.missed,
                ],
                [
                  "declined",
                  "Declined",
                  counts.declined,
                ],
              ] as [
                HistoryFilter,
                string,
                number,
              ][]
            ).map(
              ([
                value,
                label,
                count,
              ]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      value,
                    )
                  }
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    activeFilter ===
                    value
                      ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}

                  <span className="rounded-full bg-[var(--canvas)] px-1.5 py-0.5 text-[10px]">
                    {count}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {visibleBookings.length ===
        0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title={
                bookings.length ===
                0
                  ? "No patient history"
                  : "No matching appointments"
              }
              description={
                bookings.length ===
                0
                  ? "Appointments for this patient will appear here after they are booked."
                  : "Try changing the search or status filter."
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {visibleBookings.map(
              (booking) => {
                const prescription =
                  getPrescriptionForBooking(
                    prescriptions,
                    booking.id,
                  );

                const isPrescriptionExpanded =
                  prescription?.id ===
                  expandedPrescriptionId;

                return (
                  <article
                    key={
                      booking.id
                    }
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              booking.status,
                            )}`}
                          >
                            {getStatusLabel(
                              booking.status,
                            )}
                          </span>

                          {prescription && (
                            <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                              Prescription available
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:gap-x-5">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon />

                            {formatDate(
                              booking.date,
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon />

                            {
                              booking.time
                            }
                          </span>
                        </div>

                        <p className="mt-3 break-all text-xs text-[var(--muted)]">
                          Appointment ID:{" "}
                          <span className="font-medium text-[var(--ink)]">
                            {
                              booking.id
                            }
                          </span>
                        </p>

                        {booking.actionReason && (
                          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                            Latest action:{" "}
                            {
                              booking.actionReason
                            }
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/appointments/${booking.id}`}
                        className="shrink-0"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          View appointment
                        </Button>
                      </Link>
                    </div>

                    {booking.status ===
                      "completed" && (
                      <div className="mt-5 rounded-xl bg-[var(--canvas)] p-4">
                        {prescription ? (
                          <>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 gap-3">
                                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--brand-deep)]">
                                  <FileIcon />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-[var(--ink)]">
                                    Prescription
                                  </p>

                                  <p className="mt-1 text-xs text-[var(--muted)]">
                                    {
                                      prescription.medicines.length
                                    }{" "}
                                    medicine
                                    {prescription
                                      .medicines
                                      .length !==
                                    1
                                      ? "s"
                                      : ""}{" "}
                                    •{" "}
                                    {
                                      prescription.diagnosis
                                    }
                                  </p>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setExpandedPrescriptionId(
                                    isPrescriptionExpanded
                                      ? null
                                      : prescription.id,
                                  )
                                }
                              >
                                {isPrescriptionExpanded
                                  ? "Hide prescription"
                                  : "View prescription"}
                              </Button>
                            </div>

                            {isPrescriptionExpanded && (
                              <PrescriptionDetails
                                prescription={
                                  prescription
                                }
                              />
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                No prescription recorded
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                A prescription can be added from the doctor prescription portal.
                              </p>
                            </div>

                            <Link
                              href={`/doctor/prescriptions?appointmentId=${encodeURIComponent(
                                booking.id,
                              )}`}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                Add prescription
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-xs font-medium text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}

function PrescriptionDetails({
  prescription,
}: {
  prescription: Prescription;
}) {
  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          Diagnosis
        </p>

        <p className="mt-1 text-sm font-medium text-[var(--ink)]">
          {prescription.diagnosis}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          Medicines
        </p>

        <div className="mt-2 space-y-2">
          {prescription.medicines.map(
            (
              medicine,
            ) => (
              <div
                key={
                  medicine.id
                }
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"
              >
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {
                    medicine.name
                  }
                </p>

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <PrescriptionDetail
                    label="Dosage"
                    value={
                      medicine.dosage
                    }
                  />

                  <PrescriptionDetail
                    label="Duration"
                    value={
                      medicine.duration
                    }
                  />

                  <PrescriptionDetail
                    label="Instructions"
                    value={
                      medicine.instructions ||
                      "No specific instructions"
                    }
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          Additional instructions
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">
          {prescription.instructions ||
            "No additional instructions."}
        </p>
      </div>
    </div>
  );
}

function PrescriptionDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}