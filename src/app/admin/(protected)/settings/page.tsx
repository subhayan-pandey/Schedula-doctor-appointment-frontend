import type { Metadata } from "next";

import AdminSettings from "@/features/admin-settings/components/AdminSettings";

export const metadata: Metadata = {
  title: "Settings | Schedula Admin",
};

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
