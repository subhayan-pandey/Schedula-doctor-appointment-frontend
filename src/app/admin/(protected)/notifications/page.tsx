import type { Metadata } from "next";

import AdminNotificationsList from "@/features/admin-notifications/components/AdminNotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Schedula Admin",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsList />;
}
