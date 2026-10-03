"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";

import Pagination from "@/components/admin/ui/Pagination";
import SearchFilter from "@/components/admin/ui/SearchFilter";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/admin/ui/Table";

import AuditLogDetailModal from "@/features/admin-audit-logs/components/AuditLogDetailModal";

import { getAuditLogs } from "@/lib/admin/audit-log-store";
import {
  AUDIT_ACTIONS,
  AUDIT_LOG_UPDATED_EVENT,
  DEFAULT_AUDIT_FILTERS,
  filterAuditLogs,
  formatAuditDateTime,
  getAuditActionLabel,
  getAuditActionTone,
  getEntityTypeLabel,
  hasActiveAuditFilters,
  type AuditLogViewFilters,
} from "@/lib/admin/audit-logs";

import type { AuditLogEntry } from "@/types/admin/audit-log";

const PAGE_SIZE = 10;

const selectClassName =
  "h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--brand)]/40 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

function readLogs(): AuditLogEntry[] {
  return getAuditLogs();
}

export default function AdminAuditLogs() {
  // Lazy initializer, same reasoning as every other admin list: this only
  // ever mounts client-side, past AdminAuthGuard.
  const [entries, setEntries] = useState<AuditLogEntry[]>(readLogs);
  const [filters, setFilters] = useState<AuditLogViewFilters>(
    DEFAULT_AUDIT_FILTERS,
  );
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  // Pick up actions logged while this page is open (e.g. another tab's
  // dispatch of the same event, or an export finishing).
  useEffect(() => {
    function handleUpdated() {
      setEntries(readLogs());
    }

    window.addEventListener(AUDIT_LOG_UPDATED_EVENT, handleUpdated);

    return () =>
      window.removeEventListener(AUDIT_LOG_UPDATED_EVENT, handleUpdated);
  }, []);

  const adminOptions = useMemo(() => {
    const byId = new Map<string, string>();

    entries.forEach((entry) => {
      if (!byId.has(entry.adminId)) {
        byId.set(entry.adminId, entry.adminName);
      }
    });

    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [entries]);

  const entityTypeOptions = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.entityType))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [entries],
  );

  const filtered = useMemo(
    () => filterAuditLogs(entries, filters),
    [entries, filters],
  );

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateFilters(patch: Partial<AuditLogViewFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: "when",
      header: "Date & time",
      render: (row) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {formatAuditDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "admin",
      header: "Admin",
      render: (row) => (
        <span className="font-medium text-[var(--ink)]">{row.adminName}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <StatusBadge
          label={getAuditActionLabel(row.action)}
          tone={getAuditActionTone(row.action)}
          withDot
        />
      ),
    },
    {
      key: "entity",
      header: "Affected entity",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--ink)]">
            {row.entityLabel || row.entityId}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {getEntityTypeLabel(row.entityType)}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "max-w-xs",
      render: (row) => (
        <span className="line-clamp-2 text-[var(--muted)]">
          {row.description}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelected(row)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            A record of important admin actions across the portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-[var(--muted)]">
            {filtered.length} of {entries.length} entr
            {entries.length === 1 ? "y" : "ies"}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEntries(readLogs())}
          >
            Refresh
          </Button>
        </div>
      </div>

      <SearchFilter
        searchValue={filters.search}
        onSearchChange={(value) => updateFilters({ search: value })}
        searchPlaceholder="Search by admin, entity or description…"
        searchLabel="Search audit logs"
        hasActiveFilters={hasActiveAuditFilters(filters)}
        onClearFilters={() => {
          setFilters(DEFAULT_AUDIT_FILTERS);
          setPage(1);
        }}
      >
        <select
          value={filters.action}
          onChange={(event) => updateFilters({ action: event.target.value })}
          className={selectClassName}
          aria-label="Filter by action"
        >
          <option value="all">All actions</option>
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {getAuditActionLabel(action)}
            </option>
          ))}
        </select>

        <select
          value={filters.adminId}
          onChange={(event) => updateFilters({ adminId: event.target.value })}
          className={selectClassName}
          aria-label="Filter by admin"
        >
          <option value="all">All admins</option>
          {adminOptions.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
            </option>
          ))}
        </select>

        <select
          value={filters.entityType}
          onChange={(event) =>
            updateFilters({ entityType: event.target.value })
          }
          className={selectClassName}
          aria-label="Filter by entity type"
        >
          <option value="all">All entities</option>
          {entityTypeOptions.map((type) => (
            <option key={type} value={type}>
              {getEntityTypeLabel(type)}
            </option>
          ))}
        </select>

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
      </SearchFilter>

      <Table
        columns={columns}
        rows={pageRows}
        keyExtractor={(row) => row.id}
        onRowClick={setSelected}
        emptyTitle={
          entries.length === 0
            ? "No activity logged yet"
            : "No log entries match these filters"
        }
        emptyDescription={
          entries.length === 0
            ? "Admin actions such as approvals, status changes and exports will appear here."
            : "Try adjusting your search or filters."
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />

      <AuditLogDetailModal
        entry={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
