import type {
  AuditLogEntry,
  AuditLogInput,
} from "@/types/admin/audit-log";

const AUDIT_LOG_KEY = "schedula:admin-audit-logs";

const AUDIT_LOG_UPDATED_EVENT = "schedula:admin-audit-log-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAuditLogUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUDIT_LOG_UPDATED_EVENT));
}

function generateAuditLogId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAuditLogEntry(value: unknown): value is AuditLogEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<AuditLogEntry>;

  return (
    typeof entry.id === "string" &&
    typeof entry.adminId === "string" &&
    typeof entry.adminName === "string" &&
    typeof entry.action === "string" &&
    typeof entry.entityType === "string" &&
    typeof entry.entityId === "string" &&
    typeof entry.description === "string" &&
    typeof entry.createdAt === "string"
  );
}

function readAuditLogs(): AuditLogEntry[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(AUDIT_LOG_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isAuditLogEntry);
  } catch {
    return [];
  }
}

function writeAuditLogs(entries: AuditLogEntry[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(entries));

  emitAuditLogUpdated();
}

/**
 * Records an admin action to the audit trail. Every write-action performed
 * from the Admin Portal (activate/deactivate, approve/reject, hide/remove,
 * send notification, settings change, login/logout, export, etc.) should
 * call this so Phase 5's Audit Logs screen has a complete history from
 * day one, instead of being retrofitted later.
 */
export function logAdminAction(input: AuditLogInput): AuditLogEntry {
  const entry: AuditLogEntry = {
    ...input,
    id: generateAuditLogId(),
    createdAt: new Date().toISOString(),
  };

  const existing = readAuditLogs();

  writeAuditLogs([entry, ...existing]);

  return entry;
}

export type AuditLogFilter = {
  adminId?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditLogEntry["action"];
  query?: string;
  fromDate?: string;
  toDate?: string;
};

/**
 * Returns audit log entries, newest first, optionally narrowed by filter.
 * `query` matches against adminName, description and entityLabel.
 */
export function getAuditLogs(filter?: AuditLogFilter): AuditLogEntry[] {
  const entries = readAuditLogs().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (!filter) {
    return entries;
  }

  const normalizedQuery = filter.query?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (filter.adminId && entry.adminId !== filter.adminId) {
      return false;
    }

    if (filter.entityType && entry.entityType !== filter.entityType) {
      return false;
    }

    if (filter.entityId && entry.entityId !== filter.entityId) {
      return false;
    }

    if (filter.action && entry.action !== filter.action) {
      return false;
    }

    if (filter.fromDate && entry.createdAt < filter.fromDate) {
      return false;
    }

    if (filter.toDate && entry.createdAt > filter.toDate) {
      return false;
    }

    if (normalizedQuery) {
      const haystack = `${entry.adminName} ${entry.description} ${
        entry.entityLabel ?? ""
      }`.toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

/** Convenience helper for an entity's detail view (e.g. one doctor's history). */
export function getAuditLogsForEntity(
  entityType: string,
  entityId: string,
): AuditLogEntry[] {
  return getAuditLogs({ entityType, entityId });
}
