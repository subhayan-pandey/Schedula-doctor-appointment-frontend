import type { Metadata } from "next";

import AdminAuditLogs from "@/features/admin-audit-logs/components/AdminAuditLogs";

export const metadata: Metadata = {
  title: "Audit Logs | Schedula Admin",
};

export default function AdminAuditLogsPage() {
  return <AdminAuditLogs />;
}
