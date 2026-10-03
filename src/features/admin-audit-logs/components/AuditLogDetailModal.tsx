"use client";

import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";

import {
  formatAuditDateTime,
  getAuditActionLabel,
  getAuditActionTone,
  getEntityTypeLabel,
} from "@/lib/admin/audit-logs";

import type { AuditLogEntry } from "@/types/admin/audit-log";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 break-words text-sm text-[var(--ink)]">{value}</p>
    </div>
  );
}

function stringifyDetail(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(stringifyDetail).join(", ") : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

type AuditLogDetailModalProps = {
  entry: AuditLogEntry | null;
  open: boolean;
  onClose: () => void;
};

export default function AuditLogDetailModal({
  entry,
  open,
  onClose,
}: AuditLogDetailModalProps) {
  if (!entry) {
    return null;
  }

  const details = Object.entries(entry.details ?? {});

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Audit log entry">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={getAuditActionLabel(entry.action)}
            tone={getAuditActionTone(entry.action)}
            withDot
          />
          <span className="text-xs text-[var(--muted)]">
            {formatAuditDateTime(entry.createdAt)}
          </span>
        </div>

        <p className="text-sm leading-6 text-[var(--ink)]">
          {entry.description}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Admin" value={entry.adminName} />
          <DetailRow label="Admin ID" value={entry.adminId} />
          <DetailRow
            label="Affected entity"
            value={entry.entityLabel || entry.entityId}
          />
          <DetailRow
            label="Entity type"
            value={getEntityTypeLabel(entry.entityType)}
          />
          <DetailRow label="Entity ID" value={entry.entityId} />
          <DetailRow label="Log ID" value={entry.id} />
        </div>

        {details.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Additional details
            </p>

            <dl className="mt-2 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
              {details.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-1 px-4 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-3"
                >
                  <dt className="text-xs font-medium text-[var(--muted)]">
                    {key}
                  </dt>
                  <dd className="break-words text-sm text-[var(--ink)]">
                    {stringifyDetail(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </Modal>
  );
}
