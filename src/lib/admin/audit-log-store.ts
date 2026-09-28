import type { AuditLogEntry, AuditLogInput } from "@/types/admin/audit-log";
import { getSharedCollection, updateSharedCollection, emitLegacyViewEvent } from "@/lib/redux-data";
const all = () => getSharedCollection<AuditLogEntry>("auditLogs");
const id = () => `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export function logAdminAction(input: AuditLogInput): AuditLogEntry { const entry = { ...input, id: id(), createdAt: new Date().toISOString() }; updateSharedCollection<AuditLogEntry>("auditLogs", (items) => [entry, ...items]); emitLegacyViewEvent("schedula:admin-audit-log-updated"); return entry; }
export type AuditLogFilter = { adminId?: string; entityType?: string; entityId?: string; action?: AuditLogEntry["action"]; query?: string; fromDate?: string; toDate?: string };
export function getAuditLogs(filter?: AuditLogFilter): AuditLogEntry[] {
  const entries = [...all()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)); if (!filter) return entries;
  const query = filter.query?.trim().toLowerCase();
  return entries.filter((e) => (!filter.adminId || e.adminId === filter.adminId) && (!filter.entityType || e.entityType === filter.entityType) && (!filter.entityId || e.entityId === filter.entityId) && (!filter.action || e.action === filter.action) && (!filter.fromDate || e.createdAt >= filter.fromDate) && (!filter.toDate || e.createdAt <= filter.toDate) && (!query || `${e.adminName} ${e.description} ${e.entityLabel ?? ""}`.toLowerCase().includes(query)));
}
export function getAuditLogsForEntity(entityType: string, entityId: string): AuditLogEntry[] { return getAuditLogs({ entityType, entityId }); }
