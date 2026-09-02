"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type PageStatus = "loading" | "unauthorized" | "ready";

type CalendarView = "day" | "week" | "month";

function toISODate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);

  next.setDate(next.getDate() + days);

  return next;
}

function getWeekStart(date: Date): Date {
  const next = new Date(date);

  const day = next.getDay();

  const offset = day === 0 ? -6 : 1 - day;

  next.setDate(next.getDate() + offset);

  next.setHours(0, 0, 0, 0);

  return next;
}

function formatDate(date: string): string {
  return parseDate(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(date: string): string {
  return parseDate(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getMonthDays(anchor: Date): Date[] {
  const firstDay = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    1,
  );

  const weekday = firstDay.getDay();

  const mondayOffset = weekday === 0 ? 6 : weekday - 1;

  const start = addDays(firstDay, -mondayOffset);

  return Array.from(
    {
      length: 42,
    },
    (_, index) => addDays(start, index),
  );
}

function getBookingStyle(status: Booking["status"]): string {
  if (status === "completed") {
    return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }

  if (status === "cancelled") {
    return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";
  }

  return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";
}

export default function DoctorCalendar() {
  const [pageStatus, setPageStatus] =
    useState<PageStatus>("loading");

  const [doctorId, setDoctorId] = useState<string | null>(
    null,
  );

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [slots, setSlots] = useState<Slot[]>([]);

  const [calendarView, setCalendarView] =
    useState<CalendarView>("week");

  const [selectedDate, setSelectedDate] = useState(
    toISODate(new Date()),
  );

  const [monthAnchor, setMonthAnchor] = useState(new Date());

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [isRescheduling, setIsRescheduling] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  function refreshData(id: string) {
    const doctorBookings = getAllBookings().filter(
      (booking) => booking.doctorId === id,
    );

    setBookings(doctorBookings);

    setSlots(getSlotsForDoctor(id));
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getSession();

      if (!session || session.role !== "doctor") {
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
      return [parseDate(selectedDate)];
    }

    if (calendarView === "week") {
      const start = getWeekStart(parseDate(selectedDate));

      return Array.from(
        {
          length: 7,
        },
        (_, index) => addDays(start, index),
      );
    }

    return getMonthDays(monthAnchor);
  }, [calendarView, selectedDate, monthAnchor]);

  /*
   * Only future slots can be used for rescheduling.
   *
   * Examples:
   * - Yesterday → blocked
   * - Earlier today → blocked
   * - Later today → allowed
   * - Any future date → allowed
   */
  const availableSlots = useMemo(() => {
    if (!selectedBooking) {
      return [];
    }

    const now = new Date();

    return slots
      .filter((slot) => {
        if (slot.status !== "available") {
          return false;
        }

        if (slot.id === selectedBooking.slotId) {
          return false;
        }

        const slotDateTime = new Date(
          `${slot.date}T${slot.time}`,
        );

        return slotDateTime > now;
      })
      .sort((a, b) => {
        const first = `${a.date}T${a.time}`;

        const second = `${b.date}T${b.time}`;

        return first.localeCompare(second);
      });
  }, [slots, selectedBooking]);

  function getBookingsForDate(date: string) {
    return bookings.filter(
      (booking) => booking.date === date,
    );
  }

  function moveCalendar(direction: "previous" | "next") {
    const amount = direction === "next" ? 1 : -1;

    if (calendarView === "month") {
      const next = new Date(monthAnchor);

      next.setMonth(next.getMonth() + amount);

      setMonthAnchor(next);

      return;
    }

    const days =
      calendarView === "week" ? amount * 7 : amount;

    setSelectedDate(
      toISODate(
        addDays(parseDate(selectedDate), days),
      ),
    );
  }

  function goToToday() {
    const today = new Date();

    setSelectedDate(toISODate(today));

    setMonthAnchor(today);
  }

  function selectBooking(booking: Booking) {
    setSelectedBooking(booking);

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

  function handleReschedule(newSlot: Slot) {
    if (!doctorId || !selectedBooking) {
      return;
    }

    setError(null);

    setSuccess(null);

    if (selectedBooking.status !== "upcoming") {
      setError(
        "Only upcoming appointments can be rescheduled.",
      );

      return;
    }

    /*
     * Final protection against selecting a past slot.
     */
    const slotDateTime = new Date(
      `${newSlot.date}T${newSlot.time}`,
    );

    if (slotDateTime <= new Date()) {
      setError(
        "Appointments cannot be rescheduled to a past date or time.",
      );

      return;
    }

    /*
     * Reserve the new slot first.
     */
    const newSlotResult = bookSlot(
      doctorId,
      newSlot.id,
    );

    if (!newSlotResult) {
      setError(
        "This slot is no longer available. Please select another slot.",
      );

      setSlots(getSlotsForDoctor(doctorId));

      return;
    }

    /*
     * Release the previously booked slot.
     */
    releaseSlot(doctorId, selectedBooking.slotId);

    /*
     * Update the existing appointment.
     * No duplicate booking is created.
     */
    const updatedBookings = updateBooking(
      selectedBooking.id,
      {
        slotId: newSlot.id,
        date: newSlot.date,
        time: newSlot.time,
        status: "upcoming",
      },
    );

    const updatedBooking =
      updatedBookings.find(
        (booking) => booking.id === selectedBooking.id,
      ) ?? null;

    setBookings(
      updatedBookings.filter(
        (booking) => booking.doctorId === doctorId,
      ),
    );

    setSlots(getSlotsForDoctor(doctorId));

    setSelectedBooking(updatedBooking);

    setIsRescheduling(false);

    setSuccess("Appointment successfully rescheduled.");
  }

  if (pageStatus === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading calendar…
      </div>
    );
  }

  if (pageStatus === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Doctor access required
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Log in with your doctor account to access the calendar.
        </p>

        <Link
          href="/doctor/login"
          className="mt-6 inline-block"
        >
          <Button>Doctor login</Button>
        </Link>
      </div>
    );
  }

  const today = toISODate(new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Calendar
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your schedule, appointments and availability.
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
            onClick={() => moveCalendar("previous")}
          >
            ←
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => moveCalendar("next")}
          >
            →
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--ink)]">
            {calendarView === "month"
              ? monthAnchor.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })
              : calendarView === "week"
                ? `${formatDate(
                    toISODate(visibleDays[0]),
                  )} – ${formatDate(
                    toISODate(
                      visibleDays[visibleDays.length - 1],
                    ),
                  )}`
                : formatFullDate(selectedDate)}
          </p>
        </div>

        <div className="flex rounded-lg bg-[var(--canvas)] p-1">
          {(["day", "week", "month"] as CalendarView[]).map(
            (view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCalendarView(view)}
                className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${
                  calendarView === view
                    ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                    : "text-[var(--muted)]"
                }`}
              >
                {view}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
          {calendarView === "month" ? (
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
                ].map((day) => (
                  <div
                    key={day}
                    className="border-r border-[var(--line)] px-2 py-3 text-center text-xs font-semibold text-[var(--muted)] last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {visibleDays.map((day) => {
                  const date = toISODate(day);

                  const dayBookings = getBookingsForDate(date);

                  const currentMonth =
                    day.getMonth() === monthAnchor.getMonth();

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setCalendarView("day");
                      }}
                      className={`min-h-28 border-b border-r border-[var(--line)] p-2 text-left hover:bg-[var(--canvas)] ${
                        !currentMonth ? "bg-slate-50" : ""
                      }`}
                    >
                      <span
                        className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                          date === today
                            ? "bg-[var(--brand)] text-white"
                            : "text-[var(--ink)]"
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      <div className="mt-2 space-y-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <span
                            key={booking.id}
                            className={`block truncate rounded px-1.5 py-1 text-[10px] font-medium ${getBookingStyle(
                              booking.status,
                            )}`}
                          >
                            {booking.time}
                          </span>
                        ))}

                        {dayBookings.length > 3 && (
                          <span className="text-[10px] text-[var(--muted)]">
                            +{dayBookings.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {visibleDays.map((day) => {
                const date = toISODate(day);

                const dayBookings = getBookingsForDate(date);

                const daySlots = slots.filter(
                  (slot) => slot.date === date,
                );

                return (
                  <div
                    key={date}
                    className="p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="w-full shrink-0 sm:w-36">
                        <p className="font-semibold text-[var(--ink)]">
                          {formatDate(date)}
                        </p>

                        {date === today && (
                          <span className="mt-1 inline-flex rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-deep)]">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {dayBookings.length === 0 &&
                          daySlots.length === 0 && (
                            <p className="text-sm text-[var(--muted)]">
                              No appointments or availability.
                            </p>
                          )}

                        {dayBookings.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                              Appointments
                            </p>

                            <div className="grid gap-2 md:grid-cols-2">
                              {dayBookings.map((booking) => (
                                <button
                                  key={booking.id}
                                  type="button"
                                  onClick={() =>
                                    selectBooking(booking)
                                  }
                                  className={`rounded-lg border p-3 text-left transition hover:brightness-95 ${getBookingStyle(
                                    booking.status,
                                  )}`}
                                >
                                  <p className="text-sm font-semibold">
                                    {booking.patientName}
                                  </p>

                                  <p className="mt-1 text-xs">
                                    {booking.time}
                                  </p>

                                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                    {booking.status}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {daySlots.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                              Availability
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {daySlots.map((slot) => (
                                <span
                                  key={slot.id}
                                  className={`rounded-md border px-2 py-1 text-[11px] ${
                                    slot.status === "available"
                                      ? "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]"
                                      : slot.status === "booked"
                                        ? "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                                        : "border-[var(--line)] bg-slate-50 text-[var(--muted)]"
                                  }`}
                                >
                                  {slot.time}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
          {!selectedBooking ? (
            <EmptyState
              title="Select an appointment"
              description="Click an appointment in the calendar to view details or reschedule it."
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Appointment
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {selectedBooking.patientName}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeBooking}
                  className="grid size-8 place-items-center rounded-lg text-lg text-[var(--muted)] hover:bg-[var(--canvas)]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                    {formatFullDate(selectedBooking.date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                    {selectedBooking.time}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getBookingStyle(
                      selectedBooking.status,
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {error && (
                <p className="mt-5 rounded-lg bg-[var(--urgent-soft)] px-3 py-3 text-sm text-[var(--urgent-deep)]">
                  {error}
                </p>
              )}

              {success && (
                <p className="mt-5 rounded-lg bg-[var(--success-soft)] px-3 py-3 text-sm text-[var(--success)]">
                  {success}
                </p>
              )}

              {selectedBooking.status === "upcoming" ? (
                <div className="mt-6 border-t border-[var(--line)] pt-5">
                  {!isRescheduling ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsRescheduling(true);
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      Reschedule appointment
                    </Button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          Available slots
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setIsRescheduling(false);
                            setError(null);
                          }}
                          className="text-xs font-semibold text-[var(--brand-deep)]"
                        >
                          Cancel
                        </button>
                      </div>

                      {availableSlots.length === 0 ? (
                        <p className="mt-4 text-sm text-[var(--muted)]">
                          No future slots are currently available.
                        </p>
                      ) : (
                        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() =>
                                handleReschedule(slot)
                              }
                              className="w-full rounded-lg border border-[var(--line)] px-3 py-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                            >
                              <p className="text-sm font-semibold text-[var(--ink)]">
                                {formatDate(slot.date)}
                              </p>

                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {slot.time}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-6 rounded-lg bg-[var(--canvas)] px-3 py-3 text-xs text-[var(--muted)]">
                  Completed and cancelled appointments cannot be
                  rescheduled.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}