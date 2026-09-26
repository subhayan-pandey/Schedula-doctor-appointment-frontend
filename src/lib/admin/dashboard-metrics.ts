import { getAllBookings } from "@/lib/bookings-store";
import { getAllDoctors, getDoctorById } from "@/lib/doctors-store";

import { getAllPatientAccounts } from "@/lib/admin/admin-patients-store";
import { normalizeDoctorForAdmin } from "@/lib/admin/admin-doctors";

import type { Booking, BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/doctor";

export type TrendPoint = {
  date: string;
  count: number;
};

export type RecentAppointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: BookingStatus;
};

export type DashboardMetrics = {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingVerifications: number;
  appointmentTrend: TrendPoint[];
  recentAppointments: RecentAppointment[];
  recentDoctors: Doctor[];
};

function buildAppointmentTrend(bookings: Booking[]): TrendPoint[] {
  const counts = new Map<string, number>();

  bookings.forEach((booking) => {
    counts.set(booking.date, (counts.get(booking.date) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort(([dateA], [dateB]) => (dateA < dateB ? -1 : dateA > dateB ? 1 : 0))
    .slice(-10)
    .map(([date, count]) => ({ date, count }));
}

function buildRecentAppointments(bookings: Booking[]): RecentAppointment[] {
  return [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      patientName: booking.patientName,
      doctorName: getDoctorById(booking.doctorId)?.name ?? "Unknown doctor",
      date: booking.date,
      time: booking.time,
      status: booking.status,
    }));
}

/**
 * Doctor has no createdAt field, so "recent" doctors is an approximation:
 * the tail of getAllDoctors(), which reflects insertion order (seeded
 * doctors first, anything added via addDoctor() appended after).
 */
function buildRecentDoctors(doctors: Doctor[]): Doctor[] {
  return [...doctors].slice(-5).reverse();
}

export function getDashboardMetrics(): DashboardMetrics {
  const doctors = getAllDoctors();
  const bookings = getAllBookings();
  const patients = getAllPatientAccounts();

  const pendingVerifications = doctors.filter(
    (doctor) => normalizeDoctorForAdmin(doctor).verificationStatus === "pending",
  ).length;

  return {
    totalDoctors: doctors.length,
    totalPatients: patients.length,
    totalAppointments: bookings.length,
    upcomingAppointments: bookings.filter(
      (booking) =>
        booking.status === "upcoming" || booking.status === "confirmed",
    ).length,
    completedAppointments: bookings.filter(
      (booking) => booking.status === "completed",
    ).length,
    pendingVerifications,
    appointmentTrend: buildAppointmentTrend(bookings),
    recentAppointments: buildRecentAppointments(bookings),
    recentDoctors: buildRecentDoctors(doctors),
  };
}
