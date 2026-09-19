"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getAllBookings,
  updateBooking,
} from "@/lib/bookings-store";

import {
  bookSlot,
  getSlotsForDoctor,
  releaseSlot,
} from "@/lib/slots-store";

import { getSession } from "@/lib/storage";

import type { Booking } from "@/types/booking";
import type { Slot } from "@/types/slot";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

type CalendarView =
  | "day"
  | "week"
  | "month";

function toISODate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date {
  return new Date(
    `${value}T00:00:00`,
  );
}

function addDays(
  date: Date,
  days: number,
): Date {
  const next = new Date(date);

  next.setDate(
    next.getDate() + days,
  );

  return next;
}

function getWeekStart(
  date: Date,
): Date {
  const next = new Date(date);

  const day = next.getDay();

  const offset =
    day === 0 ? -6 : 1 - day;

  next.setDate(
    next.getDate() + offset,
  );

  next.setHours(
    0,
    0,
    0,
    0,
  );

  return next;
}

function formatDate(
  date: string,
): string {
  return parseDate(
    date,
  ).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  );
}

function formatFullDate(
  date: string,
): string {
  return parseDate(
    date,
  ).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function getMonthDays(
  anchor: Date,
): Date[] {
  const firstDay = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    1,
  );

  const weekday =
    firstDay.getDay();

  const mondayOffset =
    weekday === 0
      ? 6
      : weekday - 1;

  const start = addDays(
    firstDay,
    -mondayOffset,
  );

  return Array.from(
    {
      length: 42,
    },
    (_, index) =>
      addDays(start, index),
  );
}

function getBookingStyle(
  status: Booking["status"],
): string {
  if (status === "completed") {
    return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }

  if (status === "cancelled") {
    return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";
  }

  if (status === "missed") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (status === "pending") {
    return "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]";
  }

  if (status === "confirmed") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "PT";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

export default function DoctorCalendar() {
  const [pageStatus, setPageStatus] =
    useState<PageStatus>("loading");

  const [doctorId, setDoctorId] =
    useState<string | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [calendarView, setCalendarView] =
    useState<CalendarView>("week");

  const [selectedDate, setSelectedDate] =
    useState(
      toISODate(new Date()),
    );

  const [monthAnchor, setMonthAnchor] =
    useState(new Date());

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [isRescheduling, setIsRescheduling] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  function refreshData(id: string) {
    const doctorBookings =
      getAllBookings().filter(
        (booking) =>
          booking.doctorId === id,
      );

    setBookings(doctorBookings);

    setSlots(
      getSlotsForDoctor(id),
    );
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (
        !session ||
        session.role !== "doctor"
      ) {
        setPageStatus("unauthorized");
        return;
      }

      setDoctorId(session.id);

      refreshData(session.id);

      setPageStatus("ready");
    });
  }, []);

  const visibleDays = useMemo(() => {
    if (calendarView === "day") {
      return [
        parseDate(selectedDate),
      ];
    }

    if (calendarView === "week") {
      const start =
        getWeekStart(
          parseDate(selectedDate),
        );

      return Array.from(
        {
          length: 7,
        },
        (_, index) =>
          addDays(start, index),
      );
    }

    return getMonthDays(
      monthAnchor,
    );
  }, [
    calendarView,
    selectedDate,
    monthAnchor,
  ]);

  /*
   * Only future slots are shown as rescheduling
   * targets, and the currently booked slot is excluded.
   */
  const availableSlots =
    useMemo(() => {
      if (!selectedBooking) {
        return [];
      }

      const now = new Date();

      return slots
        .filter((slot) => {
          if (
            slot.status !==
            "available"
          ) {
            return false;
          }

          if (
            slot.id ===
            selectedBooking.slotId
          ) {
            return false;
          }

          const slotDateTime =
            new Date(
              `${slot.date}T${slot.time}`,
            );

          return (
            slotDateTime > now
          );
        })
        .sort((a, b) => {
          const first =
            `${a.date}T${a.time}`;

          const second =
            `${b.date}T${b.time}`;

          return first.localeCompare(
            second,
          );
        });
    }, [slots, selectedBooking]);

  function getBookingsForDate(
    date: string,
  ) {
    return bookings.filter(
      (booking) =>
        booking.date === date,
    );
  }

  function moveCalendar(
    direction:
      | "previous"
      | "next",
  ) {
    const amount =
      direction === "next"
        ? 1
        : -1;

    if (
      calendarView ===
      "month"
    ) {
      const next =
        new Date(monthAnchor);

      next.setMonth(
        next.getMonth() +
          amount,
      );

      setMonthAnchor(next);

      return;
    }

    const days =
      calendarView === "week"
        ? amount * 7
        : amount;

    setSelectedDate(
      toISODate(
        addDays(
          parseDate(selectedDate),
          days,
        ),
      ),
    );
  }

  function goToToday() {
    const today =
      new Date();

    setSelectedDate(
      toISODate(today),
    );

    setMonthAnchor(today);
  }

  function selectBooking(
    booking: Booking,
  ) {
    setSelectedBooking(
      booking,
    );

    setIsRescheduling(false);

    setError(null);
    setSuccess(null);
  }

  function closeBooking() {
    setSelectedBooking(null);

    setIsRescheduling(false);

    setError(null);
    setSuccess(null);
  }

  function handleReschedule(
    newSlot: Slot,
  ) {
    if (
      !doctorId ||
      !selectedBooking
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (
      selectedBooking.status !==
      "upcoming"
    ) {
      setError(
        "Only upcoming appointments can be rescheduled.",
      );

      return;
    }

    const slotDateTime =
      new Date(
        `${newSlot.date}T${newSlot.time}`,
      );

    if (
      slotDateTime <=
      new Date()
    ) {
      setError(
        "Appointments cannot be rescheduled to a past date or time.",
      );

      return;
    }

    /*
     * Reserve the new slot first.
     */
    const newSlotResult =
      bookSlot(
        doctorId,
        newSlot.id,
      );

    if (!newSlotResult) {
      setError(
        "This slot is no longer available. Please select another slot.",
      );

      setSlots(
        getSlotsForDoctor(
          doctorId,
        ),
      );

      return;
    }

    /*
     * Release the previous slot.
     */
    releaseSlot(
      doctorId,
      selectedBooking.slotId,
    );

    /*
     * Update the same appointment.
     */
    const updatedBookings =
      updateBooking(
        selectedBooking.id,
        {
          slotId:
            newSlot.id,
          date:
            newSlot.date,
          time:
            newSlot.time,
          status:
            "upcoming",
        },
      );

    const updatedBooking =
      updatedBookings.find(
        (booking) =>
          booking.id ===
          selectedBooking.id,
      ) ?? null;

    setBookings(
      updatedBookings.filter(
        (booking) =>
          booking.doctorId ===
          doctorId,
      ),
    );

    setSlots(
      getSlotsForDoctor(
        doctorId,
      ),
    );

    setSelectedBooking(
      updatedBooking,
    );

    setIsRescheduling(false);

    setSuccess(
      "Appointment successfully rescheduled.",
    );
  }

  if (pageStatus === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <CalendarSkeleton />
      </div>
    );
  }

  if (pageStatus === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <ShieldIcon />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
          Log in with your doctor
          account to access the
          calendar.
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
    );
  }

  const today =
    toISODate(new Date());

  const monthLabel =
    monthAnchor.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      },
    );

  const rangeLabel =
    calendarView ===
    "month"
      ? monthLabel
      : calendarView ===
          "week"
        ? `${formatDate(
            toISODate(
              visibleDays[0],
            ),
          )} – ${formatDate(
            toISODate(
              visibleDays[
                visibleDays.length -
                  1
              ],
            ),
          )}`
        : formatFullDate(
            selectedDate,
          );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
            Doctor portal
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Calendar
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Manage your schedule,
            appointments, and
            availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              moveCalendar(
                "previous",
              )
            }
            aria-label="Previous period"
          >
            ←
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              moveCalendar(
                "next",
              )
            }
            aria-label="Next period"
          >
            →
          </Button>
        </div>
      </header>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <CalendarIcon />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Current view
              </p>

              <p className="mt-1 font-semibold text-[var(--ink)]">
                {rangeLabel}
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-[var(--canvas)] p-1">
            {(
              [
                "day",
                "week",
                "month",
              ] as CalendarView[]
            ).map(
              (view) => {
                const active =
                  calendarView ===
                  view;

                return (
                  <button
                    key={view}
                    type="button"
                    onClick={() =>
                      setCalendarView(
                        view,
                      )
                    }
                    aria-pressed={
                      active
                    }
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 ${
                      active
                        ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {view}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          {calendarView ===
          "month" ? (
            <>
              <div className="grid grid-cols-7 border-b border-[var(--line)]">
                {[
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                ].map(
                  (day) => (
                    <div
                      key={day}
                      className="border-r border-[var(--line)] px-2 py-3 text-center text-xs font-semibold text-[var(--muted)] last:border-r-0"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7">
                {visibleDays.map(
                  (day) => {
                    const date =
                      toISODate(
                        day,
                      );

                    const dayBookings =
                      getBookingsForDate(
                        date,
                      );

                    const currentMonth =
                      day.getMonth() ===
                      monthAnchor.getMonth();

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(
                            date,
                          );
                          setCalendarView(
                            "day",
                          );
                        }}
                        className={`min-h-32 border-b border-r border-[var(--line)] p-2 text-left transition hover:bg-[var(--canvas)] ${
                          !currentMonth
                            ? "bg-slate-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                              date ===
                              today
                                ? "bg-[var(--brand)] text-white"
                                : "text-[var(--ink)]"
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          {dayBookings.length >
                            0 && (
                            <span className="text-[10px] font-semibold text-[var(--muted)]">
                              {
                                dayBookings.length
                              }
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayBookings
                            .slice(
                              0,
                              3,
                            )
                            .map(
                              (
                                booking,
                              ) => (
                                <span
                                  key={
                                    booking.id
                                  }
                                  className={`block truncate rounded-md border px-1.5 py-1 text-[10px] font-medium ${getBookingStyle(
                                    booking.status,
                                  )}`}
                                >
                                  {
                                    booking.time
                                  }
                                </span>
                              ),
                            )}

                          {dayBookings.length >
                            3 && (
                            <span className="text-[10px] font-medium text-[var(--muted)]">
                              +
                              {dayBookings.length -
                                3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {visibleDays.map(
                (day) => {
                  const date =
                    toISODate(
                      day,
                    );

                  const dayBookings =
                    getBookingsForDate(
                      date,
                    );

                  const daySlots =
                    slots.filter(
                      (slot) =>
                        slot.date ===
                        date,
                    );

                  return (
                    <div
                      key={date}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex w-full shrink-0 items-start gap-3 lg:w-40">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--canvas)] text-sm font-semibold text-[var(--ink)]">
                            {day.getDate()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--ink)]">
                              {formatDate(
                                date,
                              )}
                            </p>

                            {date ===
                              today && (
                              <span className="mt-1 inline-flex rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-deep)]">
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          {dayBookings.length ===
                            0 &&
                            daySlots.length ===
                              0 && (
                              <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 py-4 text-sm text-[var(--muted)]">
                                No appointments or
                                availability.
                              </p>
                            )}

                          {dayBookings.length >
                            0 && (
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                  Appointments
                                </p>

                                <span className="text-xs font-medium text-[var(--muted)]">
                                  {
                                    dayBookings.length
                                  }
                                </span>
                              </div>

                              <div className="grid gap-2 md:grid-cols-2">
                                {dayBookings.map(
                                  (
                                    booking,
                                  ) => (
                                    <button
                                      key={
                                        booking.id
                                      }
                                      type="button"
                                      onClick={() =>
                                        selectBooking(
                                          booking,
                                        )
                                      }
                                      className={`rounded-xl border p-3 text-left transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 ${getBookingStyle(
                                        booking.status,
                                      )}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/70 text-[10px] font-semibold">
                                          {getInitials(
                                            booking.patientName,
                                          )}
                                        </span>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold">
                                            {
                                              booking.patientName
                                            }
                                          </p>

                                          <p className="mt-1 text-xs">
                                            {
                                              booking.time
                                            }
                                          </p>

                                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                            {
                                              booking.status
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {daySlots.length >
                            0 && (
                            <div
                              className={
                                dayBookings.length >
                                0
                                  ? "mt-5"
                                  : ""
                              }
                            >
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Availability
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {daySlots.map(
                                  (
                                    slot,
                                  ) => (
                                    <span
                                      key={
                                        slot.id
                                      }
                                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                                        slot.status ===
                                        "available"
                                          ? "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]"
                                          : slot.status ===
                                              "booked"
                                            ? "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                                            : "border-[var(--line)] bg-slate-50 text-[var(--muted)]"
                                      }`}
                                    >
                                      <span
                                        className={`size-1.5 rounded-full ${
                                          slot.status ===
                                          "available"
                                            ? "bg-[var(--success)]"
                                            : slot.status ===
                                                "booked"
                                              ? "bg-[var(--brand)]"
                                              : "bg-[var(--muted)]"
                                        }`}
                                      />

                                      {
                                        slot.time
                                      }
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          {!selectedBooking ? (
            <div className="p-5">
              <EmptyState
                title="Select an appointment"
                description="Click an appointment in the calendar to view details or reschedule it."
              />
            </div>
          ) : (
            <>
              <div className="border-b border-[var(--line)] bg-[var(--canvas)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
                      {getInitials(
                        selectedBooking.patientName,
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        Appointment
                      </p>

                      <h2 className="mt-1 truncate text-lg font-semibold text-[var(--ink)]">
                        {
                          selectedBooking.patientName
                        }
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeBooking}
                    className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
                    aria-label="Close appointment details"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path
                        d="m7 7 10 10M17 7 7 17"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  <DetailRow
                    label="Date"
                    value={formatFullDate(
                      selectedBooking.date,
                    )}
                    icon={<CalendarIcon />}
                  />

                  <DetailRow
                    label="Time"
                    value={selectedBooking.time}
                    icon={<ClockIcon />}
                  />

                  <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
                    <p className="text-xs text-[var(--muted)]">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getBookingStyle(
                        selectedBooking.status,
                      )}`}
                    >
                      {
                        selectedBooking.status
                      }
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-3.5 py-3 text-sm font-medium leading-5 text-[var(--urgent-deep)]">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-3.5 py-3 text-sm font-medium leading-5 text-[var(--success)]">
                    {success}
                  </div>
                )}

                {selectedBooking.status ===
                "upcoming" ? (
                  <div className="mt-5 border-t border-[var(--line)] pt-5">
                    {!isRescheduling ? (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsRescheduling(
                            true,
                          );
                          setError(null);
                          setSuccess(null);
                        }}
                      >
                        Reschedule appointment
                      </Button>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              Choose a new slot
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              Only future available
                              slots are shown.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsRescheduling(
                                false,
                              );
                              setError(null);
                            }}
                            className="text-xs font-semibold text-[var(--brand-deep)] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>

                        {availableSlots.length ===
                        0 ? (
                          <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
                            <p className="text-sm font-medium text-[var(--ink)]">
                              No future slots available
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                              Create additional
                              availability from the
                              Manage Availability
                              page.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
                            {availableSlots.map(
                              (
                                slot,
                              ) => (
                                <button
                                  key={
                                    slot.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleReschedule(
                                      slot,
                                    )
                                  }
                                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-[var(--ink)]">
                                        {formatDate(
                                          slot.date,
                                        )}
                                      </p>

                                      <p className="mt-1 text-xs text-[var(--muted)]">
                                        {
                                          slot.time
                                        }
                                      </p>
                                    </div>

                                    <span className="rounded-lg bg-[var(--success-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--success)]">
                                      Available
                                    </span>
                                  </div>
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 border-t border-[var(--line)] pt-5">
                    <p className="rounded-xl bg-[var(--canvas)] px-3.5 py-3 text-xs leading-5 text-[var(--muted)]">
                      Completed, cancelled,
                      missed, and non-upcoming
                      appointments cannot be
                      rescheduled here.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
      <span className="mt-0.5 text-[var(--brand-deep)]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium leading-5 text-[var(--ink)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div
      className="animate-pulse"
      aria-label="Loading calendar"
    >
      <div className="h-24 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 h-20 rounded-2xl bg-[var(--canvas)]" />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-[40rem] rounded-2xl bg-[var(--canvas)]" />
        <div className="h-80 rounded-2xl bg-[var(--canvas)]" />
      </div>
    </div>
  );
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
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path
        d="M8 3v4M16 3v4M4 10h16"
        strokeLinecap="round"
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
      <circle cx="12" cy="12" r="8" />
      <path
        d="M12 8v4l2.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      className="size-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 7v5c0 4.3-2.7 7.3-7 8.8C7.7 19.3 5 16.3 5 12V7l7-3.5Z"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5 11.3 14l3.5-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}