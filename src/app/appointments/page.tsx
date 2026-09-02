import type { Metadata } from "next";
import MyAppointments from "@/features/appointment/components/MyAppointment";

export const metadata: Metadata = {
  title: "My Appointments | Schedula",
};

export default function AppointmentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Appointments
      </h1>
      <p className="mt-1 text-[var(--muted)]">Track your upcoming and past visits.</p>

      <div className="mt-6">
        <MyAppointments />
      </div>
    </div>
  );
}