"use client";

import { useMemo, useState } from "react";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";

import AppointmentDetailModal from "@/features/admin-appointments/components/AppointmentDetailModal";

import { getAllBookings } from "@/lib/bookings-store";
import { getAllDoctors, getDoctorById } from "@/lib/doctors-store";
import {
  getBookingStatusLabel,
  getBookingStatusTone,
  isBookingRescheduled,
} from "@/lib/booking-status";

import type { Booking, BookingStatus } from "@/types/booking";
import type { Doctor } from "@/types/doctor";

const PAGE_SIZE = 8;

const REAL_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "upcoming",
  "completed",
  "cancelled",
  "declined",
  "missed",
];

type StatusFilter = "all" | BookingStatus | "rescheduled";
type TypeFilter = "all" | "online" | "in-person";

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminAppointmentsList() {
  // Lazy initializers, same reasoning as AdminDoctorsList/AdminPatientsList:
  // synchronous local data, mounts client-side only past AdminAuthGuard.
  const [bookings] = useState<Booking[]>(() => getAllBookings());
  const [doctors] = useState<Doctor[]>(() => getAllDoctors());

  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null,
  );

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (doctorFilter !== "all" && booking.doctorId !== doctorFilter) {
        return false;
      }

      if (dateFilter && booking.date !== dateFilter) {
        return false;
      }

      if (statusFilter === "rescheduled") {
        if (!isBookingRescheduled(booking)) {
          return false;
        }
      } else if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== "all" && booking.consultationType !== typeFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const doctorName = getDoctorById(booking.doctorId)?.name ?? "";
      const haystack = `${booking.patientName} ${doctorName}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [bookings, search, doctorFilter, dateFilter, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    doctorFilter !== "all" ||
    dateFilter !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  const columns: TableColumn<Booking>[] = [
    {
      key: "patient",
      header: "Patient",
      render: (row) => row.patientName,
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (row) => getDoctorById(row.doctorId)?.name ?? "Unknown doctor",
    },
    {
      key: "when",
      header: "Date & time",
      render: (row) => `${row.date} · ${row.time}`,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <StatusBadge
          label={row.consultationType === "online" ? "Online" : "In-person"}
          tone="neutral"
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge
            label={getBookingStatusLabel(row.status)}
            tone={getBookingStatusTone(row.status)}
          />
          {isBookingRescheduled(row) && (
            <StatusBadge label="Rescheduled" tone="warning" />
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-24",
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedBooking(row)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {bookings.length} total
        </p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by patient or doctor…"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setDoctorFilter("all");
          setDateFilter("");
          setStatusFilter("all");
          setTypeFilter("all");
          handleFiltersChange();
        }}
      >
        <select
          value={doctorFilter}
          onChange={(event) => {
            setDoctorFilter(event.target.value);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by doctor"
        >
          <option value="all">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(event) => {
            setDateFilter(event.target.value);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by date"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {REAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getBookingStatusLabel(status)}
            </option>
          ))}
          <option value="rescheduled">Rescheduled</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value as TypeFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by consultation type"
        >
          <option value="all">Online &amp; in-person</option>
          <option value="online">Online</option>
          <option value="in-person">In-person</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedBookings}
        keyExtractor={(row) => row.id}
        emptyTitle="No appointments match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredBookings.length}
        pageSize={PAGE_SIZE}
      />

      <AppointmentDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
