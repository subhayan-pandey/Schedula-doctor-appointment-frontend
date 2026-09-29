"use client";

import { useMemo, useState } from "react";

import SearchFilter from "@/components/admin/ui/SearchFilter";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { adminToast } from "@/components/admin/ui/toast";

import ReviewDetailModal from "@/features/admin-reviews/components/ReviewDetailModal";

import {
  getAllReviewsForAdmin,
  setReviewHidden,
  setReviewReported,
  type AdminReviewView,
} from "@/lib/admin/admin-reviews";
import { getAllDoctors } from "@/lib/doctors-store";
import { logAdminAction } from "@/lib/admin/audit-log-store";

import { useAdminAuth } from "@/context/AdminAuthContext";

import type { Doctor } from "@/types/doctor";

const PAGE_SIZE = 8;

type VisibilityFilter = "all" | "reported" | "hidden";

type ConfirmAction = {
  review: AdminReviewView;
  kind: "report" | "unreport" | "hide" | "unhide";
};

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

export default function AdminReviewsList() {
  const { adminUser } = useAdminAuth();

  // Lazy initializer, same reasoning as every other admin list: this
  // component only ever mounts client-side, past AdminAuthGuard.
  const [reviews, setReviews] = useState<AdminReviewView[]>(() =>
    getAllReviewsForAdmin(),
  );
  const [doctors] = useState<Doctor[]>(() => getAllDoctors());

  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [page, setPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState<AdminReviewView | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  function refresh(): void {
    setReviews(getAllReviewsForAdmin());
  }

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (doctorFilter !== "all" && review.doctorId !== doctorFilter) {
        return false;
      }

      if (ratingFilter !== "all" && String(review.rating) !== ratingFilter) {
        return false;
      }

      if (dateFilter && !review.createdAt.startsWith(dateFilter)) {
        return false;
      }

      if (visibilityFilter === "reported" && !review.reported) {
        return false;
      }

      if (visibilityFilter === "hidden" && !review.hidden) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${review.doctorName} ${review.patientName} ${review.comment}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [reviews, search, doctorFilter, ratingFilter, dateFilter, visibilityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    doctorFilter !== "all" ||
    ratingFilter !== "all" ||
    dateFilter !== "" ||
    visibilityFilter !== "all";

  function handleFiltersChange(): void {
    setPage(1);
  }

  function handleRequestToggleReported(review: AdminReviewView): void {
    setSelectedReview(null);
    setConfirmAction({
      review,
      kind: review.reported ? "unreport" : "report",
    });
  }

  function handleRequestToggleHidden(review: AdminReviewView): void {
    setSelectedReview(null);
    setConfirmAction({ review, kind: review.hidden ? "unhide" : "hide" });
  }

  function handleConfirm(): void {
    if (!confirmAction || !adminUser) {
      return;
    }

    const { review, kind } = confirmAction;

    const updated =
      kind === "report" || kind === "unreport"
        ? setReviewReported(review.id, kind === "report")
        : setReviewHidden(review.id, kind === "hide");

    if (!updated) {
      adminToast.error("Could not update this review. Please try again.");
      setConfirmAction(null);
      return;
    }

    logAdminAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: "update",
      entityType: "review",
      entityId: review.id,
      entityLabel: `${review.doctorName} review by ${review.patientName}`,
      description: `${adminUser.name} ${kind === "report" ? "marked a review as reported" : kind === "unreport" ? "cleared a review's report" : kind === "hide" ? "hid a review" : "unhid a review"}`,
    });

    adminToast.success(
      kind === "report"
        ? "Marked as reported."
        : kind === "unreport"
          ? "Report cleared."
          : kind === "hide"
            ? "Review hidden."
            : "Review unhidden.",
    );

    setConfirmAction(null);
    refresh();
  }

  const confirmCopy: Record<
    ConfirmAction["kind"],
    { title: string; description: string; confirmLabel: string }
  > = {
    report: {
      title: "Mark this review as reported?",
      description: "It will show up under the Reported filter for follow-up.",
      confirmLabel: "Mark as reported",
    },
    unreport: {
      title: "Clear this review's report?",
      description: "It will no longer show up under the Reported filter.",
      confirmLabel: "Clear report",
    },
    hide: {
      title: "Hide this review?",
      description: "It stays on file but is marked hidden. You can unhide it any time.",
      confirmLabel: "Hide review",
    },
    unhide: {
      title: "Unhide this review?",
      description: "It will no longer be marked hidden.",
      confirmLabel: "Unhide review",
    },
  };

  const columns: TableColumn<AdminReviewView>[] = [
    {
      key: "doctor",
      header: "Doctor",
      render: (row) => row.doctorName,
    },
    {
      key: "patient",
      header: "Patient",
      render: (row) => row.patientName,
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => `★ ${row.rating}`,
    },
    {
      key: "comment",
      header: "Comment",
      render: (row) => (
        <span className="line-clamp-1 max-w-xs text-[var(--muted)]">
          {row.comment || "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "flags",
      header: "Flags",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {row.reported && <StatusBadge label="Reported" tone="warning" />}
          {row.hidden && <StatusBadge label="Hidden" tone="neutral" />}
          {!row.reported && !row.hidden && (
            <span className="text-xs text-[var(--muted)]">—</span>
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
            onClick={() => setSelectedReview(row)}
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
        <h1 className="text-xl font-semibold text-[var(--ink)]">Reviews</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {reviews.length} total ·{" "}
          {reviews.filter((review) => review.reported).length} reported
        </p>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          handleFiltersChange();
        }}
        searchPlaceholder="Search by doctor, patient, or comment…"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setDoctorFilter("all");
          setRatingFilter("all");
          setDateFilter("");
          setVisibilityFilter("all");
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

        <select
          value={ratingFilter}
          onChange={(event) => {
            setRatingFilter(event.target.value);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by rating"
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} star{rating === 1 ? "" : "s"}
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
          value={visibilityFilter}
          onChange={(event) => {
            setVisibilityFilter(event.target.value as VisibilityFilter);
            handleFiltersChange();
          }}
          className={selectClassName}
          aria-label="Filter by report/hidden status"
        >
          <option value="all">All reviews</option>
          <option value="reported">Reported only</option>
          <option value="hidden">Hidden only</option>
        </select>
      </SearchFilter>

      <Table
        columns={columns}
        rows={paginatedReviews}
        keyExtractor={(row) => row.id}
        emptyTitle="No reviews match these filters"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredReviews.length}
        pageSize={PAGE_SIZE}
      />

      <ReviewDetailModal
        review={selectedReview}
        open={selectedReview !== null}
        onClose={() => setSelectedReview(null)}
        onRequestToggleReported={handleRequestToggleReported}
        onRequestToggleHidden={handleRequestToggleHidden}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction ? confirmCopy[confirmAction.kind].title : ""}
        description={confirmAction ? confirmCopy[confirmAction.kind].description : ""}
        confirmLabel={confirmAction ? confirmCopy[confirmAction.kind].confirmLabel : "Confirm"}
        tone={confirmAction?.kind === "hide" ? "danger" : "neutral"}
      />
    </div>
  );
}
