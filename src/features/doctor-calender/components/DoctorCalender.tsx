"use client";

import Link from "next/link";

import {
 useEffect,
 useMemo,
 useState,
} from "react";

import { useSearchParams } from "next/navigation";

import {
 useDispatch,
 useSelector,
} from "react-redux";

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
 rescheduleSlot,
} from "@/lib/slots-store";

import {
 createPatientNotification,
} from "@/lib/notifications-store";

import type { Booking } from "@/types/booking";
import type { Slot } from "@/types/slot";

import type {
 AppDispatch,
 RootState,
} from "@/store";

import {
 setAppointments,
 updateAppointment,
} from "@/store/slices/appointmentsSlice";

import {
 initializeDoctorSlots,
 setDoctorSlots,
 bookDoctorSlot,
 rescheduleDoctorSlot,
} from "@/store/slices/slotsSlice";

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
  { length: 42 },
  (_, index) =>
   addDays(
    start,
    index,
   ),
 );
}

function parseSlotDateTime(
 slot: Slot,
): Date | null {
 const startTime =
  slot.time
   .split(" - ")[0]
   ?.trim();

 if (!startTime) {
  return null;
 }

 const match =
  startTime.match(
   /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );

 if (!match) {
  return null;
 }

 const hour = Number(
  match[1],
 );

 const minute = Number(
  match[2],
 );

 const period =
  match[3].toUpperCase();

 if (
  hour < 1 ||
  hour > 12 ||
  minute < 0 ||
  minute > 59
 ) {
  return null;
 }

 let hour24 = hour;

 if (period === "AM") {
  hour24 =
   hour === 12
    ? 0
    : hour;
 } else {
  hour24 =
   hour === 12
    ? 12
    : hour + 12;
 }

 const date = parseDate(
  slot.date,
 );

 date.setHours(
  hour24,
  minute,
  0,
  0,
 );

 return date;
}

function getBookingStyle(
 status: Booking["status"],
): string {
 if (
  status === "completed"
 ) {
  return "border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand-deep)]";
 }

 if (
  status === "cancelled" ||
  status === "declined"
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
 direction: "left" | "right";
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
   {direction === "left" ? (
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
 const dispatch =
  useDispatch<AppDispatch>();

 const searchParams =
  useSearchParams();

 const appointmentId =
  searchParams.get(
   "appointmentId",
  );

 const authInitialized =
  useSelector(
   (state: RootState) =>
    state.auth.initialized,
  );

 const authUser =
  useSelector(
   (state: RootState) =>
    state.auth.user,
  );

 const appointmentsInitialized =
  useSelector(
   (state: RootState) =>
    state.appointments.initialized,
  );

 const allBookings =
  useSelector(
   (state: RootState) =>
    state.appointments.appointments,
  );

 const doctorId =
  authUser?.role === "doctor"
   ? authUser.id
   : null;

 const slotsInitialized =
  useSelector(
   (state: RootState) =>
    doctorId
     ? state.slots.initializedDoctors.includes(
        doctorId,
       )
     : false,
  );

 const slots =
  useSelector(
   (state: RootState) =>
    doctorId
     ? state.slots.slotsByDoctor[
        doctorId
       ] ?? []
     : [],
  );

 const bookings = useMemo(
  () =>
   doctorId
    ? allBookings.filter(
       (booking) =>
        booking.doctorId ===
        doctorId,
      )
    : [],
  [
   allBookings,
   doctorId,
  ],
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
  toISODate(new Date()),
 );

 const [
  monthAnchor,
  setMonthAnchor,
 ] = useState(
  new Date(),
 );

 const [
  selectedBookingId,
  setSelectedBookingId,
 ] = useState<string | null>(
  null,
 );

 const [
  isRescheduling,
  setIsRescheduling,
 ] = useState(false);

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

 const selectedBooking =
  useMemo(
   () =>
    selectedBookingId
     ? bookings.find(
        (booking) =>
         booking.id ===
         selectedBookingId,
       ) ?? null
     : null,
   [
    bookings,
    selectedBookingId,
   ],
  );

 useEffect(() => {
  if (
   !authInitialized ||
   !doctorId ||
   appointmentsInitialized
  ) {
   return;
  }

  dispatch(
   setAppointments(
    getAllBookings(),
   ),
  );
 }, [
  authInitialized,
  doctorId,
  appointmentsInitialized,
  dispatch,
 ]);

 useEffect(() => {
  if (
   !doctorId ||
   slotsInitialized
  ) {
   return;
  }

  dispatch(
   initializeDoctorSlots({
    doctorId,
    slots:
     getSlotsForDoctor(
      doctorId,
     ),
   }),
  );
 }, [
  doctorId,
  slotsInitialized,
  dispatch,
 ]);

 useEffect(() => {
  if (
   !authInitialized ||
   !doctorId
  ) {
   return;
  }

  const currentDoctorId =
   doctorId;

  function handleBookingsUpdated() {
   dispatch(
    setAppointments(
     getAllBookings(),
    ),
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
     ?.doctorId &&
    customEvent.detail
     .doctorId !==
     currentDoctorId
   ) {
    return;
   }

   dispatch(
    setDoctorSlots({
     doctorId:
      currentDoctorId,
     slots:
      getSlotsForDoctor(
       currentDoctorId,
      ),
    }),
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

  window.addEventListener(
   "storage",
   handleBookingsUpdated,
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

   window.removeEventListener(
    "storage",
    handleBookingsUpdated,
   );
  };
 }, [
  authInitialized,
  doctorId,
  dispatch,
 ]);

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
    setSelectedBookingId(
     target.id,
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

 const pageStatus =
  !authInitialized
   ? "loading"
   : !doctorId
    ? "unauthorized"
    : "ready";

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
     { length: 7 },
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
   if (!selectedBooking) {
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
      parseSlotDateTime(
       slot,
      );

     return (
      slotDateTime !==
       null &&
      slotDateTime > now
     );
    })
    .sort((a, b) => {
     const first =
      parseSlotDateTime(a);

     const second =
      parseSlotDateTime(b);

     if (
      first &&
      second
     ) {
      return (
       first.getTime() -
       second.getTime()
      );
     }

     return `${a.date} ${a.time}`.localeCompare(
      `${b.date} ${b.time}`,
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
    new Date(
     monthAnchor,
    );

   next.setMonth(
    next.getMonth() +
     amount,
   );

   setMonthAnchor(next);

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

  setMonthAnchor(today);
 }

 function selectBooking(
  booking: Booking,
 ) {
  setSelectedBookingId(
   booking.id,
  );

  setIsRescheduling(
   false,
  );

  setError(null);
  setSuccess(null);
 }

 function closeBooking() {
  setSelectedBookingId(
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
  if (!booking.patientId) {
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
   type: "appointment",
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
    "confirmed" &&
   currentStatus !==
    "upcoming" &&
   currentStatus !==
    "declined"
  ) {
   setError(
    "Only confirmed, upcoming or declined appointments can be rescheduled.",
   );

   return;
  }

  const slotDateTime =
   parseSlotDateTime(
    newSlot,
   );

  if (
   !slotDateTime ||
   slotDateTime <=
    new Date()
  ) {
   setError(
    "Appointments cannot be rescheduled to a past date or time.",
   );

   return;
  }

  const latestNewSlot =
   slots.find(
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

   dispatch(
    setDoctorSlots({
     doctorId:
      currentDoctorId,
     slots,
    }),
   );

   return;
  }

  if (
   currentStatus ===
    "confirmed" ||
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

    dispatch(
     setDoctorSlots({
      doctorId:
       currentDoctorId,
      slots:
       getSlotsForDoctor(
        currentDoctorId,
       ),
     }),
    );

    return;
   }

   const updatedBooking =
    updateBooking(
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

    dispatch(
     setDoctorSlots({
      doctorId:
       currentDoctorId,
      slots:
       rollbackResult ??
       getSlotsForDoctor(
        currentDoctorId,
       ),
     }),
    );

    setError(
     "The appointment could not be updated. The original slot was restored.",
    );

    return;
   }

   dispatch(
    rescheduleDoctorSlot({
     doctorId:
      currentDoctorId,
     currentSlotId:
      previousSlotId,
     newSlotId:
      latestNewSlot.id,
    }),
   );

   dispatch(
    updateAppointment({
     bookingId:
      currentBooking.id,
     updates: {
      slotId:
       latestNewSlot.id,
      date:
       latestNewSlot.date,
      time:
       latestNewSlot.time,
     },
    }),
   );

   setIsRescheduling(
    false,
   );

   notifyPatientOfReschedule(
    updatedBooking,
    latestNewSlot,
   );

   setSuccess(
    "Appointment successfully rescheduled.",
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

   dispatch(
    setDoctorSlots({
     doctorId:
      currentDoctorId,
     slots:
      getSlotsForDoctor(
       currentDoctorId,
      ),
    }),
   );

   return;
  }

  const updatedBooking =
   updateBooking(
    currentBooking.id,
    {
     slotId:
      latestNewSlot.id,
     date:
      latestNewSlot.date,
     time:
      latestNewSlot.time,
     status:
      "upcoming",
    },
   );

  if (!updatedBooking) {
   releaseSlot(
    currentDoctorId,
    latestNewSlot.id,
   );

   dispatch(
    setDoctorSlots({
     doctorId:
      currentDoctorId,
     slots:
      getSlotsForDoctor(
       currentDoctorId,
      ),
    }),
   );

   setError(
    "The appointment could not be updated. The new slot was released.",
   );

   return;
  }

  dispatch(
   bookDoctorSlot({
    doctorId:
     currentDoctorId,
    slotId:
     latestNewSlot.id,
   }),
  );

  dispatch(
   updateAppointment({
    bookingId:
     currentBooking.id,
    updates: {
     slotId:
      latestNewSlot.id,
     date:
      latestNewSlot.date,
     time:
      latestNewSlot.time,
     status:
      "upcoming",
    },
   }),
  );

  setIsRescheduling(
   false,
  );

  notifyPatientOfReschedule(
   updatedBooking,
   latestNewSlot,
  );

  setSuccess(
   "Appointment successfully rescheduled.",
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
  toISODate(new Date());

 const calendarTitle =
  calendarView ===
  "month"
   ? monthAnchor.toLocaleDateString(
      "en-IN",
      {
       month: "long",
       year: "numeric",
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
       <ChevronIcon
        direction="left"
       />
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
       <ChevronIcon
        direction="right"
       />
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
       {bookings.length} total
       appointment
       {bookings.length ===
        1
        ? ""
        : "s"} in your
       schedule
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
      <div className="grid grid-cols-7">
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
          className="border-b border-r border-[var(--line)] px-2 py-3 text-center text-xs font-semibold text-[var(--muted)]"
         >
          {day}
         </div>
        ),
       )}

       {visibleDays.map(
        (date) => {
         const iso =
          toISODate(
           date,
          );

         const dayBookings =
          getBookingsForDate(
           iso,
          );

         const isCurrentMonth =
          date.getMonth() ===
          monthAnchor.getMonth();

         const isToday =
          iso === today;

         return (
          <button
           key={iso}
           type="button"
           onClick={() => {
            setSelectedDate(
             iso,
            );

            setCalendarView(
             "day",
            );
           }}
           className={`min-h-28 border-b border-r border-[var(--line)] p-2 text-left transition hover:bg-[var(--canvas)] ${
            !isCurrentMonth
             ? "bg-[var(--canvas)]/50"
             : ""
           }`}
          >
           <span
            className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
             isToday
              ? "bg-[var(--brand)] text-white"
              : isCurrentMonth
               ? "text-[var(--ink)]"
               : "text-[var(--muted)]"
            }`}
           >
            {date.getDate()}
           </span>

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
               <button
                key={
                 booking.id
                }
                type="button"
                onClick={(
                 event,
                ) => {
                 event.stopPropagation();

                 selectBooking(
                  booking,
                 );
                }}
                className={`block w-full truncate rounded-md border px-2 py-1 text-left text-[11px] font-medium ${getBookingStyle(
                 booking.status,
                )}`}
               >
                {booking.time}{" "}
                ·{" "}
                {
                 booking.patientName
                }
               </button>
              ),
             )}

            {dayBookings.length >
             3 && (
             <p className="px-1 text-[11px] text-[var(--muted)]">
              +
              {dayBookings.length -
               3}{" "}
              more
             </p>
            )}
           </div>
          </button>
         );
        },
       )}
      </div>
     ) : (
      <div className="overflow-x-auto">
       <div
        className={`grid min-w-[${
         calendarView ===
         "week"
          ? "900px"
          : "0"
        }] ${
         calendarView ===
         "week"
          ? "grid-cols-7"
          : "grid-cols-1"
        }`}
       >
        {visibleDays.map(
         (date) => {
          const iso =
           toISODate(
            date,
           );

          const dayBookings =
           getBookingsForDate(
            iso,
           );

          const isToday =
           iso === today;

          return (
           <div
            key={iso}
            className="min-h-[34rem] border-r border-[var(--line)] last:border-r-0"
           >
            <button
             type="button"
             onClick={() =>
              setSelectedDate(
               iso,
              )
             }
             className={`w-full border-b border-[var(--line)] px-3 py-4 text-center hover:bg-[var(--canvas)] ${
              isToday
               ? "bg-[var(--brand-soft)]"
               : ""
             }`}
            >
             <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              {date.toLocaleDateString(
               "en-IN",
               {
                weekday:
                 "short",
               },
              )}
             </p>

             <p
              className={`mt-1 text-lg font-semibold ${
               isToday
                ? "text-[var(--brand-deep)]"
                : "text-[var(--ink)]"
              }`}
             >
              {date.getDate()}
             </p>
            </button>

            <div className="space-y-2 p-2">
             {dayBookings.length ===
             0 ? (
              <p className="py-8 text-center text-xs text-[var(--muted)]">
               No appointments
              </p>
             ) : (
              dayBookings.map(
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
                 className={`w-full rounded-lg border p-3 text-left transition hover:shadow-sm ${getBookingStyle(
                  booking.status,
                 )}`}
                >
                 <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                   <ClockIcon />

                   {
                    booking.time
                   }
                  </span>

                  <span className="text-[10px] font-semibold uppercase">
                   {getStatusLabel(
                    booking.status,
                   )}
                  </span>
                 </div>

                 <p className="mt-2 truncate text-sm font-semibold">
                  {
                   booking.patientName
                  }
                 </p>

                 <p className="mt-1 text-[11px] opacity-80">
                  {booking.consultationType ===
                  "online"
                   ? "Online"
                   : "In-person"}
                 </p>
                </button>
               ),
              )
             )}
            </div>
           </div>
          );
         },
        )}
       </div>
      </div>
     )}
    </section>

    <aside className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
     {selectedBooking ? (
      <>
       <div className="flex items-start justify-between gap-3">
        <div>
         <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
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
         className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
         aria-label="Close appointment"
        >
         ×
        </button>
       </div>

       <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-start gap-3">
         <CalendarIcon />

         <div>
          <p className="font-medium text-[var(--ink)]">
           {formatFullDate(
            selectedBooking.date,
           )}
          </p>

          <p className="mt-0.5 text-xs text-[var(--muted)]">
           {
            selectedBooking.time
           }
          </p>
         </div>
        </div>

        <div className="rounded-xl bg-[var(--canvas)] p-3">
         <p className="text-xs text-[var(--muted)]">
          Status
         </p>

         <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          {getStatusLabel(
           selectedBooking.status,
          )}
         </p>
        </div>

        <div className="rounded-xl bg-[var(--canvas)] p-3">
         <p className="text-xs text-[var(--muted)]">
          Consultation
         </p>

         <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
          {selectedBooking.consultationType ===
          "online"
           ? "Online"
           : "In-person"}
         </p>
        </div>
       </div>

       {selectedBooking.status ===
        "confirmed" ||
       selectedBooking.status ===
        "upcoming" ||
       selectedBooking.status ===
        "declined" ? (
        <div className="mt-5 border-t border-[var(--line)] pt-5">
         {!isRescheduling ? (
          <Button
           size="sm"
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
           Reschedule
          </Button>
         ) : (
          <>
           <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
             Select a new slot
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
             Only future available
             slots are shown.
            </p>
           </div>

           {availableSlots.length ===
           0 ? (
            <EmptyState
             title="No available slots"
             description="There are no future available slots for this doctor."
            />
           ) : (
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
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
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
               >
                <p className="text-sm font-semibold text-[var(--ink)]">
                 {
                  slot.time
                 }
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                 {formatDate(
                  slot.date,
                 )}{" "}
                 ·{" "}
                 {
                  slot.period
                 }
                </p>
               </button>
              ),
             )}
            </div>
           )}

           <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={() =>
             setIsRescheduling(
              false,
             )
            }
           >
            Cancel
           </Button>
          </>
         )}
        </div>
       ) : null}

       <Link
        href={`/appointments/${selectedBooking.id}`}
        className="mt-3 block"
       >
        <Button
         size="sm"
         variant="outline"
         className="w-full"
        >
         View details
        </Button>
       </Link>

       {error && (
        <p className="mt-3 rounded-lg bg-[var(--urgent-soft)] px-3 py-2 text-xs font-medium text-[var(--urgent-deep)]">
         {error}
        </p>
       )}

       {success && (
        <p className="mt-3 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-xs font-medium text-[var(--success)]">
         {success}
        </p>
       )}
      </>
     ) : (
      <div>
       <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-deep)]">
        Appointment details
       </p>

       <h2 className="mt-1 text-lg font-semibold text-[var(--ink)]">
        Select an appointment
       </h2>

       <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Select an appointment from
        the calendar to view its
        details or reschedule it.
       </p>
      </div>
     )}
    </aside>
   </div>
  </div>
 );
}