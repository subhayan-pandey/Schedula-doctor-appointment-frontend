"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";

import StatCard from "@/components/admin/dashboard/StatCard";
import Pagination from "@/components/admin/ui/Pagination";
import SearchFilter from "@/components/admin/ui/SearchFilter";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/admin/ui/Table";
import { adminToast } from "@/components/admin/ui/toast";

import { useAdminAuth } from "@/context/AdminAuthContext";

import { logAdminAction } from "@/lib/admin/audit-log-store";
import { hasAdminPermission } from "@/lib/admin/admin-permissions";
import {
  DEFAULT_REPORT_FILTERS,
  REPORT_KIND_OPTIONS,
  REPORT_STATUS_OPTIONS,
  REPORT_TYPE_LABELS,
  buildReport,
  hasActiveReportFilters,
} from "@/lib/admin/reports";
import {
  EXPORT_FORMAT_LABELS,
  downloadReport,
} from "@/lib/admin/export/download";

import type {
  ExportFormat,
  ReportFilters,
  ReportResult,
  ReportRow,
  ReportType,
} from "@/types/admin/reports";

const PAGE_SIZE = 10;

const EXPORT_FORMATS: ExportFormat[] = ["csv", "xlsx", "pdf"];

const REPORT_TYPES: ReportType[] = ["appointments", "payments"];

const TYPE_TAB_LABELS: Record<ReportType, string> = {
  appointments: "Appointments",
  payments: "Payments",
};

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

type BuildState =
  | { status: "ready"; result: ReportResult }
  | { status: "error"; message: string };

function formatCell(value: string | number, kind: string): string {
  if (typeof value === "number") {
    return kind === "currency"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(value)
      : new Intl.NumberFormat("en-IN").format(value);
  }

  return value;
}

export default function AdminReports() {
  const { adminUser } = useAdminAuth();
  const canExportReports = hasAdminPermission(adminUser, "reports", "view");

  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);
  const [page, setPage] = useState(1);
  // Bumped by "Refresh" to re-read the stores; the stores are read-only here.
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const build = useMemo<BuildState>(() => {
    // refreshKey is a deliberate re-run trigger.
    void refreshKey;

    try {
      return { status: "ready", result: buildReport(filters) };
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The report could not be generated.",
      };
    }
  }, [filters, refreshKey]);

  function updateFilters(patch: Partial<ReportFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function changeType(type: ReportType) {
    if (type === filters.type) {
      return;
    }

    // Type and status options differ per report, so reset them.
    setFilters((current) => ({
      ...current,
      type,
      kind: "all",
      status: "all",
    }));
    setPage(1);
  }

  function clearFilters() {
    setFilters((current) => ({
      ...DEFAULT_REPORT_FILTERS,
      type: current.type,
    }));
    setPage(1);
  }

  function handleExport(format: ExportFormat) {
    if (!canExportReports || build.status !== "ready" || build.result.rows.length === 0) {
      return;
    }

    const { result } = build;

    setExporting(format);

    try {
      // Re-run the build so the file reflects the stores at click time.
      const fresh = buildReport(filters);
      const filename = downloadReport(fresh, format);

      if (adminUser) {
        logAdminAction({
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: "export",
          entityType: "report",
          entityId: result.type,
          entityLabel: result.title,
          description: `${adminUser.name} exported the ${result.title.toLowerCase()} as ${EXPORT_FORMAT_LABELS[format]}`,
          details: {
            format,
            filename,
            records: fresh.rows.length,
            filters: fresh.filterLines,
          },
        });
      }

      adminToast.success(`${EXPORT_FORMAT_LABELS[format]} export downloaded.`);
    } catch {
      adminToast.error(
        `Could not create the ${EXPORT_FORMAT_LABELS[format]} file. Please try again.`,
      );
    } finally {
      setExporting(null);
    }
  }

  const header = (
    <div>
      <h1 className="text-xl font-semibold text-[var(--ink)]">Reports</h1>

      <p className="mt-1 text-sm text-[var(--muted)]">
        Filter appointment and payment data, review the summary, and export
        it as CSV, Excel or PDF.
      </p>
    </div>
  );

  if (build.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        {header}

        <Table<ReportRow>
          columns={[]}
          rows={[]}
          keyExtractor={(row) => row.id}
          status="error"
          errorTitle="Report unavailable"
          errorDescription={build.message}
          onRetry={() => setRefreshKey((key) => key + 1)}
        />
      </div>
    );
  }

  const { result } = build;

  const totalPages = Math.max(Math.ceil(result.rows.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageRows = result.rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const columns: TableColumn<ReportRow>[] = result.columns.map((column) => ({
    key: column.key,
    header: column.header,
    className: column.kind === "text" ? "" : "text-right tabular-nums",
    headerClassName: column.kind === "text" ? "" : "text-right",
    render: (row) => {
      const value = row.cells[column.key] ?? "";

      if (column.key === "status") {
        return (
          <StatusBadge
            label={String(value)}
            tone={row.statusTone ?? "neutral"}
            withDot
          />
        );
      }

      return (
        <span
          className={
            column.key === "id" ? "font-medium text-[var(--ink)]" : undefined
          }
        >
          {formatCell(value, column.kind)}
        </span>
      );
    },
  }));

  const kindLabel =
    filters.type === "appointments" ? "consultation type" : "payment method";
  const canExport = result.rows.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {header}

        <div
          className="inline-flex w-fit gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"
          role="group"
          aria-label="Report type"
        >
          {REPORT_TYPES.map((type) => {
            const isActive = type === filters.type;

            return (
              <button
                key={type}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeType(type)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
                }`}
              >
                {TYPE_TAB_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <SearchFilter
        searchValue={filters.search}
        onSearchChange={(value) => updateFilters({ search: value })}
        searchPlaceholder={
          filters.type === "appointments"
            ? "Search by booking ID, patient or doctor…"
            : "Search by payment ID, patient, doctor or reference…"
        }
        searchLabel="Search report"
        hasActiveFilters={hasActiveReportFilters(filters)}
        onClearFilters={clearFilters}
      >
        <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
          From
          <input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => updateFilters({ from: event.target.value })}
            className={selectClassName}
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
          To
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => updateFilters({ to: event.target.value })}
            className={selectClassName}
          />
        </label>

        <select
          value={filters.kind}
          onChange={(event) => updateFilters({ kind: event.target.value })}
          className={selectClassName}
          aria-label={`Filter by ${kindLabel}`}
        >
          {REPORT_KIND_OPTIONS[filters.type].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => updateFilters({ status: event.target.value })}
          className={selectClassName}
          aria-label="Filter by status"
        >
          {REPORT_STATUS_OPTIONS[filters.type].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SearchFilter>

      <section aria-label={`${REPORT_TYPE_LABELS[filters.type]} summary`}>
        <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">
          Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {result.summary.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.display}
            />
          ))}
        </div>
      </section>

      <section aria-label="Detailed data" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Detailed data
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">
              {result.rows.length} record{result.rows.length === 1 ? "" : "s"}
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--muted)]">
              Export all {result.rows.length} as
            </span>

            {EXPORT_FORMATS.map((format) => (
              <Button
                key={format}
                variant="outline"
                size="sm"
                disabled={!canExport || !canExportReports || exporting !== null}
                onClick={() => handleExport(format)}
                aria-label={`Export report as ${EXPORT_FORMAT_LABELS[format]}`}
                title={
                  canExport
                    ? undefined
                    : "There is no data to export for these filters."
                }
              >
                {exporting === format
                  ? "Preparing…"
                  : EXPORT_FORMAT_LABELS[format]}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Refresh
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          rows={pageRows}
          keyExtractor={(row) => row.id}
          emptyTitle="No records match these filters"
          emptyDescription="Try widening the date range or clearing filters."
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={result.rows.length}
          pageSize={PAGE_SIZE}
        />
      </section>
    </div>
  );
}
