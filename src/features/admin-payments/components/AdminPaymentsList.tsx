"use client";

import { useMemo, useState } from "react";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";

import PaymentDetailModal from "@/features/admin-payments/components/PaymentDetailModal";

import { getPaymentHistory } from "@/lib/payment-store";
import { getAllBookings } from "@/lib/bookings-store";
import { getAllDoctors } from "@/lib/doctors-store";
import { formatInr } from "@/lib/payments";
import {
  getPaymentDisplayStatus,
  getPaymentStatusTone,
} from "@/lib/admin/admin-payments";

import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";
import type { PaymentRecord } from "@/types/payment";

const PAGE_SIZE = 8;

type StatusFilter = "all" | "paid" | "failed" | "refund-processing" | "refunded";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refund-processing", label: "Refund processing" },
  { value: "refunded", label: "Refunded" },
];

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminPaymentsList() {
  // Lazy initializers, same reasoning as every other admin list: this
  // component only ever mounts client-side, past AdminAuthGuard.
  const [records] = useState<PaymentRecord[]>(() => getPaymentHistory());
  const [bookings] = useState<Booking[]>(() => getAllBookings());
  const [doctors] = useState<Doctor[]>(() => getAllDoctors());

  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(
    null,
  );

  function bookingFor(record: PaymentRecord): Booking | null {
    if (!record.bookingId) {
      return null;
    }

    return bookings.find((booking) => booking.id === record.bookingId) ?? null;
  }

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return records.filter((record) => {
      if (doctorFilter !== "all" && record.doctorId !== doctorFilter) {
        return false;
      }

      if (dateFilter && !record.createdAt.startsWith(dateFilter)) {
        return false;
      }

      if (statusFilter !== "all" && record.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${record.patientName} ${record.doctorName}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [records, search, doctorFilter, dateFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    doctorFilter !== "all" || dateFilter !== "" || statusFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  const columns: TableColumn<PaymentRecord>[] = [
    {
      key: "patient",
      header: "Patient",
      render: (row) => row.patientName,
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (row) => row.doctorName,
    },
    {
      key: "when",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatInr(row.amountInr),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => row.method.toUpperCase(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          label={getPaymentDisplayStatus(row, bookingFor(row) ?? undefined)}
          tone={getPaymentStatusTone(row, bookingFor(row) ?? undefined)}
        />
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
            onClick={() => setSelectedRecord(row)}
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
        <h1 className="text-xl font-semibold text-[var(--ink)]">Payments</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {records.length} total
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
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedRecords}
        keyExtractor={(row) => row.id}
        emptyTitle="No payments match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredRecords.length}
        pageSize={PAGE_SIZE}
      />

      <PaymentDetailModal
        record={selectedRecord}
        booking={selectedRecord ? bookingFor(selectedRecord) : null}
        open={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
