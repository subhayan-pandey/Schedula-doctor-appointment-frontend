"use client";

import { useMemo, useState } from "react";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/toast";

import DoctorVerificationDetailModal from "@/features/admin-doctor-verification/components/DoctorVerificationDetailModal";
import RejectDoctorDialog from "@/features/admin-doctor-verification/components/RejectDoctorDialog";

import {
  getAllDoctorsForAdmin,
  getVerificationLabel,
  getVerificationTone,
  type AdminDoctorView,
} from "@/lib/admin/admin-doctors";

import { setDoctorVerificationStatus } from "@/lib/doctors-store";
import { logAdminAction } from "@/lib/admin/audit-log-store";

import { useAdminAuth } from "@/context/AdminAuthContext";

import type { DoctorVerificationStatus } from "@/types/doctor";

const PAGE_SIZE = 8;

type VerificationFilter = "all" | DoctorVerificationStatus;

type ConfirmAction = {
  doctor: AdminDoctorView;
  action: "approve" | "resubmit";
};

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function DoctorVerificationList() {
  const { adminUser } = useAdminAuth();

  // Same reasoning as AdminDoctorsList/AdminDashboard: synchronous
  // local data, this component only ever mounts client-side, so a
  // lazy initializer is safe and avoids a fetch-in-effect.
  const [doctors, setDoctors] = useState<AdminDoctorView[]>(() =>
    getAllDoctorsForAdmin(),
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationFilter>(
    "pending",
  );
  const [page, setPage] = useState(1);

  const [selectedDoctor, setSelectedDoctor] =
    useState<AdminDoctorView | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminDoctorView | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  function refresh(): void {
    setDoctors(getAllDoctorsForAdmin());
  }

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      if (statusFilter !== "all" && doctor.verificationStatus !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${doctor.name} ${doctor.clinic} ${doctor.location}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [doctors, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleFiltersChange(): void {
    setPage(1);
  }

  function handleRequestApprove(doctor: AdminDoctorView): void {
    setSelectedDoctor(null);
    setConfirmAction({ doctor, action: "approve" });
  }

  function handleRequestReject(doctor: AdminDoctorView): void {
    setSelectedDoctor(null);
    setRejectTarget(doctor);
  }

  function handleRequestResubmit(doctor: AdminDoctorView): void {
    setSelectedDoctor(null);
    setConfirmAction({ doctor, action: "resubmit" });
  }

  function logVerificationChange(
    doctor: AdminDoctorView,
    status: DoctorVerificationStatus,
    reason?: string,
  ): void {
    if (!adminUser) {
      return;
    }

    logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: status === "approved" ? "approve" : status === "rejected" ? "reject" : "update",
      entityType: "doctor",
      entityId: doctor.id,
      entityLabel: doctor.name,
      description:
        status === "approved"
          ? `${adminUser.name} approved Dr. ${doctor.name}'s verification`
          : status === "rejected"
            ? `${adminUser.name} rejected Dr. ${doctor.name}'s verification`
            : `${adminUser.name} reset Dr. ${doctor.name} to pending verification`,
      details: reason ? { reason } : undefined,
    });
  }

  async function handleConfirmAction(): Promise<void> {
    if (!confirmAction) {
      return;
    }

    const { doctor, action } = confirmAction;
    const nextStatus: DoctorVerificationStatus =
      action === "approve" ? "approved" : "pending";

    const updated = setDoctorVerificationStatus(doctor.id, nextStatus);

    if (!updated) {
      adminToast.error("Could not update this doctor. Please try again.");
      setConfirmAction(null);
      return;
    }

    logVerificationChange(doctor, nextStatus);

    adminToast.success(
      action === "approve"
        ? `${doctor.name} is now verified.`
        : `${doctor.name} was reset to pending.`,
    );

    setConfirmAction(null);
    refresh();
  }

  async function handleConfirmReject(reason: string): Promise<void> {
    if (!rejectTarget) {
      return;
    }

    const updated = setDoctorVerificationStatus(
      rejectTarget.id,
      "rejected",
      reason,
    );

    if (!updated) {
      adminToast.error("Could not update this doctor. Please try again.");
      setRejectTarget(null);
      return;
    }

    logVerificationChange(rejectTarget, "rejected", reason);

    adminToast.success(`${rejectTarget.name}'s verification was rejected.`);

    setRejectTarget(null);
    refresh();
  }

  const columns: TableColumn<AdminDoctorView>[] = [
    {
      key: "doctor",
      header: "Doctor",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand-deep)]">
            {row.avatarInitials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">
              {row.specialty}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "clinic",
      header: "Clinic",
      render: (row) => (
        <div>
          <p className="truncate">{row.clinic}</p>
          <p className="truncate text-xs text-[var(--muted)]">
            {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "documents",
      header: "Documents",
      render: (row) => (
        <span className="text-xs text-[var(--muted)]">
          {row.verificationDocuments?.length ?? 0} file
          {row.verificationDocuments?.length === 1 ? "" : "s"}
        </span>
      ),
    },
    {
      key: "verification",
      header: "Status",
      render: (row) => (
        <StatusBadge
          label={getVerificationLabel(row.verificationStatus)}
          tone={getVerificationTone(row.verificationStatus)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-48",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setSelectedDoctor(row)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
          >
            View
          </button>

          {row.verificationStatus === "pending" && (
            <>
              <button
                type="button"
                onClick={() => handleRequestReject(row)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--urgent-deep)] transition-colors hover:bg-[var(--urgent-soft)]"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleRequestApprove(row)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--success)] transition-colors hover:bg-[var(--success-soft)]"
              >
                Approve
              </button>
            </>
          )}

          {row.verificationStatus === "rejected" && (
            <button
              type="button"
              onClick={() => handleRequestResubmit(row)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
            >
              Resubmit
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">
          Doctor Verification
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {doctors.filter((doctor) => doctor.verificationStatus === "pending").length}{" "}
          pending review
        </p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by name, clinic, or location…"
        hasActiveFilters={statusFilter !== "pending"}
        onClearFilters={() => {
          setStatusFilter("pending");
          handleFiltersChange();
        }}
      >
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as VerificationFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by verification status"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedDoctors}
        keyExtractor={(row) => row.id}
        emptyTitle="No doctors match these filters"
        emptyDescription="Try a different status or clear your search."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredDoctors.length}
        pageSize={PAGE_SIZE}
      />

      <DoctorVerificationDetailModal
        doctor={selectedDoctor}
        open={selectedDoctor !== null}
        onClose={() => setSelectedDoctor(null)}
        onRequestApprove={handleRequestApprove}
        onRequestReject={handleRequestReject}
        onRequestResubmit={handleRequestResubmit}
      />

      <RejectDoctorDialog
        open={rejectTarget !== null}
        doctorName={rejectTarget?.name ?? ""}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction
            ? confirmAction.action === "approve"
              ? `Approve ${confirmAction.doctor.name}?`
              : `Reset ${confirmAction.doctor.name} to pending?`
            : ""
        }
        description={
          confirmAction?.action === "approve"
            ? "This doctor will be shown as verified."
            : "This simulates the doctor resubmitting for review — their status moves back to pending."
        }
        confirmLabel={confirmAction?.action === "approve" ? "Approve" : "Reset to pending"}
        tone="neutral"
      />
    </div>
  );
}
