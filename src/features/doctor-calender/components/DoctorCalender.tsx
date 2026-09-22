"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  getAllBookings,
  rescheduleBooking,
} from "@/lib/bookings-store";

import {
  bookSlot,
  getSlotsForDoctor,
  releaseSlot,
  rescheduleSlot,
} from "@/lib/slots-store";

import {
  createPatientNotification,
} from "@/lib/notifications-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  Booking,
} from "@/types/booking";

import type {
  Slot,
} from "@/types/slot";

type PageStatus =
  | "loading"
  | "unauthorized"
  | "ready";

type CalendarView =
  | "day"
  | "week"
  | "month";

function toISODate(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(
  value: string,
): Date {
  return new Date(
    `${value}T00:00:00`,
  );
}

function addDays(
  date: Date,
  days: number,
): Date {
  const next =
    new Date(date);

  next.setDate(
    next.getDate() + days,
  );

  return next;
}

function getWeekStart(
  date: Date,
): Date {
  const next =
    new Date(date);

  const day =
    next.getDay();

  const offset =
    day === 0
      ? -6
      : 1 - day;

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
  const firstDay =
    new Date(
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

  const start =
    addDays(
      firstDay,
      -mondayOffset,
    );

  return Array.from(
    {
      length: 42,
    },
    (_, index) =>
      addDays(
        start,
        index,
      ),
  );
}

function getBookingStyle(
  status: Booking["status"],
): string {
  if (
    status ===
    "completed"
  ) {
    return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";
  }

  if (
    status ===
    "cancelled"
  ) {
    return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";
  }

  if (
    status === "missed"
  ) {
    return "border-[var(--line)] bg-[var(--canvas)] text-[var(--muted)]";
  }

  if (
    status === "pending"
  ) {
    return "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]";
  }

  if (
    status === "declined"
  ) {
    return "border-[var(--urgent)]/20 bg-[var(--urgent-soft)] text-[var(--urgent-deep)]";
  }

  return "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]";
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

    case "missed":
      return "Missed";

    case "declined":
      return "Declined";
  }
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

function ChevronIcon({
  direction,
}: {
  direction:
    | "left"
    | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      {direction ===
      "left" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.5 6-6 6 6 6"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.5 6 6 6-6 6"
        />
      )}
    </svg>
  );
}

export default function DoctorCalendar() {
  const searchParams =
    useSearchParams();

  const appointmentId =
    searchParams.get(
      "appointmentId",
    );

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
    slots,
    setSlots,
  ] = useState<Slot[]>(
    [],
  );

  const [
    calendarView,
    setCalendarView,
  ] = useState<CalendarView>(
    "week",
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    toISODate(
      new Date(),
    ),
  );

  const [
    monthAnchor,
    setMonthAnchor,
  ] = useState(
    new Date(),
  );

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<Booking | null>(
    null,
  );

  const [
    isRescheduling,
    setIsRescheduling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  function refreshData(
    id: string,
  ) {
    const doctorBookings =
      getAllBookings().filter(
        (booking) =>
          booking.doctorId ===
          id,
      );

    setBookings(
      doctorBookings,
    );

    setSlots(
      getSlotsForDoctor(id),
    );
  }

  useEffect(() => {
    Promise.resolve().then(
      () => {
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

        refreshData(
          session.id,
        );

        setPageStatus(
          "ready",
        );
      },
    );
  }, []);

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    const currentDoctorId =
      doctorId;

    function handleBookingsUpdated() {
      refreshData(
        currentDoctorId,
      );
    }

    function handleSlotsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          doctorId?: string;
        }>;

      if (
        customEvent.detail
          ?.doctorId !==
        currentDoctorId
      ) {
        return;
      }

      setSlots(
        getSlotsForDoctor(
          currentDoctorId,
        ),
      );
    }

    window.addEventListener(
      "schedula:bookings-updated",
      handleBookingsUpdated,
    );

    window.addEventListener(
      "schedula:slots-updated",
      handleSlotsUpdated,
    );

    return () => {
      window.removeEventListener(
        "schedula:bookings-updated",
        handleBookingsUpdated,
      );

      window.removeEventListener(
        "schedula:slots-updated",
        handleSlotsUpdated,
      );
    };
  }, [doctorId]);

  useEffect(() => {
    if (
      !appointmentId ||
      !doctorId ||
      bookings.length === 0
    ) {
      return;
    }

    const target =
      bookings.find(
        (booking) =>
          booking.id ===
          appointmentId,
      );

    if (!target) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        setSelectedBooking(
          target,
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    appointmentId,
    doctorId,
    bookings,
  ]);

  const visibleDays =
    useMemo(() => {
      if (
        calendarView ===
        "day"
      ) {
        return [
          parseDate(
            selectedDate,
          ),
        ];
      }

      if (
        calendarView ===
        "week"
      ) {
        const start =
          getWeekStart(
            parseDate(
              selectedDate,
            ),
          );

        return Array.from(
          {
            length: 7,
          },
          (_, index) =>
            addDays(
              start,
              index,
            ),
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

  const availableSlots =
    useMemo(() => {
      if (
        !selectedBooking
      ) {
        return [];
      }

      const now =
        new Date();

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
    }, [
      slots,
      selectedBooking,
    ]);

  function getBookingsForDate(
    date: string,
  ) {
    return bookings.filter(
      (booking) =>
        booking.date ===
        date,
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
        new Date(
          monthAnchor,
        );

      next.setMonth(
        next.getMonth() +
          amount,
      );

      setMonthAnchor(
        next,
      );

      return;
    }

    const days =
      calendarView ===
      "week"
        ? amount * 7
        : amount;

    setSelectedDate(
      toISODate(
        addDays(
          parseDate(
            selectedDate,
          ),
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

    setMonthAnchor(
      today,
    );
  }

  function selectBooking(
    booking: Booking,
  ) {
    setSelectedBooking(
      booking,
    );

    setIsRescheduling(
      false,
    );

    setError(null);

    setSuccess(null);
  }

  function closeBooking() {
    setSelectedBooking(
      null,
    );

    setIsRescheduling(
      false,
    );

    setError(null);

    setSuccess(null);
  }

  function notifyPatientOfReschedule(
    booking: Booking,
    newSlot: Slot,
  ) {
    if (
      !booking.patientId
    ) {
      return;
    }

    createPatientNotification({
      userId:
        booking.patientId,

      title:
        "Appointment rescheduled",

      message: `Your appointment has been rescheduled to ${formatFullDate(
        newSlot.date,
      )} at ${newSlot.time}.`,

      type:
        "appointment",

      appointmentId:
        booking.id,
    });
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

    const currentDoctorId =
      doctorId;

    const currentBooking =
      selectedBooking;

    setError(null);

    setSuccess(null);

    const currentStatus =
      currentBooking.status;

    if (
      currentStatus !==
        "upcoming" &&
      currentStatus !==
        "declined"
    ) {
      setError(
        "Only upcoming or declined appointments can be rescheduled.",
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

    const latestSlots =
      getSlotsForDoctor(
        currentDoctorId,
      );

    const latestNewSlot =
      latestSlots.find(
        (slot) =>
          slot.id ===
          newSlot.id,
      );

    if (
      !latestNewSlot ||
      latestNewSlot.status !==
        "available"
    ) {
      setError(
        "This slot is no longer available. Please select another slot.",
      );

      setSlots(
        latestSlots,
      );

      return;
    }

    if (
      currentStatus ===
      "upcoming"
    ) {
      const previousSlotId =
        currentBooking.slotId;

      const updatedSlots =
        rescheduleSlot(
          currentDoctorId,
          previousSlotId,
          latestNewSlot.id,
        );

      if (!updatedSlots) {
        setError(
          "This slot is no longer available. Please select another slot.",
        );

        setSlots(
          getSlotsForDoctor(
            currentDoctorId,
          ),
        );

        return;
      }

      const updatedBooking =
        rescheduleBooking(
          currentBooking.id,
          {
            slotId:
              latestNewSlot.id,

            date:
              latestNewSlot.date,

            time:
              latestNewSlot.time,
          },
        );

      if (!updatedBooking) {
        const rollbackResult =
          rescheduleSlot(
            currentDoctorId,
            latestNewSlot.id,
            previousSlotId,
          );

        if (
          rollbackResult
        ) {
          setSlots(
            rollbackResult,
          );
        } else {
          setSlots(
            getSlotsForDoctor(
              currentDoctorId,
            ),
          );
        }

        refreshData(
          currentDoctorId,
        );

        setError(
          "The appointment could not be updated. The original slot was restored.",
        );

        return;
      }

      const refreshedBookings =
        getAllBookings().filter(
          (booking) =>
            booking.doctorId ===
            currentDoctorId,
        );

      setBookings(
        refreshedBookings,
      );

      setSlots(
        updatedSlots,
      );

      setSelectedBooking(
        updatedBooking,
      );

      setIsRescheduling(
        false,
      );

      notifyPatientOfReschedule(
        updatedBooking,
        latestNewSlot,
      );

      setSuccess(
        "Appointment successfully rescheduled and moved to upcoming.",
      );

      return;
    }

    const bookedSlots =
      bookSlot(
        currentDoctorId,
        latestNewSlot.id,
      );

    if (!bookedSlots) {
      setError(
        "This slot is no longer available. Please select another slot.",
      );

      setSlots(
        getSlotsForDoctor(
          currentDoctorId,
        ),
      );

      return;
    }

    const updatedBooking =
      rescheduleBooking(
        currentBooking.id,
        {
          slotId:
            latestNewSlot.id,

          date:
            latestNewSlot.date,

          time:
            latestNewSlot.time,
        },
      );

    if (!updatedBooking) {
      releaseSlot(
        currentDoctorId,
        latestNewSlot.id,
      );

      setSlots(
        getSlotsForDoctor(
          currentDoctorId,
        ),
      );

      refreshData(
        currentDoctorId,
      );

      setError(
        "The appointment could not be updated. The new slot was released.",
      );

      return;
    }

    const refreshedBookings =
      getAllBookings().filter(
        (booking) =>
          booking.doctorId ===
          currentDoctorId,
      );

    setBookings(
      refreshedBookings,
    );

    setSlots(
      getSlotsForDoctor(
        currentDoctorId,
      ),
    );

    setSelectedBooking(
      updatedBooking,
    );

    setIsRescheduling(
      false,
    );

    notifyPatientOfReschedule(
      updatedBooking,
      latestNewSlot,
    );

    setSuccess(
      "Appointment successfully rescheduled and moved to upcoming.",
    );
  }

  if (
    pageStatus ===
    "loading"
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading calendar...
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
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
            <CalendarIcon />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[var(--ink)]">
            Doctor access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Log in with your doctor account
            to access the calendar.
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

  const today =
    toISODate(
      new Date(),
    );

  const calendarTitle =
    calendarView ===
    "month"
      ? monthAnchor.toLocaleDateString(
          "en-IN",
          {
            month:
              "long",
            year:
              "numeric",
          },
        )
      : calendarView ===
          "week"
        ? `${formatDate(
            toISODate(
              visibleDays[0],
            ),
          )} - ${formatDate(
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
      <header>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Doctor Portal
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              Calendar
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Manage your schedule,
              appointments and
              availability from one
              place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={
                goToToday
              }
            >
              Today
            </Button>

            <button
              type="button"
              onClick={() =>
                moveCalendar(
                  "previous",
                )
              }
              className="grid size-9 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)]"
              aria-label="Previous period"
            >
              <ChevronIcon direction="left" />
            </button>

            <button
              type="button"
              onClick={() =>
                moveCalendar(
                  "next",
                )
              }
              className="grid size-9 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)]"
              aria-label="Next period"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-[var(--ink)]">
              {calendarTitle}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {bookings.length}{" "}
              total appointment
              {bookings.length ===
              1
                ? ""
                : "s"}{" "}
              in your schedule
            </p>
          </div>

          <div className="inline-flex w-fit rounded-lg bg-[var(--canvas)] p-1">
            {(
              [
                "day",
                "week",
                "month",
              ] as CalendarView[]
            ).map(
              (view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() =>
                    setCalendarView(
                      view,
                    )
                  }
                  className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${
                    calendarView ===
                    view
                      ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {view}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
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
                      className="border-r border-[var(--line)] px-1 py-3 text-center text-[11px] font-semibold text-[var(--muted)] last:border-r-0 sm:text-xs"
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
                        className={`min-h-24 border-b border-r border-[var(--line)] p-1.5 text-left hover:bg-[var(--canvas)] sm:min-h-28 sm:p-2 ${
                          !currentMonth
                            ? "bg-slate-50/70"
                            : ""
                        }`}
                      >
                        <span
                          className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                            date ===
                            today
                              ? "bg-[var(--brand)] text-white"
                              : "text-[var(--ink)]"
                          }`}
                        >
                          {
                            day.getDate()
                          }
                        </span>

                        <div className="mt-1.5 space-y-1">
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
                                  className={`block truncate rounded px-1.5 py-1 text-[9px] font-medium sm:text-[10px] ${getBookingStyle(
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
                            <span className="block px-1 text-[9px] text-[var(--muted)]">
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
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="w-full shrink-0 sm:w-36">
                          <p className="font-semibold text-[var(--ink)]">
                            {formatDate(
                              date,
                            )}
                          </p>

                          {date ===
                            today && (
                            <span className="mt-1 inline-flex rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--brand-deep)]">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {dayBookings.length ===
                            0 &&
                            daySlots.length ===
                              0 && (
                              <p className="rounded-lg bg-[var(--canvas)] px-3 py-3 text-sm text-[var(--muted)]">
                                No appointments
                                or availability.
                              </p>
                            )}

                          {dayBookings.length >
                            0 && (
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                  Appointments
                                </p>

                                <span className="text-xs text-[var(--muted)]">
                                  {
                                    dayBookings.length
                                  }{" "}
                                  total
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
                                      className={`rounded-xl border p-3.5 text-left transition hover:shadow-sm ${getBookingStyle(
                                        booking.status,
                                      )}`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold">
                                            {
                                              booking.patientName
                                            }
                                          </p>

                                          <p className="mt-1 flex items-center gap-1.5 text-xs">
                                            <ClockIcon />
                                            {
                                              booking.time
                                            }
                                          </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold capitalize">
                                          {
                                            getStatusLabel(
                                              booking.status,
                                            )
                                          }
                                        </span>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {daySlots.length >
                            0 && (
                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                  Availability
                                </p>

                                <span className="text-xs text-[var(--muted)]">
                                  {
                                    daySlots.length
                                  }{" "}
                                  slots
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {daySlots.map(
                                  (
                                    slot,
                                  ) => (
                                    <span
                                      key={
                                        slot.id
                                      }
                                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                                        slot.status ===
                                        "available"
                                          ? "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]"
                                          : slot.status ===
                                              "booked"
                                            ? "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                                            : "border-[var(--line)] bg-[var(--canvas)] text-[var(--muted)]"
                                      }`}
                                    >
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

        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          {!selectedBooking ? (
            <EmptyState
              title="Select an appointment"
              description="Click an appointment in the calendar to view details or reschedule it."
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    Appointment
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {
                      selectedBooking.patientName
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeBooking
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                  aria-label="Close appointment details"
                >
                  <span
                    aria-hidden="true"
                    className="text-xl leading-none"
                  >
                    ×
                  </span>
                </button>
              </div>

              <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 text-[var(--brand-deep)]">
                    <CalendarIcon />
                  </span>

                  <div>
                    <p className="text-xs text-[var(--muted)]">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                      {formatFullDate(
                        selectedBooking.date,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="mt-0.5 text-[var(--brand-deep)]">
                    <ClockIcon />
                  </span>

                  <div>
                    <p className="text-xs text-[var(--muted)]">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                      {
                        selectedBooking.time
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStyle(
                      selectedBooking.status,
                    )}`}
                  >
                    {getStatusLabel(
                      selectedBooking.status,
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[var(--urgent-soft)] px-3.5 py-3 text-sm leading-5 text-[var(--urgent-deep)]"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-[var(--success-soft)] px-3.5 py-3 text-sm leading-5 text-[var(--success)]"
                >
                  {success}
                </p>
              )}

              {(
                selectedBooking.status ===
                  "upcoming" ||
                selectedBooking.status ===
                  "declined"
              ) ? (
                <div className="mt-6 border-t border-[var(--line)] pt-5">
                  {!isRescheduling ? (
                    <div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsRescheduling(
                            true,
                          );

                          setError(
                            null,
                          );

                          setSuccess(
                            null,
                          );
                        }}
                      >
                        Reschedule appointment
                      </Button>

                      {selectedBooking.status ===
                        "declined" && (
                        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                          Rescheduling this declined appointment will assign a new available slot and move the appointment to upcoming.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            Available slots
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Select a future
                            slot for this
                            appointment.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsRescheduling(
                              false,
                            );

                            setError(
                              null,
                            );
                          }}
                          className="shrink-0 text-xs font-semibold text-[var(--brand-deep)] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      {availableSlots.length ===
                      0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 py-5 text-center">
                          <p className="text-sm font-medium text-[var(--ink)]">
                            No future slots available
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            Add a new availability
                            slot and try again.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
                          {availableSlots.map(
                            (slot) => (
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
                                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
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

                                  <span className="text-xs font-semibold text-[var(--brand-deep)]">
                                    Select
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
                <p className="mt-6 rounded-xl bg-[var(--canvas)] px-3.5 py-3 text-xs leading-5 text-[var(--muted)]">
                  Completed, cancelled and
                  missed appointments cannot be
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