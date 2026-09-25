"use client";

import { useEffect, useState } from "react";

import LoadingState from "@/components/admin/ui/LoadingState";

import StatCard from "@/components/admin/dashboard/StatCard";
import AppointmentTrendChart from "@/components/admin/dashboard/AppointmentTrendChart";
import RecentAppointmentsList from "@/components/admin/dashboard/RecentAppointmentsList";
import RecentDoctorsList from "@/components/admin/dashboard/RecentDoctorsList";

import {
  getDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/admin/dashboard-metrics";

import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    setMetrics(getDashboardMetrics());
  }, []);

  if (!metrics) {
    return <LoadingState message="Loading dashboard…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Welcome back{adminUser ? `, ${adminUser.name}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Here&apos;s what&apos;s happening across Schedula right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Doctors"
          value={metrics.totalDoctors}
          iconKey="doctors"
        />
        <StatCard
          label="Total Patients"
          value={metrics.totalPatients}
          iconKey="patients"
        />
        <StatCard
          label="Total Appointments"
          value={metrics.totalAppointments}
          iconKey="appointments"
        />
        <StatCard
          label="Upcoming"
          value={metrics.upcomingAppointments}
          iconKey="appointments"
        />
        <StatCard
          label="Completed"
          value={metrics.completedAppointments}
          iconKey="appointments"
        />
        <StatCard
          label="Pending Verifications"
          value="—"
          iconKey="doctor-verification"
          caption="Arrives with Phase 2B"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Appointment trend
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Appointments grouped by date, most recent first.
          </p>

          <div className="mt-5">
            <AppointmentTrendChart data={metrics.appointmentTrend} />
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Recent doctors
          </h2>

          <div className="mt-4">
            <RecentDoctorsList doctors={metrics.recentDoctors} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--ink)]">
          Recent appointments
        </h2>

        <div className="mt-4">
          <RecentAppointmentsList appointments={metrics.recentAppointments} />
        </div>
      </section>
    </div>
  );
}
