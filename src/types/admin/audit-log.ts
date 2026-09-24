export type AuditLogAction =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "send"
  | "export"
  | "other";

export type AuditLogEntry = {
  id: string;
  adminId: string;
  adminName: string;
  action: AuditLogAction;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  description: string;
  details?: Record<string, unknown>;
  createdAt: string;
};

export type AuditLogInput = Omit<AuditLogEntry, "id" | "createdAt">;
