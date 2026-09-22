import type { Metadata } from "next";
import { Suspense } from "react";

import DoctorCalendar from "@/features/doctor-calender/components/DoctorCalender";

export const metadata: Metadata = {
  title: "Calendar | Schedula",
};

function DoctorCalendarFallback() {
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

export default function DoctorCalendarPage() {
  return (
    <Suspense
      fallback={
        <DoctorCalendarFallback />
      }
    >
      <DoctorCalendar />
    </Suspense>
  );
}