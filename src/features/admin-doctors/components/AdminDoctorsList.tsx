"use client";

import { useMemo, useState } from "react";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/toast";

import DoctorDetailModal from "@/features/admin-doctors/components/DoctorDetailModal";

import {
  getAllDoctorsForAdmin,
  getVerificationLabel,
  getVerificationTone,
  type AdminDoctorView,
} from "@/lib/admin/admin-doctors";

import { setDoctorActiveStatus } from "@/lib/doctors-store";
import { logAdminAction } from "@/lib/admin/audit-log-store";

import { useAdminAuth } from "@/context/AdminAuthContext";

import {
  SPECIALTIES,
  type Specialty,
  type DoctorVerificationStatus,
} from "@/types/doctor";

const PAGE_SIZE = 8;

type StatusFilter = "all" | "active" | "inactive";
type VerificationFilter = "all" | DoctorVerificationStatus;

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminDoctorsList() {
  const { adminUser } = useAdminAuth();

  // Lazy initializer: getAllDoctorsForAdmin() is a synchronous, local
  // read (Redux state / localStorage), and this component only ever
  // mounts client-side (nested under AdminAuthGuard, which renders
  // LoadingState instead of this tree until the admin session check
  // finishes), so there's no SSR/hydration concern here. That means
  // the data can be read directly into the initial state instead of
  // fetched in a useEffect after mount.
  const [doctors, setDoctors] = useState<AdminDoctorView[]>(() =>
    getAllDoctorsForAdmin(),
  );

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("all");
  const [page, setPage] = useState(1);

  const [selectedDoctor, setSelectedDoctor] =
    useState<AdminDoctorView | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AdminDoctorView | null>(null);

  function refresh(): void {
    setDoctors(getAllDoctorsForAdmin());
  }

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      if (specialtyFilter !== "all" && doctor.specialty !== specialtyFilter) {
        return false;
      }

      if (statusFilter === "active" && !doctor.isActive) {
        return false;
      }

      if (statusFilter === "inactive" && doctor.isActive) {
        return false;
      }

      if (
        verificationFilter !== "all" &&
        doctor.verificationStatus !== verificationFilter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${doctor.name} ${doctor.clinic} ${doctor.location}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [doctors, search, specialtyFilter, statusFilter, verificationFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    specialtyFilter !== "all" ||
    statusFilter !== "all" ||
    verificationFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  function handleToggleActive(doctor: AdminDoctorView): void {
    setSelectedDoctor(null);
    setConfirmTarget(doctor);
  }

  function handleConfirmToggle(): void {
    if (!confirmTarget || !adminUser) {
      return;
    }

    const nextIsActive = !confirmTarget.isActive;

    const updated = setDoctorActiveStatus(confirmTarget.id, nextIsActive);

    if (!updated) {
      adminToast.error("Could not update this doctor. Please try again.");
      setConfirmTarget(null);
      return;
    }

    logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: nextIsActive ? "activate" : "deactivate",
      entityType: "doctor",
      entityId: confirmTarget.id,
      entityLabel: confirmTarget.name,
      description: `${adminUser.name} ${
        nextIsActive ? "activated" : "deactivated"
      } Dr. ${confirmTarget.name}`,
    });

    adminToast.success(
      `${confirmTarget.name} is now ${nextIsActive ? "active" : "inactive"}.`,
    );

    setConfirmTarget(null);
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
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          label={row.isActive ? "Active" : "Inactive"}
          tone={row.isActive ? "success" : "neutral"}
          withDot
        />
      ),
    },
    {
      key: "verification",
      header: "Verification",
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
      headerClassName: "w-40",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setSelectedDoctor(row)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
          >
            View
          </button>

          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              row.isActive
                ? "text-[var(--urgent-deep)] hover:bg-[var(--urgent-soft)]"
                : "text-[var(--success)] hover:bg-[var(--success-soft)]"
            }`}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink)]">Doctors</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {doctors.length} total
        </p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by name, clinic, or location…"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSpecialtyFilter("all");
          setStatusFilter("all");
          setVerificationFilter("all");
          handleFiltersChange();
        }}
      >
        <select
          value={specialtyFilter}
          onChange={(event) => {
            setSpecialtyFilter(event.target.value as Specialty | "all");
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by specialty"
        >
          <option value="all">All specialties</option>
          {SPECIALTIES.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as StatusFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by active status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={verificationFilter}
          onChange={(event) => {
            setVerificationFilter(event.target.value as VerificationFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by verification status"
        >
          <option value="all">All verification</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedDoctors}
        keyExtractor={(row) => row.id}
        emptyTitle="No doctors match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredDoctors.length}
        pageSize={PAGE_SIZE}
      />

      <DoctorDetailModal
        doctor={selectedDoctor}
        open={selectedDoctor !== null}
        onClose={() => setSelectedDoctor(null)}
        onRequestToggleActive={handleToggleActive}
      />

      <ConfirmDialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmToggle}
        title={
          confirmTarget
            ? `${confirmTarget.isActive ? "Deactivate" : "Activate"} ${confirmTarget.name}?`
            : ""
        }
        description={
          confirmTarget?.isActive
            ? "This doctor will no longer be bookable while inactive. You can reactivate them at any time."
            : "This doctor will become bookable again."
        }
        confirmLabel={confirmTarget?.isActive ? "Deactivate" : "Activate"}
        tone={confirmTarget?.isActive ? "danger" : "neutral"}
      />
    </div>
  );
}
