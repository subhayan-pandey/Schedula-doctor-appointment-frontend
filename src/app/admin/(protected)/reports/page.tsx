import type { Metadata } from "next";

import AdminReports from "@/features/admin-reports/components/AdminReports";

export const metadata: Metadata = {
  title: "Reports | Schedula Admin",
};

export default function AdminReportsPage() {
  return <AdminReports />;
}
