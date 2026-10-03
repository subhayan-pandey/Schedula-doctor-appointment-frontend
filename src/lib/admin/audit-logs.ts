import type { StatusTone } from "@/components/admin/ui/StatusBadge";

import type { AuditLogAction, AuditLogEntry } from "@/types/admin/audit-log";

export const AUDIT_LOG_UPDATED_EVENT = "schedula:admin-audit-log-updated";

export const AUDIT_ACTIONS: AuditLogAction[] = [
  "create",
  "update",
  "delete",
  "activate",
  "deactivate",
  "approve",
  "reject",
  "send",
  "export",
  "login",
  "logout",
  "other",
];

const ACTION_LABELS: Record<AuditLogAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  activate: "Activated",
  deactivate: "Deactivated",
  approve: "Approved",
  reject: "Rejected",
  login: "Logged in",
  logout: "Logged out",
  send: "Sent",
  export: "Exported",
  other: "Other",
};

export function getAuditActionLabel(action: AuditLogAction): string {
  return ACTION_LABELS[action] ?? action;
}

export function getAuditActionTone(action: AuditLogAction): StatusTone {
  switch (action) {
    case "create":
    case "activate":
    case "approve":
    case "send":
      return "success";
    case "delete":
    case "deactivate":
    case "reject":
      return "danger";
    case "update":
    case "export":
      return "brand";
    default:
      return "neutral";
  }
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  doctor: "Doctor",
  patient: "Patient",
  review: "Review",
  notification: "Notification",
  report: "Report",
  "admin-session": "Admin session",
};

export function getEntityTypeLabel(entityType: string): string {
  if (ENTITY_TYPE_LABELS[entityType]) {
    return ENTITY_TYPE_LABELS[entityType];
  }

  const spaced = entityType.replace(/[-_]+/g, " ").trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatAuditDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** YYYY-MM-DD in the admin's local timezone (matches the date pickers). */
export function localDayOf(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export type AuditLogViewFilters = {
  search: string;
  action: string;
  adminId: string;
  entityType: string;
  from: string;
  to: string;
};

export const DEFAULT_AUDIT_FILTERS: AuditLogViewFilters = {
  search: "",
  action: "all",
  adminId: "all",
  entityType: "all",
  from: "",
  to: "",
};

export function hasActiveAuditFilters(filters: AuditLogViewFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.action !== "all" ||
    filters.adminId !== "all" ||
    filters.entityType !== "all" ||
    filters.from !== "" ||
    filters.to !== ""
  );
}

/**
 * Filtering is done here (not via getAuditLogs' fromDate/toDate) because
 * those compare raw UTC ISO strings, so a "to" date would exclude the
 * whole of that day and day boundaries would ignore the admin's timezone.
 */
export function filterAuditLogs(
  entries: AuditLogEntry[],
  filters: AuditLogViewFilters,
): AuditLogEntry[] {
  const query = filters.search.trim().toLowerCase();
  const swap = filters.from && filters.to && filters.from > filters.to;
  const from = swap ? filters.to : filters.from;
  const to = swap ? filters.from : filters.to;

  return entries.filter((entry) => {
    if (filters.action !== "all" && entry.action !== filters.action) {
      return false;
    }

    if (filters.adminId !== "all" && entry.adminId !== filters.adminId) {
      return false;
    }

    if (filters.entityType !== "all" && entry.entityType !== filters.entityType) {
      return false;
    }

    if (from || to) {
      const day = localDayOf(entry.createdAt);

      if (!day || (from && day < from) || (to && day > to)) {
        return false;
      }
    }

    if (query) {
      const haystack =
        `${entry.adminName} ${entry.description} ${entry.entityLabel ?? ""} ${entry.entityId} ${entry.entityType} ${entry.action}`.toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
